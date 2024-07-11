import React from 'react'
import { asset as useAsset } from '../reusables/useAsset'
import { colorWay } from '../reusables/colorWay'
import { responsive } from '../reusables/responsive'

function Navbar({clientWidth, clientHeight}) {
  return (
  <nav style={{backgroundImage:`url(${useAsset('headerNewUI')})`, backgroundSize:"100% 100%", backgroundRepeat:"no-repeat", height:"9vh", width:"100%", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center"}}> 
    
    <div style={{width:"auto", marginLeft:"2vw", marginTop:"3vh"}}>
        <img src={useAsset("sukhakalaIconNewUI")} style={{height:responsive(clientWidth, "3vh", "1.5vh"), width:"auto", objectFit:"contain"}}/>
    </div>
    <div style={{width:"auto",marginRight:"2vw",marginTop:"2.4vh"}}>
        <img src={useAsset("contactUsNewUI")} style={{height:responsive(clientWidth, "3vh", "1.5vh"), width:"auto", objectFit:"contain"}} onClick={(e) =>  window.open('https://www.instagram.com/sukhakala.id/', '_blank', 'noreferrer')}/>
    </div>
</nav>
  )
}

export default Navbar