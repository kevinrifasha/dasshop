import { useRef } from "react";
import { responsive } from "../reusables/responsive";

export default function Login(){
    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);

    function makeResponsive(big, small) {
        return responsive(windowWidth.current, big, small);
    } 
    function validatePhone(phone) {
        var re = RegExp("^((08|622|628)[0-9]{9,14})$");
        return re.test(phone);
      }
    return(<>
    
    </>)
}