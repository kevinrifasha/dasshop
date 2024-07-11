import React from 'react'
import { colorWay } from '../reusables/colorWay'
import { asset as useAsset } from '../reusables/useAsset'
import { useNavigate } from 'react-router-dom'
import { responsive } from '../reusables/responsive'

function Footer({ clientWidth, clientHeight}) {
    return (
        <footer style={{backgroundImage:`url(${useAsset('footerNewUI')})`, backgroundSize:"100% 100%", backgroundRepeat:"no-repeat", height:responsive(clientWidth, "12vh", "4vh"), width:"100%", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", marginTop:"5vh"}}> 
            <div style={{width:"auto", marginLeft:"2vw", marginBottom:responsive(clientWidth,"2vh","1vh")}}>
                <img src={useAsset("sukhakalaIconNewUI")} style={{height:responsive(clientWidth,"3vh", "1vh"), width:"auto", objectFit:"contain"}}/>
            </div>
            <div style={{width:"auto",marginRight:"2vw", marginBottom:responsive(clientWidth,"2vh","1.1vh")}}>
                <img src={useAsset("contactInfoNewUI")} style={{height:responsive(clientWidth,"5vh", "2vh"), width:"auto", objectFit:"contain"}}/>
            </div>
            <div style={{width:"auto",marginRight:"2vw", marginBottom:responsive(clientWidth,"3vh","1vh")}} onClick={(e) =>  window.open('https://www.instagram.com/sukhakala.id/', '_blank', 'noreferrer')}>
                <img src={useAsset("instagramIconNewUI")} style={{height:responsive(clientWidth,"6vh", "1.7vh"), width:"auto", objectFit:"contain"}}/>
            </div>
        </footer>
    )
}

export default Footer