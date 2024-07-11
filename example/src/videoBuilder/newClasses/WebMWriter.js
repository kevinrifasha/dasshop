import ArrayBufferDataStream from "./ArrayBufferDataStream";
import BlobBuffer from "./BlobBuffer";

function extend(base, top) {
  let
      target = {};
  
  [base, top].forEach(function(obj) {
      for (let prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              target[prop] = obj[prop];
          }
      }
  });
  
  return target;
}

/**
 * Decode a Base64 data URL into a binary string.
 *
 * @return {String} The binary string
 */
function decodeBase64WebPDataURL(url) {

  if (typeof url !== "string" || !url.match(/^data:image\/webp;base64,/i)) {
      throw new Error("Failed to decode WebP Base64 URL");
  }
  
  return window.atob(url.substring("data:image\/webp;base64,".length));
}

/**
 * Convert the given canvas to a WebP encoded image and return the image data as a string.
 *
 * @return {String}
 */
function renderAsWebP(canvas, quality) {

  let frame = ""

  if(typeof canvas === 'string' && /^data:image\/webp/.test(canvas)){
    frame = canvas

  } else {
    frame = canvas.toDataURL('image/webp', quality);

  }

  return decodeBase64WebPDataURL(frame);
}

/**
 * @param {String} string
 * @returns {number}
 */
function byteStringToUint32LE(string) {
  let
      a = string.charCodeAt(0),
      b = string.charCodeAt(1),
      c = string.charCodeAt(2),
      d = string.charCodeAt(3);

  return (a | (b << 8) | (c << 16) | (d << 24)) >>> 0;
}

/**
 * Extract a VP8 keyframe from a WebP image file.
 *
 * @param {String} webP - Raw binary string
 *
 * @returns {{hasAlpha: boolean, frame: string}}
 */
function extractKeyframeFromWebP(webP) {
  let cursor = webP.indexOf('VP8', 12); // Start the search after the 12-byte file header

  if (cursor === -1) {
      throw new Error("Bad image format, does this browser support WebP?");
  }
  
  let hasAlpha = false;

  /* Cursor now is either directly pointing at a "VP8 " keyframe, or a "VP8X" extended format file header
    * Seek through chunks until we find the "VP8 " chunk we're interested in
    */
  while (cursor < webP.length - 8) {
      
      let chunkLength, fourCC;
      
      fourCC = webP.substring(cursor, cursor + 4);
      
      cursor += 4;
      
      chunkLength = byteStringToUint32LE(webP.substring(cursor, cursor + 4));
      cursor += 4;
      
      switch (fourCC) {
          case "VP8 ":
              return {
                frame: webP.substring(cursor, cursor + chunkLength),
                hasAlpha: hasAlpha
              };
              
          case "ALPH":
          hasAlpha = true;
          /* But we otherwise ignore the content of the alpha chunk, since we don't have a decoder for it
            * and it isn't VP8-compatible
            */
          break;
      }
      
      cursor += chunkLength;
      
      if ((chunkLength & 0x01) !== 0) {
          cursor++;
          // Odd-length chunks have 1 byte of trailing padding that isn't included in their length
      }
  }
  
  throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
}

// Just a little utility so we can tag values as floats for the EBML encoder's benefit
// function EBMLFloat32(value) {
//     this.value = value;
// }

class EBMLFloat32 {
constructor(value) {
  this.value = value;
}
}

// function EBMLFloat64(value) {
//     this.value = value;
// }

class EBMLFloat64 {
constructor(value) {
  this.value = value;
}
}

/**
 * Write the given EBML object to the provided ArrayBufferStream.
 *
 * @param buffer
 * @param {Number} bufferFileOffset - The buffer's first byte is at this position inside the video file.
 *                                    This is used to complete offset and dataOffset fields in each EBML structure,
 *                                    indicating the file offset of the first byte of the EBML element and
 *                                    its data payload.
 * @param {*} ebml
 */
