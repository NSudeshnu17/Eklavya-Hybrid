export default function HeadingBottomLine() {
    return (
        <>
          <div style={{position: "absolute", bottom : 0, left : 0, width : "100%", display : "flex", justifyContent : "center", alignItems : "center" }}  className=" particle-line relative">
        <div style={{width : "28vw" , height : "8vh", position : "absolute", borderRadius : "50%", left : "38%", background : "linear-gradient(94deg, rgba(0, 230, 255, 1) 13%, rgba(0, 102, 255, 1) 100%)", filter : "blur(60px)"}} className="absolute inset-x-60  bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] " />
        <div style={{  width: "100%",  left : "0", height: "1px"}} className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px " />
      </div>
      </>
    )
}