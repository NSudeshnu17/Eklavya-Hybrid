import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import { ScrollPanel } from 'primereact/scrollpanel';
import MessageComponent from './MessageComponent';
import chatboticon from '../../../img/roundel.png';
import '../AboutUs.css';
import { cleanString } from '../../../utils/clearString';
import useVoiceCommands from "../../../hooks/useVoiceCommands";
import { playTTS } from "../../../utils/tts";

// =====================================================================================
// ASR DOMAIN NORMALIZER
// - Converts common cockpit mis-hearings before appending to the text area
// - Collapse duplicated words like "checks check"
// - Keeps output tidy for downstream evaluation
// =====================================================================================
const DOMAIN_MAP = [
  [/\bcock\s*pit\b/g, "cockpit"],
  [/\bpuppet(s)?\b/g, "cockpit"],
  [/\bcorporate\b/g, "cockpit"],
  [/\bcopy(?:ied|ed)?\b/g, "cockpit"],
  [/\boct\b/g, "cockpit"],
  [/\bchecks?\s+check(s)?\b/g, "checks"],
];

function normalizeASR(raw = "") {
  let t = (raw || "").toLowerCase();
  for (const [rx, rep] of DOMAIN_MAP) t = t.replace(rx, rep);
  t = t.replace(/\binitial\s+(cockpit|copit|cop it|puppet|corporate|copy)\s+checks?\b/g, "initial cockpit checks");
  t = t.replace(/\bcockpit\s+check(?:ed|s)?\b/g, "cockpit checks");
  // de-noise extra spaces
  return t.replace(/\s{2,}/g, " ").trim();
}