function writeEBML(buffer, bufferFileOffset, ebml) {
  // Is the ebml an array of sibling elements?
  if (Array.isArray(ebml)) {
      for (let i = 0; i < ebml.length; i++) {
          writeEBML(buffer, bufferFileOffset, ebml[i]);
      }
      // Is this some sort of raw data that we want to write directly?
  } else if (typeof ebml === "string") {
      buffer.writeString(ebml);
  } else if (ebml instanceof Uint8Array) {
      buffer.writeBytes(ebml);
  } else if (ebml.id){
      // We're writing an EBML element
      ebml.offset = buffer.pos + bufferFileOffset;
      
      buffer.writeUnsignedIntBE(ebml.id); // ID field
      
      // Now we need to write the size field, so we must know the payload size:
      
      if (Array.isArray(ebml.data)) {
          // Writing an array of child elements. We won't try to measure the size of the children up-front
          
          let
              sizePos, dataBegin, dataEnd;
          
          if (ebml.size === -1) {
              // Write the reserved all-one-bits marker to note that the size of this element is unknown/unbounded
              buffer.writeByte(0xFF);
          } else {
              sizePos = buffer.pos;
              
              /* Write a dummy size field to overwrite later. 4 bytes allows an element maximum size of 256MB,
      * which should be plenty (we don't want to have to buffer that much data in memory at one time
      * anyway!)
      */
              buffer.writeBytes([0, 0, 0, 0]);
          }
          
          dataBegin = buffer.pos;
          
          ebml.dataOffset = dataBegin + bufferFileOffset;
          writeEBML(buffer, bufferFileOffset, ebml.data);
          
          if (ebml.size !== -1) {
              dataEnd = buffer.pos;
              
              ebml.size = dataEnd - dataBegin;
              
              buffer.seek(sizePos);
              buffer.writeEBMLVarIntWidth(ebml.size, 4); // Size field
              
              buffer.seek(dataEnd);
          }
      } else if (typeof ebml.data === "string") {
          buffer.writeEBMLVarInt(ebml.data.length); // Size field
          ebml.dataOffset = buffer.pos + bufferFileOffset;
          buffer.writeString(ebml.data);
      } else if (typeof ebml.data === "number") {
          // Allow the caller to explicitly choose the size if they wish by supplying a size field
          if (!ebml.size) {
              ebml.size = buffer.measureUnsignedInt(ebml.data);
          }
          
          buffer.writeEBMLVarInt(ebml.size); // Size field
          ebml.dataOffset = buffer.pos + bufferFileOffset;
          buffer.writeUnsignedIntBE(ebml.data, ebml.size);
      } else if (ebml.data instanceof EBMLFloat64) {
          buffer.writeEBMLVarInt(8); // Size field
          ebml.dataOffset = buffer.pos + bufferFileOffset;
          buffer.writeDoubleBE(ebml.data.value);
      } else if (ebml.data instanceof EBMLFloat32) {
          buffer.writeEBMLVarInt(4); // Size field
          ebml.dataOffset = buffer.pos + bufferFileOffset;
          buffer.writeFloatBE(ebml.data.value);
      } else if (ebml.data instanceof Uint8Array) {
          buffer.writeEBMLVarInt(ebml.data.byteLength); // Size field
          ebml.dataOffset = buffer.pos + bufferFileOffset;
          buffer.writeBytes(ebml.data);
      } else {
          throw new Error("Bad EBML datatype " + typeof ebml.data);
      }
  } else {
      throw new Error("Bad EBML datatype " + typeof ebml.data);
  }
}

/**
 * @typedef {Object} Frame
 * @property {string} frame - Raw VP8 keyframe data
 * @property {string} alpha - Raw VP8 keyframe with alpha represented as luminance
 * @property {Number} duration
 * @property {Number} trackNumber - From 1 to 126 (inclusive)
 * @property {Number} timecode
 */

/**
 * @typedef {Object} Cluster
 * @property {Number} timecode - Start time for the cluster
 */

/**
 * @param ArrayBufferDataStream - Imported library
 * @param BlobBuffer - Imported library
 *
 * @returns WebMWriter
 *
 * @constructor
 */

export default class WebMWriter {

