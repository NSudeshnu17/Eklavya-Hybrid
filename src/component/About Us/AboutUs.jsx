import gsap from 'gsap';
import CountUp from 'react-countup';
import { ScrollToPlugin, ScrollTrigger } from 'gsap/all';
import cloud_hand from '../../images/About/cloud-with-hand.jpg'
import { useEffect, useLayoutEffect, useState } from 'react';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis'
import thumbnail_about_slider from '../../images/About/thumbnail-bg.png'
import slide_one from '../../images/About/slide images/01 2005.png'
import slide_two from '../../images/About/slide images/02 2006.png'
import slide_three from '../../images/About/slide images/03 2008.png'
import slide_four from '../../images/About/slide images/04 2011.png'
import slide_five from '../../images/About/slide images/05 2016.png'
import slide_six from '../../images/About/slide images/06 2020.png'
import slide_seven from '../../images/About/slide images/07 2020.png'
import slide_eight from '../../images/About/slide images/08 2022.png'
import slide_nine from '../../images/About/slide images/09 2022.png'
import slide_ten from '../../images/About/slide images/10 2022.png'
import slide_eleven from '../../images/About/slide images/11 2022.png'
import slide_twelve from '../../images/About/slide images/12 2023.png'
import slide_thirteen from '../../images/About/slide images/13 2023.png'
import slide_forteen from '../../images/About/slide images/14 2024.png'
import InnerPageLoader from '../Loader/InnerPageLoader.jsx';
import slide_one_bg from '../../images/About/slide-background/01 2005.jpg'
import slide_two_bg from '../../images/About/slide-background/02 2006.jpg'
import slide_three_bg from '../../images/About/slide-background/03 2008.jpg'
import slide_four_bg from '../../images/About/slide-background/04 2011.jpg'
import slide_five_bg from '../../images/About/slide-background/05 2016.jpg'
import slide_six_bg from '../../images/About/slide-background/06 2020.jpg'
import slide_seven_bg from '../../images/About/slide-background/07 2020.jpg'
import slide_eight_bg from '../../images/About/slide-background/08 2022.jpg'
import slide_nine_bg from '../../images/About/slide-background/09 2022.jpg'
import slide_ten_bg from '../../images/About/slide-background/10 2022.jpg'
import slide_eleven_bg from '../../images/About/slide-background/11 2022.jpg'
import slide_twelve_bg from '../../images/About/slide-background/12 2023.jpg'
import slide_thirteen_bg from '../../images/About/slide-background/13 2023.jpg'
import slide_forteen_bg from '../../images/About/slide-background/14 2024.jpg'
import './AboutUs.css'
import * as demoActions from '../../Redux/Actions/DemoActions.js'
import Header from '../Header/Header';
import ScrollIndicator from '../../components/ui/ScrollIndicator';
import Topsection from '../FinalFooter/Topsection';
import FooterFinal from '../FinalFooter/FooterFinal';
import MobileNavbar from '../Navbar/MonileNavbar';
import { useDispatch } from 'react-redux';


