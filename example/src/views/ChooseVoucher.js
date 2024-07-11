import { useRef } from "react";
import { colorWay } from "../reusables/colorWay";
import { responsive } from "../reusables/responsive";
import { asset } from "../reusables/useAsset";
import Navbar from "../components/Navbar";
export default function ChooseVoucher(){
    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);

    function makeResponsive(big, small) {
        return responsive(windowWidth.current, big, small);
    }
    
    return(<>
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
                        // paddingTop:"25vh",
                        marginBottom: "15vh",
                    }}
                >
                    <img
                        src={responsive(windowWidth.current, asset("sukhabundle"), asset("sukhabundle"))}
                        style={{ width: responsive(windowWidth.current, "65vw", "80vw") }}
                    />
                   <div>
                   <img
                        src={responsive(windowWidth.current, asset("3voucher"), asset("3voucher"))}
                        style={{ width: responsive(windowWidth.current, "45vw", "60vw") ,
                        paddingTop:"10vh",
                        paddingLeft:"15vh",
                    }}
                    />
                        <button
                                      style={{
                    height: makeResponsive("7vh", "4vh"),
                    width: "auto",
                    marginTop: makeResponsive("5vh", "3vh"),
                    backgroundColor: "transparent",
                    marginTop:"-40vh",
                    marginLeft:"30vw",
                    paddingLeft:"3vh",
                    outline: "none",
                    border: "none",
                  }}

                  onClick={(e) => {
                
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit",
                    
                }} src={asset("3vocbtn")} />
                </button>
                    </div> 
                    <div>
                   <img
                        src={responsive(windowWidth.current, asset("3voucher"), asset("3voucher"))}
                        style={{ width: responsive(windowWidth.current, "45vw", "60vw") ,
                        paddingTop:"10vh",
                        paddingLeft:"15vh",
                    }}
                    />
                        <button
                                      style={{
                    height: makeResponsive("7vh", "4vh"),
                    width: "auto",
                    marginTop: makeResponsive("5vh", "3vh"),
                    backgroundColor: "transparent",
                    marginTop:"-40vh",
                    marginLeft:"30vw",
                    paddingLeft:"3vh",
                    outline: "none",
                    border: "none",
                  }}

                  onClick={(e) => {
                
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit",
                    
                }} src={asset("5vocbtn")} />
                </button>
                    </div> 
                                     
         </div>

    </div>
    </>)
}