import { responsive } from '../reusables/responsive'
import { asset as useAsset } from '../reusables/useAsset'
import { Rating as Rate} from 'react-simple-star-rating'

export default function Rating({name, setter, setted, type, clientWidth}){
    function makeResponsive(big, small){
        return responsive(clientWidth, big, small)
    }

    const styleObject = {
        display:"flex", 
        flexWrap:"wrap", 
        alignSelf:"flex-start", 
        justifyContent:"center"
    }

    const handleRating = (rate) => {
        setter(rate)
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
        <div style={{width:"85%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center"}}>
            {/* <input type="text" style={{backgroundColor:colorWay.rona ,width:"100%", height:"5vh", borderRadius:"50px", borderWidth:"1px", borderStyle:"double", marginRight:"2vw", marginLeft:"2vw"}}/> */}
            <Rate
                onClick={handleRating}
                size={makeResponsive(100,25)}
            />
        </div>
    </div>
    )
}