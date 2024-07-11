import { responsive } from '../reusables/responsive'
import { asset as useAsset } from '../reusables/useAsset'

export default function TextInput({setter, setted, clientWidth, name}){
    
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
        <div style={{width:"100%",...styleObject, marginTop:makeResponsive("4vh", "2vh")}}>
            <div style={{width:"100%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center"}}>
                <div style={{width:"100%", textAlign:"left"}}>
                    <p style={{
                        fontFamily:"sergioTrendy",
                        color:"black",
                        fontSize:makeResponsive("4vh", "1.5vh")
                    }}>{name}<span style={{fontFamily:"gentyDemo"}}>*</span></p>
                </div>
            </div>
            <div style={{width:"100%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center"}}>
                <textarea 
                    type="text"
                    value={setted}
                    onChange={(e) => setter(prev => e.target.value)} 
                    style={{
                        backgroundColor:"transparent",backgroundImage:`url(${useAsset("textFieldLarge")})`, backgroundSize:makeResponsive("100% 70vh","100% 25vh"), backgroundRepeat:"no-repeat", 
                        width:"100%",  marginRight:"2vw", border:"none", fontSize:makeResponsive("4vh", "1.5vh"), fontFamily:"montserratRegular", color:"white",
                        paddingLeft:"3vw", paddingRight:"2vw", height:makeResponsive("70vh", "25vh"), paddingTop:"2vh"
                    }}
                />
            </div>
        </div>
    )
}