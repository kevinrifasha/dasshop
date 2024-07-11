import fileDownload from "js-file-download"
import { responsive } from "../reusables/responsive"

import axios from "axios"
import { colorWay } from "../reusables/colorWay"
import { fontString } from "../reusables/font"

const DownloadButton = props => {
    function makeResponsive(big, small){
        return responsive(props.current, big, small)
    }

    const handleDownload = (url, filename) => {
        axios.get(url, {
          responseType: 'blob',
        })
        .then((res) => {
          fileDownload(res.data, filename)
        })
    }

    return (
            <button
                onClick={() => {handleDownload(props.link, 'Sukhakala_GIF.mp4')}}
                style={{
                    width: "auto",
                    height: "auto",
                    minHeight:makeResponsive("12vh","2vh"),
                    fontSize:makeResponsive("6vh", "2vh"),
                    paddingRight:"2vw",
                    paddingLeft:"2vw",
                    paddingTop:makeResponsive("2vh", "1vh"),
                    marginTop:"3vh",
                    // width: "auto",
                    color:"black",
                    borderRadius:"3vh",
                    backgroundColor: colorWay.hijauTeh,
                    fontFamily: fontString.gentyDemo
                }}
                disabled = {false}
            >
                Download
            </button>
    )
}
export default DownloadButton;