import React, { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import TypewriterEffectSmoothDemo2 from "./typewriter2";


const SparklesPreview2 = memo(({word, className, mainDivClass, rowWrapper}) =>  {
   let divhide = useRef(null)

  return (

    <div  className={` ${mainDivClass} w-full  flex flex-col items-center justify-center  rounded-md`}>
      <h3 id="heading" >
      <TypewriterEffectSmoothDemo2 words={word} rowWrapper={rowWrapper} classsname={className}  />
      </h3>
     
    </div> 
  );
})


export default SparklesPreview2