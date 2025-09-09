import React, { useState, useEffect, useRef } from "react";
import ReactPannellum from "react-pannellum";
import Chatbot from "./component/About Us/chatbot/Chatbot";
import chatbotImg from "./images/IAF_Logo.jpg";
import bgimg from "../src/img/cockpit3.jpg";
import bg2 from "./images/IAF_banner.png";
import useVoiceCommands from "./hooks/useVoiceCommands";
import VoiceWaveIndicator from './hooks/VoiceWaveIndicator';
import "./App.css";

/* ==== ONLY FOR THE SECOND SCREEN (replaces hex/Click-to-load) ==== */
const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Entering PILATUS PC & MK II');

  useEffect(() => {
    // progress to 100% in ~4s
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // animated dots
    let dotCount = 0;
    const dotsTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setLoadingText(`Entering in the cockpit${'.'.repeat(dotCount)}`);
    }, 500);

    if (progress === 100) {
      clearInterval(dotsTimer);
      setLoadingText('Cleared for Takeoff!');
      setTimeout(() => onLoadingComplete && onLoadingComplete(), 1000);
    }

    return () => {
      clearInterval(progressTimer);
      clearInterval(dotsTimer);
    };
  }, [progress, onLoadingComplete]);

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 2000, // sits above pannellum
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#B0E0E6', fontFamily: 'sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '24rem', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
        <img
          src="/images/IAF_logo.svg"
          alt="IAF Logo"
          style={{
            margin: 'auto', marginBottom: '2.5rem',
            width: '14rem', height: '14rem', objectFit: 'contain',
            filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))'
          }}
        />
        <div style={{
          width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '9999px', height: '1.25rem', overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: 'white', height: '1.25rem', borderRadius: '9999px',
            boxShadow: '0 10px 15px -3px rgba(255, 255, 255, 0.5), 0 4px 6px -2px rgba(255, 255, 255, 0.25)',
            width: `${progress}%`, transition: 'width 300ms ease-in-out'
          }} />
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: '1.25rem', fontWeight: 500, color: '#2d3748', letterSpacing: '0.05em' }}>
          {loadingText}
        </p>
      </div>
    </div>
  );
};
/* ================================================================ */