  constructor(options) {
      this.MAX_CLUSTER_DURATION_MSEC = 5000;
      this.DEFAULT_TRACK_NUMBER = 1;
      this.writtenHeader = false;
      this.videoWidth = 0;
      this.videoHeight = 0;

      /**
       * @type {[HTMLCanvasElement]}
       */
      this.alphaBuffer = null;
  
      /**
       * @type {[CanvasRenderingContext2D]}
       */
      this.alphaBufferContext = null;
  
      /**
       * @type {[ImageData]}
       */
      this.alphaBufferData = null;
  
      /**
       * @type {Frame[]}
       */
      this.clusterFrameBuffer = [];
      this.clusterStartTime = 0;
      this.clusterDuration = 0;
      
      this.optionDefaults = {
        quality: 0.95,
        transparent: false,
        alphaQuality: undefined,
        fileWriter: null,
        fd: null,
        frameDuration: null,
        frameRate: null,
      };
  
      this.seekPoints = {
        Cues: { id: new Uint8Array([0x1C, 0x53, 0xBB, 0x6B]), positionEBML: null },
        SegmentInfo: { id: new Uint8Array([0x15, 0x49, 0xA9, 0x66]), positionEBML: null },
        Tracks: { id: new Uint8Array([0x16, 0x54, 0xAE, 0x6B]), positionEBML: null },
      };
      
      this.ebmlSegment = null; // Root element of the EBML document
  
      this.segmentDuration = {
        id: 0x4489, // Duration
        data: new EBMLFloat64(0), // You need to define the EBMLFloat64 constructor
      };
  
      this.seekHead = null;
  
      this.cues = [];
  
      this.blobBuffer = new BlobBuffer(this.options?.fileWriter || this.options?.fd);

      this.options = extend(this.optionDefaults, options || {});
      this.validateOptions();
  }

  fileOffsetToSegmentRelative(fileOffset) {
      return fileOffset - this.ebmlSegment.dataOffset;
  }

  convertAlphaToGrayscaleImage(source) {
      if (this.alphaBuffer === null || this.alphaBuffer.width !== source.width || this.alphaBuffer.height !== source.height) {
        this.alphaBuffer = document.createElement("canvas");
        this.alphaBuffer.width = source.width;
        this.alphaBuffer.height = source.height;

        this.alphaBufferContext = this.alphaBuffer.getContext("2d");
        this.alphaBufferData = this.alphaBufferContext.createImageData(this.alphaBuffer.width, this.alphaBuffer.height);
      }

      let sourceContext = source.getContext("2d");
      let sourceData = sourceContext.getImageData(0, 0, source.width, source.height).data;
      let destData = this.alphaBufferData.data;
      let dstCursor = 0;
      let srcEnd = source.width * source.height * 4;

      for (let srcCursor = 3 /* Since pixel byte order is RGBA */; srcCursor < srcEnd; srcCursor += 4) {
        let alpha = sourceData[srcCursor];

        // Turn the original alpha channel into a brightness value (ends up being the Y in YUV)
        destData[dstCursor++] = alpha;
        destData[dstCursor++] = alpha;
        destData[dstCursor++] = alpha;
        destData[dstCursor++] = 255;
      }

      this.alphaBufferContext.putImageData(this.alphaBufferData, 0, 0);

      return this.alphaBuffer;
  };

  createSeekHead() {
      let seekPositionEBMLTemplate = {
          "id": 0x53AC, // SeekPosition
          "size": 5, // Allows for 32GB video files
          "data": 0 // We'll overwrite this when the file is complete
      };
  
      let result = {
          "id": 0x114D9B74, // SeekHead
          "data": []
      };
  
      for (let name in this.seekPoints) {
          let seekPoint = this.seekPoints[name];
  
          seekPoint.positionEBML = Object.create(seekPositionEBMLTemplate);
  
          result.data.push({
          "id": 0x4DBB, // Seek
          "data": [
              {
              "id": 0x53AB, // SeekID
              "data": seekPoint.id
              },
              seekPoint.positionEBML
          ]
          });
      }
  
      return result;
  };

