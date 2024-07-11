import { responsive } from '../reusables/responsive';
import { asset } from '../reusables/useAsset'
import Select from 'react-select';

export default function Selection({name, setter, setted, options, clientWidth}){
    
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
                fontSize:makeResponsive((name.length > 13 ? "3vh" : "4vh"), (name.length > 13 ? "1vh" : "1.5vh"))
            }}>{name}<span style={{fontFamily:"gentyDemo"}}>*</span></p>
        </div>
        <div style={{width:"85%", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"flex-start"}}>
            <Select 
                options={options}
                value={setted}
                onChange={(e) => {
                  setter(e)}
                }
                menuPortalTarget={document.body} 
                isSearchable = {false}
                inputProps={{readOnly:true}}
                styles={{
                    container: provided => ({
                        ...provided,
                        backgroundColor:"transparent",backgroundImage:`url(${asset("textFieldSmall")})`, backgroundSize:"100% 100%", backgroundRepeat:"no-repeat", 
                        width:"100%", marginRight:"2vw", marginLeft:"2vw", border:"none", fontSize:makeResponsive("4vh", "1.5vh"), fontFamily:"montserratRegular", color:"white",
                        paddingLeft:makeResponsive("3vw", "1vw"), paddingRight:"2vw", height:makeResponsive("8vh", "4vh"), 
                        ':focus': {
                            outline: 'none'
                          },
                      }),
                      control: baseStyle => ({
                        ...baseStyle,
                        backgroundColor:"transparent",
                        border:"none",
                        border: 0,
                        boxShadow: 'none',
                        height:makeResponsive("4vh", "2vh"),
                        // backgroundColor:"red",
                        paddingTop:makeResponsive("-1vh", "-1vh"),
                      }),
                      option: (prev) => ({
                        ...prev,
                        color:"black",
                        fontSize:makeResponsive("2vh", "1.5vh"),
                        width:"100%",
                        zIndex:"30"
                      }),
                      menu: (prev) =>({
                        width:"80%",
                        backgroundColor:"white",
                        marginTop:makeResponsive("2vh", "0vh")
                      }),
                      placeholder:(prev) => ({
                        ...prev,
                        color:"white",
                        paddingTop:makeResponsive("1vh", "0vh"),
                        fontSize:makeResponsive("4vh", "1.5vh"),
                      }),
                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                      input:(prev) => ({
                        ...prev,
                        color:"white",
                        ':focus': {
                            outline: 'none'
                          },
                      }),
                      singleValue:(prev) => ({
                        ...prev,
                        color:"white",
                        border:"none",
                        paddingTop:makeResponsive("1vh", "0vh"),
                        fontSize:makeResponsive("4vh", "1.5vh"),
                      }),
                      dropdownIndicator:(prev) => ({
                        color:"white",
                        paddingTop:makeResponsive("1vh", "0vh"),
                      }),
                      indicatorSeparator:(prev) => ({
                        color:"white"
                      })
                  }}
            />
        </div>
    </div>
    )
}