const MainSection = ({ isMobile = false, stringClass = "" }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showPanorama, setShowPanorama] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  // NEW: controls the second screen loader visibility
  const [isPanoLoading, setIsPanoLoading] = useState(false);

  // put these below your existing state hooks
  const audioRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);   // start muted (browser-friendly)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Keep DOM nodes for special hotspots (like inline panels)
  const hotspotDomRef = useRef({});

  // registry for voice → hotspot lookup
  const hotspotRegistryRef = useRef({});
  const registerHotspot = (name, data) => {
    if (!name) return;
    hotspotRegistryRef.current[name.toLowerCase()] = data; // {pitch, yaw, kind, src, onClick}
  };
  const openHotspotByName = (name) => {
    if (!name) return;
    const h = hotspotRegistryRef.current[name.toLowerCase()];
    if (!h) return;
    try {
      ReactPannellum.setYaw(h.yaw, 500);
      ReactPannellum.setPitch(h.pitch, 500);
    } catch { }
    if (typeof h.onClick === "function") {
      h.onClick();
    } else if (window.__openHotspotModal && h.kind && h.src) {
      window.__openHotspotModal(h.src, h.kind);
    }
  };

  // Voice commands -> actions in your UI
  const voiceCommands = [
    // Chatbot
    {
      command: "open chat",
      patterns: [/open (the )?chat(bot)?/i, /show (the )?chat(bot)?/i],
      callback: () => setShowChatbot(true),
    },
    {
      command: "close chat",
      patterns: [/close (the )?chat(bot)?/i, /hide (the )?chat(bot)?/i],
      callback: () => setShowChatbot(false),
    },

    // Navigation
    {
      command: "enter cockpit",
      patterns: [/enter (the )?cockpit/i, /open cockpit/i],
      callback: () => handleEnterPlane(),
    },
    {
      command: "back to view",
      patterns: [/back( to)? (the )?view/i, /exit cockpit/i, /go back/i],
      callback: () => setShowPanorama(false),
    },

    // Hotspots toggle
    {
      command: "show hotspots",
      patterns: [/show hot ?spots?/i, /turn (the )?hot ?spots? on/i],
      callback: () => setShowHotspots(true),
    },
    {
      command: "hide hotspots",
      patterns: [/hide hot ?spots?/i, /turn (the )?hot ?spots? off/i],
      callback: () => setShowHotspots(false),
    },

    // Landing audio
    {
      command: "mute audio",
      patterns: [/mute( the)? audio/i],
      callback: () => { if (audioRef.current) audioRef.current.muted = true; },
    },
    {
      command: "unmute audio",
      patterns: [/unmute( the)? audio/i],
      callback: () => { if (audioRef.current) audioRef.current.muted = false; },
    },

    // Standby Instrument video hotspot
    {
      command: "open altimeter",
      patterns: [/open altimeter/i],
      callback: () => openHotspotByName("altimeter"),
    },

    // Map hotspot
    {
      command: "open map",
      patterns: [/open map/i],
      callback: () => openHotspotByName("map"),
    },

    // Landing hotspot
    {
      command: "open landing",
      patterns: [/open landing/i],
      callback: () => openHotspotByName("landing"),
    },

    // Radio hotspot
    {
      command: "open radio",
      patterns: [/open radio/i],
      callback: () => openHotspotByName("radio"),
    },

    // Battery bus hotspot
    {
      command: "open battery bus",
      patterns: [/open battery bus/i],
      callback: () => openHotspotByName("battery bus"),
    },

    {
      command: "open PFD",
      patterns: [/open\s+(the\s+)?p\s*F\s*D/i, /open\s+pfd/i],
      callback: () => openHotspotByName("open PFD"),
    },
    {
      command: "close battery bus",
      patterns: [/close battery bus/i],
      callback: () => {
        const el = hotspotDomRef.current["battery bus"];
        if (el) el.classList.remove("open");
      },
    },

    // engine hotspot
    {
      command: "open engine",
      patterns: [/open engine/i],
      callback: () => openHotspotByName("engine"),
    },

    {
      command: "close altimeter",
      patterns: [/close altimeter/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close map",
      patterns: [/close map/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close landing",
      patterns: [/close landing/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close radio",
      patterns: [/close radio/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close engine",
      patterns: [/close engine/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close PFD",
      patterns: [/close PFD/i],
      callback: () => window.__closeHotspotModal && window.__closeHotspotModal(),
    },
    {
      command: "close checklist",
      patterns: [/close checklist/i],
      callback: () => {
        const el = hotspotDomRef.current["checklist"];
        if (el) el.classList.remove("open");
      },
    },
  ];

  // Start listening (wake word required; see useVoiceCommands)
  const {
    isAwake,
    isListening,
    finalTranscript,
    browserSupportsSpeechRecognition
  } = useVoiceCommands(voiceCommands);

  const closeShowChatBot = () => {
    setShowChatbot(false);
  }

  useEffect(() => {
    const t = (finalTranscript || "").toLowerCase().trim();
    if (!t || !showPanorama) return;

    const m = t.match(/open\s+([a-z0-9\- ]+)/i);
    if (!m) return;

    const raw = m[1].trim();
    const name = raw.replace(/^the\s+/i, "").replace(/\b(video|image)\b/i, "").trim();
    if (!name) return;

    const tryOpen = () => openHotspotByName(name);

    if (Object.keys(hotspotRegistryRef.current).length === 0) {
      setTimeout(tryOpen, 300); // wait until hotspots are registered
    } else {
      tryOpen();
    }
  }, [finalTranscript, showPanorama]);

  // Register offline fonts (Product Sans Regular + Bold) and set a global default
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @font-face { font-family: "Product Sans";
        src: url("/fonts/product-sans/ProductSans-Regular.woff") format("woff");
        font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: "Product Sans";
        src: url("/fonts/product-sans/ProductSans-Bold.woff") format("woff");
        font-weight: 700; font-style: normal; font-display: swap; }
      body { font-family: "Product Sans", Segoe UI, Helvetica, Arial, sans-serif; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ensure audio starts playing after the first user interaction (for browsers that block autoplay with sound)
  useEffect(() => {
    const startAudio = () => {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) {
        el.muted = false; // force unmuted
        const p = el.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => { }); // ignore errors
        }
      }
      window.removeEventListener("pointerdown", startAudio);
    };

    window.addEventListener("pointerdown", startAudio, { once: true });
    return () => window.removeEventListener("pointerdown", startAudio);
  }, []);

  //audio use effect
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (showPanorama) {
      // Inside cockpit: pause the landing audio
      try { el.pause(); } catch { }
    } else {
      // Back on landing: keep it playing (muted by default unless user unmutes)
      const p = el.play?.();
      if (p && typeof p.catch === "function") p.catch(() => { });
      setIsAudioPlaying(true);
    }
  }, [showPanorama]);

  // Fade-in animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .fade-in { opacity: 0; animation: fadeInUp 1.2s ease forwards; }
      .fade-in.delay-1 { animation-delay: 0.3s; }
      .fade-in.delay-2 { animation-delay: 0.6s; }
      .fade-in.delay-3 { animation-delay: 0.9s; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Blinking dot style
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hs-blinker { position: absolute; transform: translate(-50%, -50%);
        width: 22px; height: 22px; pointer-events: auto; cursor: pointer; }
      .hs-blinker .hs-dot { position: absolute; top: 50%; left: 50%;
        width: 10px; height: 10px; transform: translate(-50%,-50%);
        border-radius: 50%; background: #fff; border: 2px solid #fff; }
      .hs-blinker .hs-dot::after { content: ""; position: absolute; top: 50%; left: 50%;
        width: 10px; height: 10px; transform: translate(-50%,-50%); border-radius: 50%;
        box-shadow: 0 0 0 0 rgba(0,255,255,0.9); animation: hsPulse 1.6s ease-out infinite; }
      @keyframes hsPulse {
        0% { box-shadow: 0 0 0 0 rgba(0,255,255,0.9); }
        70% { box-shadow: 0 0 0 12px rgba(0,255,255,0.0); }
        100% { box-shadow: 0 0 0 0 rgba(0,255,255,0.0); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Anchored hotspot panel
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hs-inline { position: absolute; transform: translate(-50%,-50%); width: 22px; height: 22px; cursor: pointer; }
      .hs-inline .hs-dot { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px;
        transform: translate(-50%,-50%); border-radius: 50%; background: #fff; border: 2px solid #fff; }
      .hs-inline .hs-dot::after { content:""; position:absolute; top:50%; left:50%; width:10px; height:10px;
        transform:translate(-50%,-50%); border-radius:50%;
        box-shadow:0 0 0 0 rgba(0,255,255,0.9); animation: hsPulse 1.6s ease-out infinite; }
      @keyframes hsPulse {
        0%{box-shadow:0 0 0 0 rgba(0,255,255,0.9)}
        70%{box-shadow:0 0 0 12px rgba(0,255,255,0)}
        100%{box-shadow:0 0 0 0 rgba(0,255,255,0)}
      }
      .hs-inline-panel { position: absolute; left: 50%; top: -12px; transform: translate(-50%, -100%);
        display: none; background: #000; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,.35);
        padding: 6px; z-index: 2; }
      .hs-inline.open .hs-inline-panel { display: block; }
      .hs-inline-img { display:block; max-width: 40vw; max-height: 40vh; object-fit: contain; border-radius: 8px; }
      .hs-inline-panel::after { content:""; position:absolute; left:50%; bottom:-8px; transform:translateX(-50%);
        width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:8px solid #000; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // === UNIVERSAL HOTSPOT MODAL (image or video) ===
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hs-overlay { position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.55); z-index: 3000; backdrop-filter: blur(2px); }
      .hs-overlay.show { display: flex; }
      .hs-card { position: relative; background: transparent; border-radius: 12px; }
      .hs-close { position: absolute; top: 8px; right: 8px; border: 0; background: rgba(0,0,0,0.3);
        color: #fff; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-weight: 600;  z-index: 9999; pointer-events: auto; }
      .hs-img, .hs-video { display: block; max-width: 90vw; max-height: 90vh; border-radius: 12px;
        background: #000; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
      .hs-controls { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
      .hs-btn { border: 0; background: rgba(0,0,0,0.6); color: #fff; padding: 6px 10px; border-radius: 8px;
        cursor: pointer; font-weight: 600; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "hotspot-modal";
    overlay.className = "hs-overlay";
    overlay.innerHTML = `
      <div class="hs-card">
        <button class="hs-close" aria-label="Close">✕</button>
        <div id="hs-content"></div>
        <div class="hs-controls" id="hs-extra-controls" style="display:none;">
          <button class="hs-btn" id="hs-fullscreen">Fullscreen</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const contentEl = overlay.querySelector("#hs-content");
    const controlsEl = overlay.querySelector("#hs-extra-controls");
    const fullscreenBtn = overlay.querySelector("#hs-fullscreen");

    function closeOverlay() {
      const vid = contentEl.querySelector("video");
      if (vid) {
        try { vid.pause(); } catch { }
        vid.removeAttribute("src");
        vid.load();
      }
      overlay.classList.remove("show");
      contentEl.innerHTML = "";
      controlsEl.style.display = "none";
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("hs-close")) closeOverlay();
    });

    window.__openHotspotModal = (src, kind = "image") => {
      if (!contentEl) return;
      contentEl.innerHTML = "";

      if (kind === "video") {
        const videoEl = document.createElement("video");
        videoEl.className = "hs-video";
        videoEl.src = src;
        videoEl.controls = true;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.preload = "metadata";
        videoEl.muted = false;
        setTimeout(() => {
          const p = videoEl.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        }, 0);

        contentEl.appendChild(videoEl);
        controlsEl.style.display = "flex";
        fullscreenBtn.onclick = () => {
          if (videoEl.requestFullscreen) videoEl.requestFullscreen();
          else if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
        };
      } else {
        const imgEl = document.createElement("img");
        imgEl.src = src;
        imgEl.alt = "Hotspot detail";
        imgEl.className = "hs-img";
        contentEl.appendChild(imgEl);
        controlsEl.style.display = "none";
      }

      overlay.classList.add("show");
    };

    return () => {
      overlay.remove();
      style.remove();
      delete window.__openHotspotModal;
    };
  }, []);

  // CSS for the toggle switch UI
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hotspot-toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
      .hotspot-toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
      input:checked + .slider { background-color: #2966a3; }
      input:checked + .slider:before { transform: translateX(20px); }
      .slider.round { border-radius: 24px; }
      .slider.round:before { border-radius: 50%; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Effect to control hotspot visibility via CSS
  useEffect(() => {
    const styleId = "hotspot-visibility-style";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = showHotspots ? "" : ".hs-blinker, .hs-inline { display: none !important; }";
  }, [showHotspots]);

  // IMPORTANT: add autoLoad true here too (removes "click to load" mode)
  const config = { autoLoad: true, autoRotate: 0, pitch: 0, yaw: -98, hfov: 115 };

  // ONLY CHANGE: when user enters, show loader & init pano behind it
  const handleEnterPlane = () => {
    try { audioRef.current?.pause(); } catch { }
    setShowPanorama(true);     // go to cockpit view branch
    setIsPanoLoading(true);    // show our React loader (covers hex/placeholder)

    // initialize pano (autoLoad true so there's no "click to load")
    setTimeout(() => {
      ReactPannellum.initScene("firstScene", {
        type: "equirectangular",
        panorama: bgimg,
        autoLoad: true,
        autoRotate: 0,
      });
    }, 100);
  };

  // Add hotspots once when panorama is shown
  useEffect(() => {
    if (!showPanorama) return;

    // Inline panel hotspot (image preview)
    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -65,
          yaw: -50,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {

            hotSpotDiv.id = "hs-inline-panel";
            hotspotDomRef.current["checklist"] = hotSpotDiv;
            hotSpotDiv.classList.add("hs-inline");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);

            const panel = document.createElement("div");
            panel.className = "hs-inline-panel";
            panel.innerHTML = `<img src="/hover.jpg" alt="Details" class="hs-inline-img"/>`;
            hotSpotDiv.appendChild(panel);

            const toggle = () => hotSpotDiv.classList.toggle("open");
            hotSpotDiv.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
            document.addEventListener("click", () => hotSpotDiv.classList.remove("open"));
          },
        },
        "firstScene"
      );
    }, 350);

    registerHotspot("checklist", {
      pitch: -65,
      yaw: -50,
      kind: "inline",            // special: not a modal; it's the floating panel
      onClick: () => {
        // focus camera then show the inline panel
        try {
          ReactPannellum.setYaw(-50, 500);
          ReactPannellum.setPitch(-65, 500);
        } catch { }
        const el = hotspotDomRef.current["checklist"];
        if (el) el.classList.add("open");
      },
    });

    // === Example: VIDEO hotspot (autoplays with audio + fullscreen control) ===
    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -5,
          yaw: -117,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () => {
              if (window.__openHotspotModal) {
                window.__openHotspotModal("/videos/altimeter.mp4", "video");
              }
            };
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("altimeter", {
      pitch: -5, yaw: -117, kind: "video", src: "/videos/altimeter.mp4",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/videos/altimeter.mp4", "video")
    });

    // Image modal hotspots (unchanged)
    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -40,
          yaw: -133,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/landing.png", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("landing", {
      pitch: -40, yaw: -133, kind: "image", src: "/landing.png",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/landing.png", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -19,
          yaw: -73,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/hotspot3.jpg", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("engine", {
      pitch: -19, yaw: -73, kind: "image", src: "/hotspot3.jpg",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/hotspot3.jpg", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: 0,
          yaw: -150,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/map.png", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("map", {
      pitch: 0, yaw: -150, kind: "image", src: "/map.png",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/map.png", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -10,
          yaw: -95,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/hotspot5.jpg", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("PFD", {
      pitch: -10, yaw: -95, kind: "image", src: "/hotspot5.jpg",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/hotspot5.jpg", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -17,
          yaw: -118,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/hotspot6.png", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("battery bus", {
      pitch: -17, yaw: -118, kind: "image", src: "/hotspot6.png",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/hotspot6.png", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -30,
          yaw: -116,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/hotspot7.jpg", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("radio", {
      pitch: -30, yaw: -116, kind: "image", src: "/hotspot7.jpg",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/hotspot7.jpg", "image")
    });

    setTimeout(() => {
      ReactPannellum.addHotSpot(
        {
          pitch: -57,
          yaw: -205,
          type: "custom",
          createTooltipFunc: (hotSpotDiv) => {
            hotSpotDiv.classList.add("hs-blinker");
            const dot = document.createElement("span");
            dot.className = "hs-dot";
            hotSpotDiv.appendChild(dot);
            hotSpotDiv.onclick = () =>
              window.__openHotspotModal && window.__openHotspotModal("/hotspot8.jpg", "image");
          },
        },
        "firstScene"
      );
    }, 200);

    registerHotspot("battery bus", {
      pitch: -57, yaw: -205, kind: "image", src: "/hotspot8.jpg",
      onClick: () => window.__openHotspotModal && window.__openHotspotModal("/hotspot8.jpg", "image")
    });

  }, [showPanorama]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Voice status */}
      <VoiceWaveIndicator
        isAwake={isAwake}
        listening={isListening}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        finalTranscript={finalTranscript} 
      />
    
      {!showPanorama ? (
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              objectFit: "cover", zIndex: 0
            }}
          >
            <source src="/videos/landing2.mp4" type="video/mp4" />
          </video>

          {/* Black transparent overlay */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1
          }} />

          <audio
            ref={audioRef}
            src="/audio/landing2.mp3"
            loop
            muted={isAudioMuted}
            autoPlay
            playsInline
          />
          {/* Landing page audio control pill */}
          <div style={{
            position: "absolute", top: "20px", right: "20px", zIndex: 3,
            background: "rgba(0,0,0,0.55)", borderRadius: "999px",
            padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px",
            color: "#fff", fontWeight: 700, fontFamily: "'Product Sans', sans-serif"
          }}>
            <button
              onClick={() => {
                const el = audioRef.current;
                if (!el) return;
                // if unmuting for the first time, ensure it’s actually playing
                if (isAudioMuted && el.paused) {
                  const p = el.play?.();
                  if (p && typeof p.catch === "function") p.catch(() => { });
                }
                setIsAudioMuted(m => !m);
                el.muted = !el.muted;
              }}
              style={{
                border: "none", outline: "none", cursor: "pointer",
                padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.12)",
                color: "white", fontSize: "14px"
              }}
              aria-label={isAudioMuted ? "Unmute landing audio" : "Mute landing audio"}
              title={isAudioMuted ? "Unmute" : "Mute"}
            >
              {isAudioMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          </div>


          {/* Center content: logo, text, button (unchanged) */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", color: "white", zIndex: 2,
          }}>
            <img src="/images/IAF_logo.svg" alt="IAF Logo" className="fade-in delay-1"
              style={{ width: "auto", marginBottom: "10px" }} />
            <div className="fade-in delay-2" style={{
              fontFamily: "'Product Sans', sans-serif", fontSize: "28px", fontWeight: 700, marginBottom: "0px",
              translate: "0 -50px"
            }}>
              <h1 style={{ textTransform: "uppercase", fontFamily:"Ananda Namaste 400" }} className="hero-text-heading">"EkLavya"</h1>
              <span className="hero-text-subheading">THE AI FLIGHT INSTRUCTOR</span>
            </div>
            <button
              onClick={handleEnterPlane}
              className="fade-in delay-3"
              style={{
                padding: '16px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)';
              }}
            >
              Enter the Cockpit
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Pannellum canvas */}
          <ReactPannellum
            id="panorama"
            sceneId="firstScene"
            imageSource={bgimg}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />

          {/* SECOND SCREEN LOADER overlays the hex/placeholder until done */}
          {isPanoLoading && (
            <LoadingScreen onLoadingComplete={() => setIsPanoLoading(false)} />
          )}

          <button
            onClick={() => setShowPanorama(false)}
            style={{
              position: "absolute", top: "30px", left: "30px",
              padding: "12px 24px", fontSize: "16px", fontWeight: 700,
              fontFamily: "'Product Sans', sans-serif",
              backgroundColor: "rgba(255,255,255,0.9)", color: "#2966a3",
              border: "2px solid #2966a3", borderRadius: "25px",
              cursor: "pointer", zIndex: 1000,
            }}
          >
            ← Back to View
          </button>

          <div
            style={{
              position: "absolute", top: "30px", right: "30px", zIndex: 1001, display: "flex",
              alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)", padding: "8px 12px",
              borderRadius: "20px", color: "#2966a3", fontWeight: "bold",
              fontFamily: "'Product Sans', sans-serif", fontSize: "14px",
            }}
          >
            <span>Hotspots</span>
            <label className="hotspot-toggle-switch" style={{ marginLeft: "10px" }}>
              <input type="checkbox" checked={showHotspots} onChange={() => setShowHotspots(!showHotspots)} />
              <span className="slider round"></span>
            </label>
          </div>
        </>
      )}

      {/* Chatbot Sticky Icon */}
      <div
        className="chatbot-sticky-icon"
        onClick={() => setShowChatbot(true)}
        style={{
          position: "fixed", bottom: isMobile ? "110px" : "100px", right: "30px",
          width: "60px", height: "60px", backgroundColor: "#2966a3", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)", zIndex: 1000,
        }}
      >
        <img src={chatbotImg} alt="chatbot" style={{ width: "60px", height: "60px", borderRadius: "30px" }} />
      </div>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div
          style={{
            position: "fixed", bottom: "20px", right: "20px", width: "600px",
            borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 1001,
            display: "flex", flexDirection: "column", overflow: "hidden", height: "800px"
          }}
        >
          <button
            onClick={() => setShowChatbot(false)}
            style={{
              alignSelf: "flex-end", margin: "8px", border: "none", fontSize: "20px",
              cursor: "pointer", fontFamily: "'Product Sans', sans-serif"
            }}
          >
          </button>
          <Chatbot isChatBotVisible={showChatbot} handleCloseChatBot={closeShowChatBot} />
        </div>
      )}
    </div>
  );
};

export default MainSection;