  writeHeader() {
      this.seekHead = this.createSeekHead();
      
      let ebmlHeader = {
        "id": 0x1a45dfa3, // EBML
        "data": [
          {
            "id": 0x4286, // EBMLVersion
            "data": 1
          },
          {
            "id": 0x42f7, // EBMLReadVersion
            "data": 1
          },
          {
            "id": 0x42f2, // EBMLMaxIDLength
            "data": 4
          },
          {
            "id": 0x42f3, // EBMLMaxSizeLength
            "data": 8
          },
          {
            "id": 0x4282, // DocType
            "data": "webm"
          },
          {
            "id": 0x4287, // DocTypeVersion
            "data": 2
          },
          {
            "id": 0x4285, // DocTypeReadVersion
            "data": 2
          }
        ]
      };
      
      let segmentInfo = {
        "id": 0x1549a966, // Info
        "data": [
          {
            "id": 0x2ad7b1, // TimecodeScale
            "data": 1e6 // Times will be in milliseconds (1e6 nanoseconds per step = 1ms)
          },
          {
            "id": 0x4d80, // MuxingApp
            "data": "webm-writer-js",
          },
          {
            "id": 0x5741, // WritingApp
            "data": "webm-writer-js"
          },
          this.segmentDuration // To be filled in later
        ]
      };
      
      let videoProperties = [
        {
          "id": 0xb0, // PixelWidth
          "data": this.videoWidth
        },
        {
          "id": 0xba, // PixelHeight
          "data": this.videoHeight
        }
      ];
      
      if (this.options.transparent) {
        videoProperties.push(
          {
            "id": 0x53C0, // AlphaMode
            "data": 1
          }
        );
      }
      
      let tracks = {
        "id": 0x1654ae6b, // Tracks
        "data": [
          {
            "id": 0xae, // TrackEntry
            "data": [
              {
                "id": 0xd7, // TrackNumber
                "data": this.DEFAULT_TRACK_NUMBER
              },
              {
                "id": 0x73c5, // TrackUID
                "data": this.DEFAULT_TRACK_NUMBER
              },
              {
                "id": 0x9c, // FlagLacing
                "data": 0
              },
              {
                "id": 0x22b59c, // Language
                "data": "und"
              },
              {
                "id": 0x86, // CodecID
                "data": "V_VP8"
              },
              {
                "id": 0x258688, // CodecName
                "data": "VP8"
              },
              {
                "id": 0x83, // TrackType
                "data": 1
              },
              {
                "id": 0xe0,  // Video
                "data": videoProperties
              }
            ]
          }
        ]
      };
      
      this.ebmlSegment = {
        "id": 0x18538067, // Segment
        "size": -1, // Unbounded size
        "data": [
          this.seekHead,
          segmentInfo,
          tracks,
        ]
      };

      let bufferStream = new ArrayBufferDataStream(256);
      
      writeEBML(bufferStream, this.blobBuffer.pos, [ebmlHeader, this.ebmlSegment]);
      this.blobBuffer.write(bufferStream.getAsDataArray());
      
      // Now we know where these top-level elements lie in the file:
      this.seekPoints.SegmentInfo.positionEBML.data = this.fileOffsetToSegmentRelative(segmentInfo.offset);
      this.seekPoints.Tracks.positionEBML.data = this.fileOffsetToSegmentRelative(tracks.offset);
      
      this.writtenHeader = true;

  };
  

  createBlockGroupForTransparentKeyframe(keyframe) {
      let block, blockAdditions;
  
      const bufferStream = new ArrayBufferDataStream(1 + 2 + 1);
  
      // Create a Block to hold the image data:
      if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
        throw new Error("TrackNumber must be > 0 and < 127");
      }
  
      bufferStream.writeEBMLVarInt(keyframe.trackNumber); // Always 1 byte since we limit the range of trackNumber
      bufferStream.writeU16BE(keyframe.timecode);
      bufferStream.writeByte(0); // Flags byte
  
      block = {
        "id": 0xA1, // Block
        "data": [
          bufferStream.getAsDataArray(),
          keyframe.frame
        ]
      };
  