export default function AboutUs() {
    let [onscrollProgress, setonScrollProggress] = useState(0)
    let [counterOne, setCounterOne] = useState(false)
    let [counterTwo, setCounterTwo] = useState(false)
    let [counterThree, setcounterThree] = useState(false)
    let [counterFour, setcounterFour] = useState(false)
    let [counterFive, setcounterFive] = useState(false)
    let [counterSix, setcounterSix] = useState(false)
    let [counterSeven, setcounterSeven] = useState(false)
    let [counterEight, setcounterEight] = useState(false)
    let [counterNine, setcounterNine] = useState(false)
    let [counterTen, setcounterTen] = useState(false)
    let [counterEleven, setCounterEleven] = useState(false)
    let [counterTwelve, setCounterTwelve] = useState(false)
    let [counterThirteen, setCounterThirteen] = useState(false)
    let [counterFourteen, setCounterFourteen] = useState(false)
   
    let dispatch = useDispatch()
    useEffect(() => {
        dispatch({type:demoActions.UPDATE_NAVBAR,payload:false})
      },[])
    let bg_image_array = [
       slide_one_bg, slide_two_bg, slide_three_bg, slide_four_bg, slide_five_bg, slide_six_bg, slide_seven_bg,
        slide_eight_bg, slide_nine_bg, slide_ten_bg, slide_eleven_bg, slide_twelve_bg, slide_thirteen_bg,slide_forteen_bg
    ]
 

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(ScrollToPlugin)
        const mm = gsap.matchMedia();

        gsap.to(window, {
            scrollTo:0,
            duration: 1,
            ease: "power2.inOut"
          });

        // Define your media queries and corresponding animations
        mm.add("(min-width: 1199px)", () => {
            let t1 = gsap.timeline({
                scrollTrigger: {
                  trigger: "#who-we-are-banner",
                  start: "top top",
                  end: () => window.innerHeight * 1.2,
                  pin: true,
                  scrub: true,
          
                  onLeave: () => {
                      document.getElementById("who-we-are-banner").style.position = "relative"
                  }
                },
              });
          
              t1.fromTo(".WWR-banckground-image", { opacity: 0 }, { opacity: 1 }, "key")
                .to(".who-we-are",  { scale : 0.4, duration : 2, y : "-50%", color : "rgb(163 163 163)" }, "key")
                .fromTo(".Innovators", {x : "-15vw",scale : 0.5, opacity : 0}, {x : "-3vw", scale : 1.1 ,opacity : 1, duration : 2}, "key")
                .fromTo(".not-by-words", {scale : 0.5, opacity : 0}, {scale : 1.1 ,opacity : 1, duration : 2}, "key")
                .fromTo(".but-by-Action", {x : "15vw" ,scale : 0.5, opacity : 0}, {x : "4vw",scale : 1.1 ,opacity : 1, duration : 2}, "key")

          
                let  t2 = gsap.timeline({
                  scrollTrigger: {
                      trigger: "#about-text",
                      start: "top top", 
                      end : () => window.innerHeight * 13,
                      pin: true,
                      pinSpacing: false,
                      scrub: true,
                      // markers: true,
                  }
              })
              document.querySelectorAll(".single-line-inner").forEach((row) => {
                  let trigger1 = ScrollTrigger.create({
                    trigger: row,
                    start: () => `top 90%`,
                    end: () => `bottom 90%`,
                  //   markers: true,
                    onUpdate : () => {
                     row.style.transform = "none"
                    },
                   
                  })
                  return () => {
                      if(trigger1) trigger1.kill();
                    }
          })
          
                let  t3 = gsap.timeline({
                  scrollTrigger: {
                      trigger: "#thumbnail-image",
                      start: "top+=200 5%", 
                      endTrigger : "#about-us",
                      end : "top top",
                      scrub: true,
                    
                      onLeave: () => {
                          document.getElementById("about-text").style.opacity = 0;
                      },
                      onEnterBack: () => {
                          document.getElementById("about-text").style.opacity = 1;
                      }
                  }
              })
              t3.to("#thumbnail-image", {scale: 1,x : 0, y: 0, borderRadius: "0px"})
              
          
              let  t4 = gsap.timeline({
                  scrollTrigger: {
                      trigger: "#about-us",
                      start: "top top", 
                      end : () => innerHeight * 13,
                      pin: true,
                      scrub: true,
                      snap: "labels"
                      // markers: true,
                    
                  }
              })
              t4.fromTo("#first-list",{ z:"-200vw",opacity: 0, x: "5vw"}, {z: "0", x: "0", opacity: 1.3,  onStart : () => {setCounterOne(true); setonScrollProggress(0)}, onReverseComplete: () => {
                  setonScrollProggress(0)
              }, onComplete: () => {setonScrollProggress(1)}},"key11" )
              // t4.to(".slide-img img", {scale : 1.4},"key1")
              t4.fromTo("#first-list",{ z:"0", x: "0vw"}, {z: "900vw", x: "-15vw",y : "10vh", opacity: 2,},"key1" )
              t4.fromTo("#second-list",{opacity: -0.6,  z: "-500vw"}, { z: 0, opacity : 1.3,  onStart : () => {setCounterTwo(true); }, onReverseComplete: () => {
                  setonScrollProggress(0)
              } },"key1")
             
              t4.fromTo("#second-list",{z: 0}, { z: "900vw", x: "15vw", y : "10vh" },"key")
              t4.fromTo("#third-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setcounterThree(true);setonScrollProggress(2)}, onReverseComplete: () => {
                  setonScrollProggress(1)
              } },"key")
              t4.fromTo("#third-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key2")
              t4.fromTo("#fourth-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3 , onStart : () => {setcounterFour(true);setonScrollProggress(3)},  onReverseComplete: () => {
                  setonScrollProggress(2)
              } },"key2")
              t4.fromTo("#fourth-list",{z: 0}, {z: "900vw" ,x: "15vw",y : "10vh"},"key3")
              t4.fromTo("#fifth-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3 ,onStart : () => {setcounterFive(true); setonScrollProggress(4)},  onReverseComplete: () => {
                  setonScrollProggress(3)
              } },"key3")
              t4.fromTo("#fifth-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key4")
              t4.fromTo("#sixth-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setcounterSix(true);setonScrollProggress(5)},  onReverseComplete: () => {
                  setonScrollProggress(4)
              }  },"key4")
              t4.fromTo("#sixth-list",{z: 0}, {z: "900vw" ,x: "15vw",y : "10vh"},"key5")
              t4.fromTo("#seven-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3, onStart : () => {setcounterSeven(true);setonScrollProggress(6)},  onReverseComplete: () => {
                  setonScrollProggress(5)
              }  },"key5")
              t4.fromTo("#seven-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key6")
              t4.fromTo("#eight-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setcounterEight(true);setonScrollProggress(7)},  onReverseComplete: () => {
                  setonScrollProggress(6)
              }  },"key6")
              t4.fromTo("#eight-list",{z: 0}, {z: "900vw" ,x: "15vw",y : "10vh"},"key7")
              t4.fromTo("#nine-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3, onStart : () => {setcounterNine(true);setonScrollProggress(8)},  onReverseComplete: () => {
                  setonScrollProggress(7)
              }  },"key7")
              t4.fromTo("#nine-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key8")
              t4.fromTo("#ten-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3, onStart : () => {setcounterTen(true);setonScrollProggress(9)}, onReverseComplete: () => {
                  setonScrollProggress(8)
              }  },"key8")
              t4.fromTo("#ten-list",{z: 0}, {z: "900vw" ,x: "15vw",y : "10vh"},"key9")
              t4.fromTo("#eleven-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3, onStart : () => {setCounterEleven(true);setonScrollProggress(10)},  onReverseComplete: () => {
                  setonScrollProggress(9)
              }  },"key9")
              t4.fromTo("#eleven-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key10")
              t4.fromTo("#twelve-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setCounterTwelve(true);setonScrollProggress(11)}, onReverseComplete: () => {
                  setonScrollProggress(10)
              }  },"key10")
              t4.fromTo("#twelve-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key13")
              t4.fromTo("#thirteen-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setCounterThirteen(true);setonScrollProggress(12)} , onReverseComplete: () => {
                  setonScrollProggress(11)
              }  },"key13")
              t4.fromTo("#thirteen-list",{z: 0}, {z: "900vw" ,x: "-15vw",y : "10vh"},"key15")
              t4.fromTo("#fourteen-list",{opacity: -0.6, z: "-500vw", }, {z: 0, opacity : 1.3,onStart : () => {setCounterFourteen(true);setonScrollProggress(13)} , onReverseComplete: () => {
                  setonScrollProggress(12)
              }  },"key15")
              return () => {
                if (t1) t1.kill();
              //   if (t5) t5.kill();
                if (t2) t2.kill();
                if (t3) t3.kill();
                if (t4) t4.kill();
                ScrollTrigger.getAll().forEach(st => st.kill());
              };
        })


        mm.add("(max-width : 1199px)", () => {
            
            document.querySelectorAll(".single-line-inner").forEach((row) => {
                let trigger1 = ScrollTrigger.create({
                  trigger: row,
                  start: () => `top 90%`,
                  end: () => `bottom 90%`,
                //   markers: true,
                  onUpdate : () => {
                   row.style.transform = "none"
                  },
                 
                })
                return () => {
                    if(trigger1) trigger1.kill();
                  }
                  
        })
       
        })
        
        return () => {
            mm.revert();
          };
       
      }, []);
    return (
        <div>
            <MobileNavbar />
            <ReactLenis
                root
                options={{
                    duration: 3,
                }}
            >
        {/* <InnerPageLoader /> */}
        <ScrollIndicator /> 
         <Header />
        <section id='who-we-are-banner' className='Who-we-are-banner'>
            <div className='WWR-banckground-image'><img src={cloud_hand} alt="cloud hand" /></div>
            
            <div className='WWR-text'>
            <p className='Innovators'>Innovators</p>
            <p className='who-we-are'>WHO ARE WE?</p>
            <p className='not-by-words'>not by words</p>
            <p className='but-by-Action'>but by Action</p>
            </div>
            
           
        </section>
     
        <section id='about-text' className='About-text'>
        <div id='thumbnail-image' className=' thumbnail-image'><img src={thumbnail_about_slider} alt="thumbnail" /></div>
            <div className='inner-div'>
           
               <div className='single-line line-ones'>
                    <div className='single-line-inner'>An <span> Indian innovator</span> born in 2005, on track to become the next big <span> Indian Cloud Hyperscaler</span>.</div>
               </div>
               <div className='single-line line-two'>
                    <div className='single-line-inner'>Starting from humble beginnings providing web hosting services, <span>a cloud empire was forged</span> </div>
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Broke into the big league with <span> India’s very own eNlight Cloud platform.</span></div>
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Grew into a <span> 1200 + strong workforce , 5 data centers </span>across India and a <span> global presence </span> spanning APAC, Europe, the Middle East, the Americas, and Africa.</div>
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Proudly leading transformation journeys of <span>  450 + BFSI clients, 250 + govt organizations, and 600 + enterprises.</span></div>
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Continuously innovating with a <span>R&D powerhouse team</span> of 200 people, staying ahead of the game</div> 
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Committed to <span>Sustainability</span> , as an integral part of our mission, prioritizing eco-friendly practices</div>
               </div>
               <div className='single-line line-one'>
                    <div className='single-line-inner'>Leading <span>India’s digital charge</span> with a <span>one-stop shop</span> for Cloud, IT security, and Managed services</div>
               </div>
            </div>
        </section>
            <section id='about-us' className="About-us">
            
               <div className="background-image"><img src={bg_image_array[onscrollProgress]} alt="about us" /></div>
              
                    <div  className='home-list'>
                    
                        <div id='first-list' className="first-list list-item">
                            <div className='first-slide-img slide-img'>
                                <img src={slide_one} alt="Inception of ESDS" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterOne  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2005} duration={2.5} /> : <span>2005</span> }</div>
                            <p>Inception of ESDS</p>
                                <div className='descrip-text'>
                                This marks the founding year of ESDS, signifying the establishment of the company and its initial foray into the IT services industry.
                                </div>
                            </div>
                        </div>
                        <div id='second-list' className="second-list list-item">
                            <div className='description'>
                            <div className='year-count'>{counterTwo  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2006} duration={2.5} /> : <span>2006</span> }</div>
                            <p>Expansion into UK and US Markets</p>
                                <div className='descrip-text'>
                                ESDS expands its operations beyond its home market, venturing into the lucrative UK and US markets, indicating its growth and global ambition.
                                </div>
                            </div>
                            <div className='second-slide-img slide-img'>
                                <img src={slide_two} alt="Expansion into UK and US Markets" />
                            </div>
                        </div>
                        <div id='third-list' className="third-list list-item">
                            <div className='third-slide-img slide-img'>
                                <img src={slide_three} alt="Building State-of-the-Art Data Center in Nashik" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterThree  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2008} duration={2.5} /> : <span>2008</span> }</div>
                            <p>Building State-of-the-Art Data Center in Nashik</p>
                                <div className='descrip-text'>
                               <span className='esds'>ESDS</span>  began its operations from <span className='nashik'>Nashik</span> (India) in <span className='years'>2005</span> and offer our products across diversified industries that include government ministries & companies and corporate entities across sectors such as BFSI, manufacturing, IT and education.
                                </div>
                            </div>
                        </div>
                        <div id='fourth-list' className="fourth-list list-item">
                            <div className='description'>
                            <div className='year-count'>{counterFour  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2011} duration={2.5} /> : <span>2011</span> }</div>
                            <p>Innovation of 'Made in India' eNlight Cloud</p>
                                <div className='descrip-text'>
                                ESDS showcases its innovation prowess by developing the eNlight Cloud, a cloud computing solution that is proudly "Made in India," reflecting the company's focus on indigenous technological advancement.
                                </div>
                            </div>
                            <div className='fourth-slide-img slide-img'>
                                <img src={slide_four} alt="Innovation of 'Made in India' eNlight Cloud" />
                            </div>
                        </div>
                        <div id='fifth-list' className="fifth-list list-item">
                            <div className='fifth-slide-img slide-img'>
                                <img src={slide_five} alt="Construction of Tier 3 DC in Mumbai" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterFive  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2016} duration={2.5} /> : <span>2016</span> }</div>
                            <p>Construction of Tier 3 DC in Mumbai</p>
                                <div className='descrip-text'>
                                ESDS strengthens its infrastructure with the construction of a Tier 3 Data Center in Mumbai, enhancing its ability to provide secure and reliable data hosting services to its clientele.
                                </div>
                            </div>
                        </div>
                        <div id='sixth-list' className="sixth-list list-item">
                            <div className='description'>
                            <div className='year-count'>{counterSix  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2020} duration={2.5} /> : <span>2020</span> }</div>
                            <p>Securing 15th Best Workplace in Asia</p>
                                <div className='descrip-text'>
                                ESDS receives recognition for its workplace culture and practices, ranking as the 15th best workplace in Asia, indicating its commitment to employee satisfaction and well-being.
                                </div>
                            </div>
                            <div className='sixth-slide-img slide-img'>
                                <img src={slide_six} alt="Securing 15th Best Workplace in Asia" />
                            </div>
                        </div>
                        <div id='seven-list' className="seven-list list-item">
                            <div className='seventh-slide-img slide-img'>
                                <img src={slide_seven} alt="Building Tier 3 Data Center in Bengaluru" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterSeven  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2020} duration={2.5} /> : <span>2020</span> }</div>
                            <p>Building Tier 3 Data Center in Bengaluru </p>
                                <div className='descrip-text'>
                                ESDS expands its data center network with the construction of a Tier 3 facility in Bengaluru, catering to the increasing demand for data services in the region.
                                </div>
                            </div>
                        </div>
                        <div id='eight-list' className="eight-list list-item">
                           <div className='description'>
                           <div className='year-count'>{counterEight  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2022} duration={2.5} /> : <span>2022</span> }</div>
                           <p>Winning AEGIS Graham Bell Innovation Award</p>
                               <div className='descrip-text'>
                               ESDS earns acclaim for its innovative achievements, receiving the AEGIS Graham Bell Innovation Award, underscoring its commitment to technological advancement and excellence.
                               </div>
                           </div>
                           <div className='eight-slide-img slide-img'>
                               <img src={slide_eight} alt="Winning AEGIS Graham Bell Innovation Award" />
                           </div>
                       </div>
                        <div id='nine-list' className="nine-list list-item">
                            <div className='nine-slide-img slide-img'>
                                <img src={slide_nine} alt="Building Data Center in Mohali" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterNine  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2022} duration={2.5} /> : <span>2022</span> }</div>
                            <p>Building Data Center in Mohali</p>
                                <div className='descrip-text'>
                                ESDS continues its infrastructure expansion by constructing a data center in Mohali, likely extending its reach and service offerings to clients in the region.
                                 </div>
                            </div>
                        </div>
                        <div id='ten-list' className="ten-list list-item">
                           <div className='description'>
                           <div className='year-count'>{counterTen  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2022} duration={2.5} /> : <span>2022</span> }</div>
                           <p>Awarded Most Trusted CSP by Economic Times</p>
                               <div className='descrip-text'>
                               ESDS receives recognition for its reliability and trustworthiness as a Cloud Service Provider (CSP), earning the distinction of being the most trusted provider by the prestigious Economic Times.
                                                              </div>
                           </div>
                           <div className='ten-slide-img slide-img'>
                               <img src={slide_ten} alt="Awarded Most Trusted CSP by Economic Times" />
                           </div>
                       </div>
                        <div id='eleven-list' className="eleven-list list-item">
                            <div className='eleven-slide-img slide-img'>
                                <img src={slide_eleven} alt="Bagging India Patent for Auto Vertical Scaling Technology" />
                            </div>
                            <div className='description'>
                            <div className='year-count'>{counterEleven  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2022} duration={2.5} /> : <span>2022</span> }</div>
                            <p>Bagging India Patent for Auto Vertical Scaling Technology</p>
                                <div className='descrip-text'>
                                ESDS achieves a significant milestone in intellectual property by securing a patent for its auto vertical scaling technology, demonstrating its commitment to innovation and technological leadership.
                                </div>
                            </div>
                        </div>
                        <div id='twelve-list' className="twelve-list list-item">  
                           <div className='description'>
                           <div className='year-count'>{counterTwelve  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2023} duration={2.5} /> : <span>2023</span> }</div>
                           <p> Outstanding cloud Service Provider </p>
                               <div className='descrip-text'>
                               ESDS is acknowledged for its exceptional services in the financial sector, receiving the Outstanding Service Provider award at the NBFC Tech Summit, highlighting its expertise in serving the needs of Non-Banking Financial Companies (NBFCs).                               </div>
                           </div>
                           <div className='twelve-slide-img slide-img'>
                               <img src={slide_twelve} alt="Outstanding cloud Service Provider" />
                           </div>
                       </div>
                       <div id='thirteen-list' className="thirteen-list list-item">  
                               <div className='thirteen-slide-img slide-img'>
                               <img src={slide_thirteen} alt="Building Tier 3 Data Center in Airoli" />
                           </div> 
                           <div className='description'>
                           <div className='year-count'>{counterThirteen  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2023} duration={2.5} /> : <span>2023</span> }</div>
                           <p> Building Tier 3 Data Center in Airoli </p>
                               <div className='descrip-text'>
                               ESDS further expands its data center footprint with the construction of a Tier 3 facility in Airoli, likely aiming to meet the growing demand for data services in the area. </div>
                           </div>
                          
                       </div>
                       <div id='fourteen-list' className="fourteen-list list-item">  
                           <div className='description'>
                           <div className='year-count'>{counterFourteen  ? <CountUp separator='' useIndianSeparators={false} start={1900} end={2024} duration={2.5} /> : <span>2024</span> }</div>
                           <p>AI INNOVATION CENTRE</p>
                               <div className='descrip-text'>
                               ESDS is proud to announce the opening of its new office in Nashik, named the
AI Incubation Centre
. This state-of-the-art facility is dedicated to fostering innovation and serves as a hub for cutting-edge advancements in artificial intelligence and technology  </div>
                           </div>
                           <div className='fourteen-slide-img slide-img'>
                               <img src={slide_forteen} alt="New Office Expansion in Nashik" />
                           </div>
                       </div>
                        </div>
              
            </section>
            <Topsection question={"When You Collaborate With Innovators, Excellence Follows. "} answers={"Discover your league of innovation today"} />
            <FooterFinal BgColor={"#000"} />
            </ReactLenis>
        </div>
    )
}