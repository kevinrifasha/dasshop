import { useRef } from "react";
import { colorWay } from "../reusables/colorWay";
import { responsive } from "../reusables/responsive";
import { asset } from "../reusables/useAsset";
import Navbar from "../components/Navbar";

export default function Onboarding(){
    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);

    function makeResponsive(big, small) {
        return responsive(windowWidth.current, big, small);
    }
    return(
        <div
        style={{
            backgroundColor: colorWay.hijauBg,
            minHeight: "100vh",
            minWidth: "100vw",
        }}
    >
        
         <div
                    style={{
                        backgorundColor: colorWay.putih,
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        alignSelf: "flex-start",
                        justifyContent: "center",
                        marginTop: "0vh",
                        paddingTop:"25vh",
                        marginBottom: "15vh",
                    }}
                >
                    <img
                        src={responsive(windowWidth.current, asset("sukhabundle"), asset("sukhabundle"))}
                        style={{ width: responsive(windowWidth.current, "65vw", "80vw") }}
                    />
                        <button
                                      style={{
                    height: makeResponsive("10vh", "7vh"),
                    width: "auto",
                    marginTop: makeResponsive("2vh", "1vh"),
                    backgroundColor: "transparent",
                    outline: "none",
                    border: "none",
                  }}

                  onClick={(e) => {
                
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit" }} src={asset("beli")} />
                </button>
                    </div>

    </div>
    )
}