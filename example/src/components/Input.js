import { responsive } from '../reusables/responsive'
import { asset as useAsset } from '../reusables/useAsset'

export default function Input({name, setter, setted, type, clientWidth}){
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
            }}>{name}<span style={{fontFamily:"gentyDemo"}}>*</span></p>
        </div>
        <div style={{width:"85%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"flex-start"}}>
            {/* <input type="text" style={{backgroundColor:colorWay.rona ,width:"100%", height:"5vh", borderRadius:"50px", borderWidth:"1px", borderStyle:"double", marginRight:"2vw", marginLeft:"2vw"}}/> */}
            <input 
                type={type ? type : "text"}
                value={setted}
                onChange={(e) => setter(prev => e.target.value)} 
                style={{
                    backgroundColor:"transparent",backgroundImage:`url(${useAsset("textFieldSmall")})`, backgroundSize:"100% 100%", backgroundRepeat:"no-repeat", 
                    width:"100%", marginRight:"2vw", marginLeft:"2vw", border:"none", fontSize:makeResponsive("4vh", "1.5vh"), fontFamily:"montserratRegular", color:"white",
                    paddingLeft:"3vw", paddingRight:"2vw", height:makeResponsive("8vh", "4vh")
                }}
            />
        </div>
    </div>
    )
}