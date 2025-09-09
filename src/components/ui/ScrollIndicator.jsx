import { memo, useEffect } from "react"

const ScrollIndicator = memo(() => {
    useEffect(() => {
        window.addEventListener("scroll", (e) => {
          if(window.scrollY > 500) {
            if(document.getElementById("scroll-down")) {

              document.getElementById("scroll-down").style.display = "none"
            }
          }else {
            if(document.getElementById("scroll-down"))
             document.getElementById("scroll-down").style.display = "block"
          }
        })     
    },[])
    
    return (
        <>
        <div  className="indicator-container">
        <div id="scroll-down" className="scroll-down-symbol">
        <div></div>
            <div></div>
            <div className="scroll-text">Scroll to Explore</div>
        </div>
        </div>
             
        </>
    )
})

export default ScrollIndicator