import cn  from "../../../utils/cn";
import { motion, useAnimation, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useLayoutEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        width: "fit-content",
        transition: {
          duration: 0.3,
          delay: 0.1,
          ease: "easeInOut",
        },
      });
    }
  }, [inView, controls]);

  const renderWords = () => {
    return (
      <motion.div ref={ref} className="inline" animate={controls}>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  key={`char-${index}`}
                  className={cn(
                    `dark:text-white text-white opacity-0 hidden`,
                    word.className
                  )}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {
      // renderWords()
      }
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};

export const TypeWriterEffectWhy = ({
    words,
    className,
    Class,
    cursorClassName,
  }) => {
    // split text inside of words into array of characters
    const wordsArray = words.map((word) => {
      return {
        ...word,
        text: word.text.split(""),
      };
    });
  
    const renderWords = () => {
      return (
        <div className={`${Class}`}>
          {wordsArray.map((word, idx) => {
            return (
              <div key={`word-${idx}`} id={word.id} className={`inline-block ${word.class} `}>
                {word.text.map((char, index) => (
                  <div
                    key={`char-${index}`}
                    // id={word.className}
                    className={cn(`dark:text-white text-white `, word.className)}
                  >
                    {char}
                  </div>
                ))}
                &nbsp;
              </div>
            );
          })}
        </div>
      );
    };
  
  
  
  
    return (
      <div  className={cn("flex space-x-1 top-heading ", className)}>
      {renderWords()}
      </div>
    );
  };


export const TypewriterEffectSmooth1 = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`}  className={`inline-block ${word.class}`}>
              {word.text.map((char, index) => (
                <div
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-white `, word.className)}
                >
                  {char}
                </div>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  
useEffect(() => {
  setTimeout(() => {
    document.querySelector(".word-bar1").style.display = "none"
  }, 3000);
},[])


useLayoutEffect(() => {

 
  let t22 = gsap.timeline({
    scrollTrigger: {
      trigger: "#main",
      start: "top+=1200 top",
      // endTrigger: "#second-section",
      end: "top+=1300 top",
      scrub: 1,
      // markers: true,
      
    },
  });
  t22.to(".textBlock_standard_second_banner", { opacity: 1, stagger: 0.02,},"key1");





})


  return (
    <div className={cn("flex space-x-1 justify-center second-line", className)}>
      
          {
           renderWords() 
          }
    </div>
  );
};



export const TypewriterEffectSmooth2 = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`}  className={`inline-block ${word.class}`}>
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-white `, word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  
useEffect(() => {
  setTimeout(() => {
    document.querySelector(".word-bar1").style.display = "none"
  }, 3000);
},[])


  return (
    <div className={cn("flex space-x-1 justify-center second_subtext", className)}>
      
          {
           renderWords() 
          }
    </div>
  );
};


export const TypewriterEffectSmooth3 = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`}  className={`inline-block ${word.class}`}>
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-white `, word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  
useEffect(() => {
  setTimeout(() => {
    document.querySelector(".word-bar1").style.display = "none"
  }, 3000);
},[])


  return (
    <div className={cn("flex space-x-1 justify-center third_subtext", className)}>
      
          {
           renderWords() 
          }
    </div>
  );
};