const Chatbot = ({ isChatBotVisible, handleCloseChatBot }) => {

  // ===================================================================================
  // STATE
  // ===================================================================================
  const [mode, setMode] = useState(null); // 'practice' | 'chat' | null
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dictating, setDictating] = useState(false);

  // Refs to manage streaming deltas and focusing
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevStreamRef = useRef(''); // remembers the previous full text frame (after normalization)

  // Server URL: leave WITHOUT ?mode=free so backend can use wake+command grammar
  const websocketUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:3000/stt`;

  // Hook that streams PCM16@16k to /stt and surfaces transcripts + wake/command toggles
  const {
    isListening,
    setIsListening,
    finalTranscript,
    browserSupportsSpeechRecognition
  } = useVoiceCommands([], websocketUrl);

  const API_BASE_URL = 'http://localhost:8000';
  const isDarkContrast = document.body.classList.contains('darkContrast');

  // ===================================================================================
  // UNIFIED STT STREAMING EFFECT
  // - Merges earlier duplicate effects
  // - Applies normalizeASR to both new full text and the delta
  // - De-dupes identical frames to reduce churn
  // - Detects "stop checklist" and gracefully ends dictation
  // ===================================================================================
  useEffect(() => {
    if (!isListening || !dictating) return;
    if (!finalTranscript) return;

    // de-dupe to avoid re-appending the same frame
    if (finalTranscript === prevStreamRef.current) return;

    // normalize the incoming text and compute delta vs previous
    const newTextRaw = finalTranscript || '';
    const newText = normalizeASR(newTextRaw);

    const prev = prevStreamRef.current || '';
    const deltaRaw = newText.startsWith(prev) ? newText.slice(prev.length) : newText;
    const delta = normalizeASR(deltaRaw);

    // recognize stop phrase anywhere in the full text
    const STOP_RE = /\b(end|stop|finish|complete(?:d)?)\s+(?:the\s+)?check\s*list\b/gi;
    const hasStop = STOP_RE.test(newText);

    // remove stop directives from the portion we append
    const cleanDelta = delta.replace(STOP_RE, '').replace(/\s{2,}/g, ' ').trimStart();

    if (cleanDelta) {
      setInputText(t => t + (t.endsWith(' ') || t.length === 0 ? '' : ' ') + cleanDelta);
    }

    // advance the streaming cursor AFTER using newText
    prevStreamRef.current = newText;

    // gracefully end dictation if user says stop/finish/complete checklist
    if (hasStop) {
      setDictating(false);
      setIsListening(false); // hook will send {action:'stop'} to the server
      playTTS('Checklist ended').catch(() => {});
    }
  }, [finalTranscript, isListening, dictating, setIsListening]);

  // ===================================================================================
  // INITIAL MESSAGES PER MODE
  // ===================================================================================
  useEffect(() => {
    if (mode === 'practice') {
      setMessages([
        {
          id: 1,
          text: "Jai Hind, Cadet! Welcome to AI Flight Instructor. You are here to practice checks and make your skills sharper. Ready to begin?",
          sender: 'bot',
        },
      ]);
    } else if (mode === 'chat') {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your AI assistant. Feel free to ask me anything and I'll be happy to help you. What would you like to know?",
          sender: 'bot',
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [mode]);

  // ===================================================================================
  // AUTO-SCROLL TO LATEST
  // ===================================================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ===================================================================================
  // API CALL HANDLER (Practice vs Chat)
  //  - Practice: expects evaluation / checklist fields, formats with sections
  //  - Chat: simple text response (with optional embed detection)
  // ===================================================================================
  const callChatAPI = useCallback(async (message) => {
    try {
      const endpoint = mode === 'practice' ? '/evaluate' : '/chat/';
      const requestBody = mode === 'practice'
        ? { transcript: message }
        : { query: message };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const rawText = await response.text();
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(rawText);
      } catch {
        parsedResponse = mode === 'practice' ? { summary: rawText } : { response: rawText };
      }

      if (mode === 'practice') {
        const summaryText = parsedResponse.summary || parsedResponse.text || rawText;
        let formattedResponse = '';

        if (parsedResponse.detected_checklist?.name) {
          formattedResponse += `## ✈️ Checklist Detected\n**${parsedResponse.detected_checklist.name}**\n\n`;
        }

        if (parsedResponse.marks) {
          const marks = parsedResponse.marks;
        //   let scoreIcon = '📊';
        //   if (marks.includes('Excellent') || marks.includes('5/5')) scoreIcon = '🏆';
        //   else if (marks.includes('Good') || marks.includes('4/5')) scoreIcon = '🎯';
        //   else if (marks.includes('Average') || marks.includes('3/5')) scoreIcon = '⚡';
        //   else if (marks.includes('Below') || marks.includes('Poor') || marks.includes('1/5') || marks.includes('2/5')) scoreIcon = '⚠️';
        //   formattedResponse += `## ${scoreIcon} Performance Score\n**${parsedResponse.marks}**\n\n`;
        }

        if (parsedResponse.errors?.length) {
          formattedResponse += `## 🚨 **Errors Found**\n`;
          parsedResponse.errors.forEach(error => {
            const cleanError = error.replace(/^•\s*/, '').trim();
            formattedResponse += `> ❌ **${cleanError}**\n\n`;
          });
        }

        if (parsedResponse.cautions?.length) {
          formattedResponse += `## ⚠️ **Important Cautions**\n`;
          parsedResponse.cautions.forEach(caution => {
            const cleanCaution = caution.replace(/^-\s*/, '').trim();
            if (cleanCaution) formattedResponse += `> 🔶 ${cleanCaution}\n\n`;
          });
        }

        if (parsedResponse.notes?.length) {
          formattedResponse += `## 📝 **Notes**\n`;
          parsedResponse.notes.forEach(note => {
            const cleanNote = note.replace(/^-\s*/, '').trim();
            if (cleanNote) formattedResponse += `> 💡 ${cleanNote}\n\n`;
          });
        }

        if (parsedResponse.conversations?.length) {
          formattedResponse += `## 📡 **Expected Communications**\n`;
          parsedResponse.conversations.forEach(conv => {
            if (conv.trim()) formattedResponse += `> 🎙️ ${conv}\n\n`;
          });
        }

        if (parsedResponse.expected_checks?.length) {
          formattedResponse += `## ✅ **Expected Checklist Items**\n`;
          parsedResponse.expected_checks.forEach(check => {
            if (check.trim()) formattedResponse += `- ${check}\n`;
          });
        }

        const embedMatch = summaryText.match(/<iframe[\s\S]*?<\/iframe>/i);
        const embedHtml = embedMatch ? embedMatch[0].trim() : '';

        return {
          text: formattedResponse || summaryText || "I apologize, but I couldn't process your checklist properly. Could you please try running through the checklist again?",
          embedHtml,
        };
      } else {
        const responseText = parsedResponse.response || rawText;
        return {
          text: responseText || "I apologize, but I couldn't process your message properly. Could you please try rephrasing your question?",
          embedHtml: '',
        };
      }
    } catch (error) {
      console.error('API call failed:', error);
      const errorMessage = mode === 'practice'
        ? 'I encountered an issue while evaluating your checklist. Please try again, and if the problem persists, check your connection.'
        : 'I encountered an issue while processing your message. Please try again, and if the problem persists, check your connection.';
      return { text: errorMessage, embedHtml: '' };
    }
  }, [API_BASE_URL, mode]);

  // ===================================================================================
  // SEND MESSAGE (user -> server -> bot)
  // ===================================================================================
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInputText = inputText;
    setInputText('');
    setIsLoading(true);

    setTimeout(() => inputRef.current?.focus(), 50);

    try {
      const botResponse = await callChatAPI(currentInputText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        embedHtml: botResponse.embedHtml,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Speak bot reply through Piper
      const cleanedString = cleanString(botMessage.text);
      playTTS(cleanedString).catch(() => {});
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Something unexpected happened. Let me try to help you again - please resend your message.",
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputText, isLoading, callChatAPI]);

  // ===================================================================================
  // STYLES
  // ===================================================================================
  const containerStyle = {
    width: '100%',
    height: '12 rem',
    padding: "30px 0",
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    background: isDarkContrast
      ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
      : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
    border: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: "blur(2px) saturate(200%)",
    webkitBackdropFilter: "blur(2px) saturate(200%)",
    backgroundColor: "rgba(17, 25, 40, 0.59)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.125)"
  };

  const headerStyle = {
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #042ff0ff 0%, #009dffff 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  };

  const inputAreaStyle = {
    padding: '20px 24px',
    background: isDarkContrast ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderTop: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
  };

  // ===================================================================================
  // LISTENING TOGGLE
  // ===================================================================================
  const startListening = useCallback(() => {
    prevStreamRef.current = '';        // reset delta cursor
    setDictating(true);
    setIsListening(true);              // hook opens WS and streams to /stt
  }, [setIsListening]);

  const stopListening = useCallback(() => {
    setDictating(false);
    setIsListening(false);             // hook sends {action:'stop'} and closes WS
  }, [setIsListening]);

  // ===================================================================================
  // TTS WRAPPER
  // ===================================================================================
  const speakText = useCallback((text) => {
    playTTS((text || '').trim()).catch(() => {});
  }, []);

  // ===================================================================================
  // ENTER TO SEND
  // ===================================================================================
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // ===================================================================================
  // MEMOIZED MESSAGES
  // ===================================================================================
  const memoizedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageComponent
        key={message.id}
        message={message}
        isDarkContrast={isDarkContrast}
        speakText={speakText}
      />
    ));
  }, [messages, isDarkContrast, speakText]);

  // ===================================================================================
  // MODE SELECTION VIEW
  // ===================================================================================
  const renderModeSelection = () => (
    <>
      <div style={{
        ...containerStyle,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: "100%"
      }}>
        {isChatBotVisible && (
          <button
            onClick={handleCloseChatBot}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              fontSize: "18px",
              fontWeight: "bold",
              color: isDarkContrast ? "white" : "black",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            ✕
          </button>
        )}
        <div style={{
          background: isDarkContrast
            ? 'rgba(45, 55, 72, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
          maxWidth: '400px',
          width: '100%',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #042ff0ff 0%, #009dffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          }}>
            <img src={chatboticon} alt="Bot" style={{ width: '50px', height: '50px' }} />
          </div>

          <h2 style={{
            color: isDarkContrast ? '#f1f5f9' : '#1a202c',
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px 0',
          }}>
            Eklavya
          </h2>

          <p style={{
            color: isDarkContrast ? '#a0aec0' : '#718096',
            fontSize: '16px',
            margin: '0 0 32px 0',
            lineHeight: '1.5',
          }}>
            Choose your training mode to get started
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => setMode('practice')}
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
                display: 'flex',
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
              ✈️ Practice Mode
            </button>

            <button
              onClick={() => setMode('chat')}
              style={{
                padding: '16px 24px',
                borderRadius: '12px',
                border: isDarkContrast ? '2px solid #4a5568' : '2px solid #e2e8f0',
                background: isDarkContrast ? 'transparent' : 'white',
                color: isDarkContrast ? '#e2e8f0' : '#2d3748',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.borderColor = isDarkContrast ? '#4a5568' : '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              💬 Chat Mode
            </button>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: isDarkContrast
              ? 'rgba(74, 85, 104, 0.3)'
              : 'rgba(237, 242, 247, 0.8)',
            borderRadius: '8px',
            fontSize: '14px',
            color: isDarkContrast ? '#cbd5e0' : '#4a5568',
            textAlign: 'left',
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>✈️ Practice Mode:</strong> Run flight checklists and get detailed evaluation with scores and feedback.
            </div>
            <div>
              <strong>💬 Chat Mode:</strong> Ask general questions and get conversational responses from the AI assistant.
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!mode) {
    return renderModeSelection();
  }

  // ===================================================================================
  // MAIN RENDER
  // ===================================================================================
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src={chatboticon} alt="Bot" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {mode === 'practice' ? 'IAF AI Flight Instructor - Practice' : 'IAF AI Assistant - Chat'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            {mode === 'practice'
              ? 'AI enabled training for future IAF pilots'
              : 'Ask me anything and I\'ll help you learn'
            }
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={() => setMode(null)}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ← Back
        </button>
      </div>

      {/* Messages */}
      <ScrollPanel
        style={{
          width: '100%',
          flex: 1,
          overflowX: 'hidden',
          padding: '24px',
          background: 'transparent',
        }}
        className="custombar2 chatbot-scrollpanel"
      >
        {memoizedMessages}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px', alignItems: 'flex-end' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            }}>
              <img src={chatboticon} alt="Bot" />
            </div>
            <div style={{
              background: isDarkContrast
                ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '16px 20px',
              borderRadius: '20px 20px 20px 8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{
                  color: isDarkContrast ? '#a0aec0' : '#718096',
                  fontSize: '14px',
                  marginRight: '8px'
                }}>
                  {mode === 'practice' ? 'Validating the Checks ...' : 'Processing your message ...'}
                </span>
                {[0, 0.2, 0.4].map((delay, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      background: 'linear-gradient(135deg, #002fffff 0%, #0182dfff 100%)',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollPanel>

      {/* Input Area */}
      <div style={inputAreaStyle}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={mode === 'practice' ? "Run your Flight Checklist" : "Type your message here..."}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: isDarkContrast ? '2px solid #4a5568' : '2px solid #e2e8f0',
                borderRadius: '16px',
                resize: 'none',
                outline: 'none',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: isDarkContrast ? '#2d3748' : '#ffffff',
                color: isDarkContrast ? '#e2e8f0' : '#2d3748',
                transition: 'all 0.2s ease',
                minHeight: '52px',
                maxHeight: '120px',
              }}
              rows="1"
              disabled={isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkContrast ? '#4a5568' : '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {true && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '14px',
                borderRadius: '50%',
                border: 'none',
                background: isListening
                  ? 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'
                  : 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
                color: 'white',
                cursor: 'pointer',
                width: '52px',
                height: '52px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              disabled={isLoading}
            >
              {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
            </button>
          )}

          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '14px',
              borderRadius: '50%',
              border: 'none',
              background: !inputText.trim() || isLoading
                ? 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: !inputText.trim() || isLoading ? 'not-allowed' : 'pointer',
              width: '52px',
              height: '52px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <FiSend size={20} />
          </button>
        </div>

        {isListening && (
          <p style={{
            fontSize: '13px',
            color: '#f56565',
            marginTop: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#f56565',
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
            }} />
            🎤 {mode === 'practice' ? 'Run your Checklists' : 'Speak your message'}
          </p>
        )}
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;
