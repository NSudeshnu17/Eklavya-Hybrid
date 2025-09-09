import cn from "../../../utils/cn";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypeWriter = () => {
  const wordsArray1 = [
    { text: "We’re", className: "text-white splash-text" },
    { text: "An", className: "text-white splash-text" },
    { text: "Ethical", className: "text-white splash-text" },
    { text: "Cloud", className: "text-white splash-text" },
    { text: "&", className: "text-white splash-text" },
    { text: "Data", className: "text-white splash-text" },
    { text: "Center", className: "text-white splash-text" },
    { text: "Service", className: "text-white splash-text" },
    { text: "Provider", className: "text-white splash-text" },
  ];

  const wordsArray2 = [
    { text: "Enabling", className: "text-white splash-text" },
    { text: "The", className: "text-white splash-text" },
    { text: "Future", className: "text-white splash-text" },
    { text: "Of", className: "text-white splash-text" },
    { text: "Digital", className: "text-white splash-text" },
    { text: "India", className: "text-white splash-text" },
  ];

  const [words, setWords] = useState(wordsArray1);
  const [toggle, setToggle] = useState(true);
  const [animationKey, setAnimationKey] = useState(0); // State to track animation key

  useEffect(() => {
    const interval = setInterval(() => {
      setToggle((prevToggle) => !prevToggle);
      setWords(toggle ? wordsArray2 : wordsArray1);
      setAnimationKey((prevKey) => prevKey + 1); // Update key to trigger animation restart
    }, 5000);

    return () => clearInterval(interval);
  }, [toggle]);

  const renderWords = () => (
    <div>
      {words.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.split("").map((char, index) => (
            <span
              key={`char-${index}`}
              className={cn("dark:text-white text-black", word.className)}
            >
              {char}
            </span>
          ))}
          &nbsp;
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("flex space-x-1 my-6")}>
      <motion.div
        key={animationKey} // Unique key to restart animation
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        animate={{ width: "fit-content" }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text-3xl xl:text-5xl font-bold"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn("block rounded-sm w-[4px] h-4 sm:h-6 xl:h-12 bg-blue-500")}
      ></motion.span>
    </div>
  );
};
