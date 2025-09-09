
import { color } from "framer-motion";
import { TypewriterEffectSmooth } from "./typewriter-effect";
export default function TypewriterEffectSmoothDemo2({words,rowWrapper, classsname}) {
  
  return (
      <TypewriterEffectSmooth words={words} className={classsname} rowWrapper={rowWrapper} /> 
  );
}
