import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { asset as useAsset } from '../reusables/useAsset'
import { responsive } from '../reusables/responsive';

export default function DatePicker({setter, setted, name, clientWidth}){

    function makeResponsive(big, small){
        return responsive(clientWidth, big, small)
    }

    const styleObject = {
        display:"flex", 
        flexWrap:"wrap", 
        alignSelf:"flex-start", 
        justifyContent:"center"
    }

    return (
        <div style={{width:"100%",...styleObject}}>
            <div style={{width:"15%", textAlign:"left"}}>
                <p style={{
                    fontFamily:"sergioTrendy",
                    color:"black",
                    fontSize:makeResponsive("4vh", "1.5vh")
                }}>{name}<span style={{fontFamily:"gentyDemo"}}></span></p>
            </div>
            <div style={{width:"85%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center"}}>
                <div style={{
                    backgroundColor:"transparent",backgroundImage:`url(${useAsset("textFieldSmall")})`, backgroundSize:"96% 100%", backgroundRepeat:"no-repeat", 
                    width:"100%", marginLeft:"2vw", border:"none", fontSize:makeResponsive("4vh", "1.5vh"), fontFamily:"montserratRegular", color:"white",
                    paddingLeft:"3vw", paddingRight:"1vw", height:makeResponsive("8vh", "4vh")
                }}> 
                    <ReactDatePicker 
                        selected={setted} 
                        onChange={(date) => {
                            setter(date)
                        }}
                        maxDate={new Date()}
                        onFocus={e => e.target.blur()}
                        dateFormat="dd MMMM yyy"
                        disabledKeyboardNavigation={true}
                        customInput={
                            <input 
                                onFocus={e => {
                                    e.preventDefault()
                                    e.target.blur()
                                }}
                                onBeforeInput={(e) => {
                                    e.preventDefault();
                                    e.target.blur()
                                }}
                                disabled={true}
                                inputMode='none'
                                style={{backgroundColor:"transparent", color:"white", border:"none", width:"80%", fontSize:makeResponsive("4vh", "1.5vh"), paddingTop:makeResponsive("1.75vh", "1.1vh")}}/>
                        }
                        withPortal
                        fixedHeight
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown={true}
                        showYearDropdown
                        showMonthDropdown
                    />
                </div>
            </div>
        </div>
    )
}