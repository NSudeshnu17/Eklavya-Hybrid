import React, { useState, useEffect } from 'react';

const VoiceWaveIndicator = ({ 
  isAwake = false, 
  listening = false, 
  browserSupportsSpeechRecognition = true,
  finalTranscript = ''
}) => {
  const [animationIntensity, setAnimationIntensity] = useState(0);

  // Simulate audio level changes when listening and awake
  useEffect(() => {
    if (listening && isAwake) {
      const interval = setInterval(() => {
        // Create more dynamic animation based on speech activity
        const baseIntensity = 0.3;
        const randomVariation = Math.random() * 0.7;
        setAnimationIntensity(baseIntensity + randomVariation);
      }, 150);
      return () => clearInterval(interval);
    } else if (listening) {
      // When listening but not awake (waiting for wake word), gentle pulse
      const interval = setInterval(() => {
        setAnimationIntensity(0.2 + Math.random() * 0.3);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setAnimationIntensity(0);
    }
  }, [listening, isAwake, finalTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{
        position: "fixed", 
        top: 20, 
        left: 20, 
        zIndex: 4000,
        background: "rgba(255,0,0,0.8)", 
        color: "#fff",
        padding: "8px 12px", 
        borderRadius: 20, 
        fontSize: 12,
        fontFamily: "'Product Sans', sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        🚫 Speech not supported
      </div>
    );
  }

  const getStatusColor = () => {
    if (!listening) return "#666";
    if (isAwake) return "#00ff88";
    return "#ff6b35";
  };

  const getStatusText = () => {
    if (!listening) return "Idle";
    if (isAwake) return "Listening";
    return "Say 'Buddy'";
  }; 

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      zIndex: 4000,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      pointerEvents: "none" // Prevent any interaction issues
    }}>
      {/* Sound Wave Circle */}
      <div style={{
        position: "relative",
        width: "50px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Outer waves - only show when listening */}
        {listening && [1, 2, 3].map((index) => (
          <div
            key={`wave-${index}`}
            style={{
              position: "absolute",
              width: `${30 + index * 8 + (isAwake ? animationIntensity * 20 : animationIntensity * 8)}px`,
              height: `${30 + index * 8 + (isAwake ? animationIntensity * 20 : animationIntensity * 8)}px`,
              border: `2px solid ${getStatusColor()}`,
              borderRadius: "50%",
              opacity: Math.max(0.1, 0.6 - index * 0.2 - animationIntensity * 0.2),
              animation: `voicePulse${index} ${isAwake ? '1s' : '2s'} ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
        
        {/* Center circle with microphone */}
        <div style={{
          width: "30px",
          height: "30px",
          backgroundColor: getStatusColor(),
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "white",
          zIndex: 1,
          transform: listening && isAwake ? `scale(${1 + animationIntensity * 0.2})` : "scale(1)",
          transition: "all 0.2s ease",
          boxShadow: `0 0 ${listening ? 8 + animationIntensity * 4 : 4}px ${getStatusColor()}33`
        }}>
          🎙️
        </div>

        {/* Sound bars around the circle - only when awake and listening */}
        {listening && isAwake && [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
          const angle = (index * 45) * (Math.PI / 180);
          const distance = 35 + animationIntensity * 8;
          const height = 3 + Math.sin(Date.now() * 0.01 + index) * animationIntensity * 8;
          
          return (
            <div
              key={`bar-${index}`}
              style={{
                position: "absolute",
                width: "2px",
                height: `${Math.max(2, height)}px`,
                backgroundColor: getStatusColor(),
                borderRadius: "1px",
                left: `${25 + Math.cos(angle) * distance}px`,
                top: `${25 + Math.sin(angle) * distance - height/2}px`,
                transform: `rotate(${index * 45 + 90}deg)`,
                opacity: 0.6 + animationIntensity * 0.4,
                transition: "all 0.1s ease"
              }}
            />
          );
        })}
      </div>

      {/* Status Text */}
      <div style={{
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 15,
        fontSize: 12,
        fontFamily: "'Product Sans', sans-serif",
        fontWeight: "500",
        border: `1px solid ${getStatusColor()}`,
        minWidth: "100px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        backdropFilter: "blur(4px)"
      }}>
        {getStatusText()}
      </div>

      {/* CSS Animations - inject into document head */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes voicePulse1 {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          @keyframes voicePulse2 {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.15); opacity: 0.25; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          @keyframes voicePulse3 {
            0% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 0.2; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `
      }} />
    </div>
  );
};

export default VoiceWaveIndicator;