      blockAdditions = {
        "id": 0x75A1, // BlockAdditions
        "data": [
          {
            "id": 0xA6, // BlockMore
            "data": [
              {
                "id": 0xEE, // BlockAddID
                "data": 1   // Means "BlockAdditional has a codec-defined meaning, pass it to the codec"
              },
              {
                "id": 0xA5, // BlockAdditional
                "data": keyframe.alpha // The actual alpha channel image
              }
            ]
          }
        ]
      };
  
      return {
        "id": 0xA0, // BlockGroup
        "data": [
          block,
          blockAdditions
        ]
      };
  }

  createSimpleBlockForKeyframe(keyframe) {
    const bufferStream = new ArrayBufferDataStream(1 + 2 + 1);

    if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
      throw new Error("TrackNumber must be > 0 and < 127");
    }

    bufferStream.writeEBMLVarInt(keyframe.trackNumber);
    bufferStream.writeU16BE(keyframe.timecode);

    bufferStream.writeByte(1 << 7); // Keyframe

    return {
      id: 0xA3, // SimpleBlock
      data: [
        bufferStream.getAsDataArray(),
        keyframe.frame,
      ],
    };
  }

  createContainerForKeyframe(keyframe) {
      if (keyframe.alpha) {
          return this.createBlockGroupForTransparentKeyframe(keyframe);
      }
      
      return this.createSimpleBlockForKeyframe(keyframe);
  }

  createCluster(cluster) {
      return {
          "id": 0x1f43b675,
          "data": [
                {
                  "id": 0xe7, // Timecode
                  "data": Math.round(cluster.timecode)
                }
          ]
      };
  }

  addCuePoint(trackIndex, clusterTime, clusterFileOffset) {
      this.cues.push({
          "id": 0xBB, // Cue
          "data": [
                {
                    "id": 0xB3, // CueTime
                    "data": clusterTime
                },
                {
                    "id": 0xB7, // CueTrackPositions
                    "data": [
                        {
                            "id": 0xF7, // CueTrack
                            "data": trackIndex
                        },
                        {
                            "id": 0xF1, // CueClusterPosition
                            "data": this.fileOffsetToSegmentRelative(clusterFileOffset)
                        }
                    ]
                }
          ]
      });
  }

  writeCues() {
      let
          ebml = {
              "id": 0x1C53BB6B,
              "data": this.cues
          },
          
          cuesBuffer = new ArrayBufferDataStream(16 + this.cues.length * 32); // Pretty crude estimate of the buffer size we'll need
      
      writeEBML(cuesBuffer, this.blobBuffer.pos, ebml);
      this.blobBuffer.write(cuesBuffer.getAsDataArray());
      
      // Now we know where the Cues element has ended up, we can update the SeekHead
      this.seekPoints.Cues.positionEBML.data = this.fileOffsetToSegmentRelative(ebml.offset);
  }

  flushClusterFrameBuffer() {
      if (this.clusterFrameBuffer.length === 0) {
        return;
      }
  
      // First work out how large of a buffer we need to hold the cluster data
      let rawImageSize = 0;
  
      for (let i = 0; i < this.clusterFrameBuffer.length; i++) {
        rawImageSize += this.clusterFrameBuffer[i].frame.length + (this.clusterFrameBuffer[i].alpha ? this.clusterFrameBuffer[i].alpha.length : 0);
      }
  
      let buffer = new ArrayBufferDataStream(rawImageSize + this.clusterFrameBuffer.length * 64); // Estimate 64 bytes per block header
  
      const cluster = this.createCluster({
        timecode: Math.round(this.clusterStartTime),
      });
  
      for (let i = 0; i < this.clusterFrameBuffer.length; i++) {
        cluster.data.push(this.createContainerForKeyframe(this.clusterFrameBuffer[i]));
      }
  
      writeEBML(buffer, this.blobBuffer.pos, cluster);
      this.blobBuffer.write(buffer.getAsDataArray());
  
      this.addCuePoint(this.DEFAULT_TRACK_NUMBER, Math.round(this.clusterStartTime), cluster.offset);
  
      this.clusterFrameBuffer = [];
      this.clusterStartTime += this.clusterDuration;
      this.clusterDuration = 0;
  }

  validateOptions() {
      // Derive frameDuration setting if not already supplied
      if (!this.options.frameDuration) {
        if (this.options.frameRate) {
          this.options.frameDuration = 1000 / this.options.frameRate;
        } else {
          throw new Error("Missing required frameDuration or frameRate setting");
        }
      }
  
      // Avoid 1.0 (lossless) because it creates VP8L lossless frames that WebM doesn't support
      this.options.quality = Math.max(Math.min(this.options.quality, 0.99999), 0);
  
      if (this.options.alphaQuality === undefined) {
        this.options.alphaQuality = this.options.quality;
      } else {
        this.options.alphaQuality = Math.max(Math.min(this.options.alphaQuality, 0.99999), 0);
      }
  }

  addFrameToCluster(frame) {
      frame.trackNumber = this.DEFAULT_TRACK_NUMBER;
  
      // Frame timecodes are relative to the start of their cluster:
      frame.timecode = Math.round(this.clusterDuration);
  
      this.clusterFrameBuffer.push(frame);
  
      this.clusterDuration += frame.duration;
  
      if (this.clusterDuration >= this.MAX_CLUSTER_DURATION_MSEC) {
        this.flushClusterFrameBuffer();
      }
  }

  rewriteSeekHead() {
      let seekHeadBuffer = new ArrayBufferDataStream(this.seekHead.size);
      let oldPos = this.blobBuffer.pos;
  
      // Write the rewritten SeekHead element's data payload to the stream (don't need to update the id or size)
      writeEBML(seekHeadBuffer, this.seekHead.dataOffset, this.seekHead.data);
  
      // And write that through to the file
      this.blobBuffer.seek(this.seekHead.dataOffset);
      this.blobBuffer.write(seekHeadBuffer.getAsDataArray());
  
      this.blobBuffer.seek(oldPos);
  }

  rewriteDuration() {
      let buffer = new ArrayBufferDataStream(8);
      let oldPos = this.blobBuffer.pos;
  
      // Rewrite the data payload (don't need to update the id or size)
      buffer.writeDoubleBE(this.clusterStartTime);
  
      // And write that through to the file
      this.blobBuffer.seek(this.segmentDuration.dataOffset);
      this.blobBuffer.write(buffer.getAsDataArray());
  
      this.blobBuffer.seek(oldPos);
  }

  addFrame(frame, alpha, overrideFrameDuration, canvas) {

      let preparedFrame = frame.includes("webp") ? frame : canvas

      if (!this.writtenHeader) {
          this.videoWidth = frame.width || 0;
          this.videoHeight = frame.height || 0;
  
          this.writeHeader();
      }
  
      let data = renderAsWebP(preparedFrame, this.options.quality)

      let keyframe = extractKeyframeFromWebP(data);

      let frameDuration;
      let frameAlpha = null;
  
      if (overrideFrameDuration) {
          frameDuration = overrideFrameDuration;
      } else if (typeof alpha == "number") {
          frameDuration = alpha;
      } else {
          frameDuration = this.options.frameDuration;
      }
  
      if (this.options.transparent) {
          if (alpha instanceof HTMLCanvasElement || typeof alpha === "string") {
          frameAlpha = alpha;
          } else if (keyframe.hasAlpha) {
          frameAlpha = this.convertAlphaToGrayscaleImage(frame);
          }
      }
  
      this.addFrameToCluster({
          frame: keyframe.frame,
          duration: frameDuration,
          alpha: frameAlpha
          ? extractKeyframeFromWebP(renderAsWebP(frameAlpha, this.options.alphaQuality))?.frame
          : null,
      });
  }
  

  complete() {
    if (!this.writtenHeader) {
      this.writeHeader();
    }

    this.flushClusterFrameBuffer();

    this.writeCues();
    this.rewriteSeekHead();
    this.rewriteDuration();

    return this.blobBuffer.complete('video/webm');
  }

  getWrittenSize() {
      return this.blobBuffer.length;
  }

}
