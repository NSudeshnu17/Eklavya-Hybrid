// useTTS.js
import { useEffect, useRef, useState } from "react";

export default function useTTS() {
  const [speechVoices, setSpeechVoices] = useState([]);
  const utterRef = useRef(null);

  // load/refresh available voices
  const loadVoices = () => {
    if (!("speechSynthesis" in window)) return;
    const v = window.speechSynthesis.getVoices() || [];
    if (v.length) setSpeechVoices(v);
  };

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    // initial attempt
    loadVoices();

    // some browsers fire an event when voices become available
    const handler = () => loadVoices();

    // prefer addEventListener if present; otherwise assign onvoiceschanged
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", handler);
    } else {
      window.speechSynthesis.onvoiceschanged = handler; // ✅ correct property
    }

    // fallback: retry a few times in case the event never fires (Safari/Chrome quirk)
    let tries = 0;
    const retryId = setInterval(() => {
      tries += 1;
      if (speechVoices.length || tries > 10) clearInterval(retryId);
      else loadVoices();
    }, 250);

    return () => {
      clearInterval(retryId);
      if (typeof window.speechSynthesis.removeEventListener === "function") {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
      } else {
        // only clear if we were the ones who set it
        if (window.speechSynthesis.onvoiceschanged === handler) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = ({
    text,
    voice = null,
    rate = 1,
    pitch = 1,
    volume = 1,
  } = {}) => {
    if (!("speechSynthesis" in window)) {
      throw new Error("SpeechSynthesis not supported in this browser.");
    }
    window.speechSynthesis.cancel(); // stop any ongoing speech
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    if (voice) u.voice = voice;
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  };

  return { speechVoices, speak, stop };
}
