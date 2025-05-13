import { useState } from 'react';

const style = {
    onStyle: {
        background_container: {
            display: "flex",
            border: "1px solid #0d6efd",
            flexDirection: "row-reverse",
            backgroundColor: "#0d6efd",
            cursor: "pointer",
            height: "20px",
            width: "50px",
            borderRadius:"10px",
            padding:"0px",
            alignItems:"center"
        },
        sliding_button: {
            backgroundColor: "white",
            height: "20px",
            width: "20px",
            borderRadius: "10px"
        }
    },
    offStyle: {
        background_container: {
            display: "flex",
            border: "1px solid rgb(145, 161, 214)",
            flexDirection: "row",
            backgroundColor: "rgb(145, 161, 214)",
            cursor: "pointer",
            height: "20px",
            width: "50px",
            borderRadius:"10px",
            padding:"0px",
            alignItems:"center"
        },
        sliding_button: {
            backgroundColor: "white",
            height: "20px",
            width: "20px",
            borderRadius: "50%"
        }
    }
}


function ToggleInput({purpose,inputState,setInputState}) {
    return (
        <div className="toggle" style={{height:"100px",width:"100%",display:"flex",justifyContent:"space-around"}}>
            <span>{purpose}</span>
            <button className="background_container" style={inputState==false?style.offStyle.background_container:style.onStyle.background_container} 
            onClick={()=>setInputState(pre=>!pre)}>
                <div className="sliding_button"style={inputState==false?style.offStyle.sliding_button:style.onStyle.sliding_button}>

                </div>
            </button>
        </div>

    )

}

export default ToggleInput