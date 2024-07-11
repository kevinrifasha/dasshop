export default class BlobBuffer {
	constructor(fs, destination) {
	  this.buffer = [];
	  this.writePromise = Promise.resolve();
	  this.fileWriter = null;
	  this.fd = null;

	  if (destination && destination.constructor.name === "FileWriter") {
		this.fileWriter = destination;
	  } else if (fs && destination) {
		this.fd = destination;
	  }

	  this.pos = 0;
	  this.length = 0;
	}

	async readBlobAsBuffer(blob) {
	  return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("loadend", () => {
		  resolve(reader.result);
		});
		reader.readAsArrayBuffer(blob);
	  });
	}
  
	async convertToUint8Array(thing) {
	  if (thing instanceof Uint8Array) {
		return thing;
	  } else if (thing instanceof ArrayBuffer || ArrayBuffer.isView(thing)) {
		return new Uint8Array(thing);
	  } else if (thing instanceof Blob) {
		const buffer = await this.readBlobAsBuffer(thing);
		return new Uint8Array(buffer);
	  } else {
		const blob = new Blob([thing]);
		const buffer = await this.readBlobAsBuffer(blob);
		return new Uint8Array(buffer);
	  }
	}
  
	measureData(data) {
	  const result = data.byteLength || data.length || data.size;
	  if (!Number.isInteger(result)) {
		throw new Error("Failed to determine the size of the element");
	  }
	  return result;
	}
  
	seek(offset) {
	  if (offset < 0) {
		throw new Error("Offset may not be negative");
	  }
	  if (isNaN(offset)) {
		throw new Error("Offset may not be NaN");
	  }
	  if (offset > this.length) {
		throw new Error("Seeking beyond the end of the file is not allowed");
	  }
	  this.pos = offset;
	}
  
	async write(data) {
	  const newEntry = {
		offset: this.pos,
		data: data,
		length: this.measureData(data),
	  };
	  const isAppend = newEntry.offset >= this.length;
	  this.pos += newEntry.length;
	  this.length = Math.max(this.length, this.pos);
  
	  this.writePromise = this.writePromise.then(async () => {
		if (this.fd) {
		  const dataArray = await this.convertToUint8Array(newEntry.data);
		  const buffer = Buffer.from(dataArray.buffer);
  
		  return new Promise((resolve, reject) => {
			let totalWritten = 0;
  
			const handleWriteComplete = (err, written, buffer) => {
			  totalWritten += written;
			  if (totalWritten >= buffer.length) {
				resolve();
			  } else {
				this.fs.write(
				  this.fd,
				  buffer,
				  totalWritten,
				  buffer.length - totalWritten,
				  newEntry.offset + totalWritten,
				  handleWriteComplete
				);
			  }
			};
  
			this.fs.write(
			  this.fd,
			  buffer,
			  0,
			  buffer.length,
			  newEntry.offset,
			  handleWriteComplete
			);
		  });
		} else if (this.fileWriter) {
		  return new Promise((resolve, reject) => {
			this.fileWriter.onwriteend = resolve;
			this.fileWriter.seek(newEntry.offset);
			this.fileWriter.write(new Blob([newEntry.data]));
		  });
		} else if (!isAppend) {
		  for (let i = 0; i < this.buffer.length; i++) {
			const entry = this.buffer[i];
			if (
			  !(
				newEntry.offset + newEntry.length <= entry.offset ||
				newEntry.offset >= entry.offset + entry.length
			  )
			) {
			  if (
				newEntry.offset < entry.offset ||
				newEntry.offset + newEntry.length > entry.offset + entry.length
			  ) {
				throw new Error("Overwrite crosses blob boundaries");
			  }
			  if (newEntry.offset == entry.offset && newEntry.length == entry.length) {
				entry.data = newEntry.data;
			  } else {
				const entryArray = await this.convertToUint8Array(entry.data);
				entry.data = entryArray;
				const newEntryArray = await this.convertToUint8Array(newEntry.data);
				newEntry.data = newEntryArray;
				entry.data.set(newEntry.data, newEntry.offset - entry.offset);
			  }
			}
		  }
		}
  
		this.buffer.push(newEntry);
	  });
	}
  
	complete(mimeType) {
	  if (this.fd || this.fileWriter) {
		this.writePromise = this.writePromise.then(() => null);
	  } else {
		this.writePromise = this.writePromise.then(() => {
		  const result = this.buffer.map((entry) => entry.data);
		  return new Blob(result, { type: mimeType });
		});
	  }
  
	  return this.writePromise;
	}
  }