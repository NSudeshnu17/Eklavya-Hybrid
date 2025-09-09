import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { FiVolume2, FiUser, FiPause, FiPlay, FiSquare } from 'react-icons/fi';
import Embedhtml from './Embedhtml';
import chatboticon from '../../../img/roundel.png';

const MessageComponent = React.memo(({ message, isDarkContrast, speakText }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const handleSpeechControl = (action) => {
    if (!('speechSynthesis' in window)) return;

    switch (action) {
      case 'play':
        if (isPaused && currentUtterance) {
          // Resume paused speech
          speechSynthesis.resume();
          setIsPaused(false);
          setIsPlaying(true);
        } else {
          // Start new speech
          speechSynthesis.cancel(); // Cancel any existing speech
          const cleanText = message.text.replace(/<[^>]*>/g, '').replace(/[#*>`]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          
          utterance.rate = 0.8;
          utterance.pitch = 1;
          utterance.volume = 1;
          
          utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
          };
          
          utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentUtterance(null);
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentUtterance(null);
          };
          
          setCurrentUtterance(utterance);
          speechSynthesis.speak(utterance);
        }
        break;
        
      case 'pause':
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
          speechSynthesis.pause();
          setIsPaused(true);
          setIsPlaying(false);
        }
        break;
        
      case 'stop':
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        break;
    }
  };
  const messageStyle = {
    display: 'flex',
    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
    marginBottom: '20px',
    alignItems: 'flex-end',
  };

  const bubbleStyle = {
    maxWidth: message.sender === 'user' ? '75%' : '85%',
    padding: '16px 20px',
    background: message.sender === 'user' 
      ? 'linear-gradient(135deg, #002cf1ff 0%, #0089d9ff 100%)'
      : isDarkContrast 
        ? 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: message.sender === 'user' 
      ? '20px 20px 8px 20px' 
      : '20px 20px 20px 8px',
    color: message.sender === 'user' ? '#ffffff' : isDarkContrast ? '#e2e8f0' : '#2d3748',
    boxShadow: message.sender === 'user'
      ? '0 8px 24px rgba(102, 126, 234, 0.4)'
      : '0 4px 20px rgba(0, 0, 0, 0.08)',
    fontSize: '15px',
    lineHeight: '1.5',
    textAlign: 'left',
    wordBreak: 'break-word',
    border: message.sender === 'user' ? 'none' : isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
    position: 'relative',
  };

  const tailStyle = {
    position: 'absolute',
    bottom: '8px',
    [message.sender === 'user' ? 'right' : 'left']: '-8px',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: message.sender === 'user' ? '8px 0 0 8px' : '8px 8px 0 0',
    borderColor: message.sender === 'user' 
      ? 'transparent transparent transparent #667eea'
      : isDarkContrast
        ? 'transparent #4a5568 transparent transparent'
        : 'transparent #e2e8f0 transparent transparent',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(message.sender === 'user' 
      ? {
          marginLeft: '12px',
          background: 'linear-gradient(135deg, #002efdff 0%, #0080ffff 100%)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        }
      : {
          marginRight: '12px',
        }
    )
  };

  const markdownComponents = useMemo(() => ({
    p: ({ node, ...props }) => <p style={{ margin: '8px 0', lineHeight: '1.6' }} {...props} />,
    ul: ({ node, ...props }) => <ul style={{ margin: '12px 0', paddingLeft: '20px' }} {...props} />,
    ol: ({ node, ...props }) => <ol style={{ margin: '12px 0', paddingLeft: '20px' }} {...props} />,
    li: ({ node, ...props }) => <li style={{ margin: '6px 0', lineHeight: '1.6' }} {...props} />,
    
    // Enhanced heading styles with better hierarchy
    h1: ({ node, ...props }) => (
      <h1 style={{ 
        margin: '20px 0 12px 0', 
        fontSize: '22px', 
        fontWeight: '700', 
        color: isDarkContrast ? '#f1f5f9' : '#1a202c',
        borderBottom: isDarkContrast ? '2px solid #4a5568' : '2px solid #e2e8f0',
        paddingBottom: '8px'
      }} {...props} />
    ),
    
    h2: ({ node, ...props }) => (
      <h2 style={{ 
        margin: '18px 0 10px 0', 
        fontSize: '18px', 
        fontWeight: '600', 
        color: isDarkContrast ? '#f1f5f9' : '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }} {...props} />
    ),
    
    h3: ({ node, ...props }) => (
      <h3 style={{ 
        margin: '14px 0 8px 0', 
        fontSize: '16px', 
        fontWeight: '600', 
        color: isDarkContrast ? '#f1f5f9' : '#2d3748' 
      }} {...props} />
    ),
    
    // Enhanced strong/bold with context-aware coloring
    strong: ({ node, children, ...props }) => {
      const text = children ? children.toString() : '';
      let color = isDarkContrast ? '#ffffff' : '#1a202c';
      
      // Color coding based on content
      if (text.includes('Errors Found') || text.includes('❌')) {
        color = '#f56565'; // Red for errors
      } else if (text.includes('Important Cautions') || text.includes('⚠️')) {
        color = '#ed8936'; // Orange for cautions
      } else if (text.includes('Expected Communications') || text.includes('📡')) {
        color = '#4299e1'; // Blue for communications
      } else if (text.includes('Expected Checklist') || text.includes('✅')) {
        color = '#48bb78'; // Green for expected items
      } else if (text.includes('Performance Score') || text.includes('🏆') || text.includes('🎯')) {
        color = '#9f7aea'; // Purple for scores
      }
      
      return <strong style={{ fontWeight: '700', color }} {...props}>{children}</strong>;
    },
    
    // Enhanced blockquotes with color-coded backgrounds
    blockquote: ({ node, children, ...props }) => {
      const text = children ? children.toString() : '';
      let borderColor = '#cbd5e0';
      let backgroundColor = isDarkContrast ? 'rgba(74, 85, 104, 0.3)' : 'rgba(237, 242, 247, 0.5)';
      
      // Color coding for different types of messages
      if (text.includes('❌')) {
        borderColor = '#f56565';
        backgroundColor = isDarkContrast ? 'rgba(245, 101, 101, 0.1)' : 'rgba(254, 226, 226, 0.8)';
      } else if (text.includes('🔶') || text.includes('⚠️')) {
        borderColor = '#ed8936';
        backgroundColor = isDarkContrast ? 'rgba(237, 137, 54, 0.1)' : 'rgba(255, 235, 213, 0.8)';
      } else if (text.includes('💡')) {
        borderColor = '#4299e1';
        backgroundColor = isDarkContrast ? 'rgba(66, 153, 225, 0.1)' : 'rgba(219, 234, 254, 0.8)';
      } else if (text.includes('🎙️') || text.includes('📡')) {
        borderColor = '#9f7aea';
        backgroundColor = isDarkContrast ? 'rgba(159, 122, 234, 0.1)' : 'rgba(237, 233, 254, 0.8)';
      }
      
      return (
        <blockquote style={{
          margin: '12px 0',
          padding: '12px 16px',
          borderLeft: `4px solid ${borderColor}`,
          backgroundColor,
          borderRadius: '0 8px 8px 0',
          fontSize: '14px',
          lineHeight: '1.6',
        }} {...props}>
          {children}
        </blockquote>
      );
    },
    
    // Enhanced code blocks
    code: ({ node, inline, ...props }) => {
      if (inline) {
        return <code style={{ 
          backgroundColor: isDarkContrast ? '#4a5568' : '#edf2f7',
          color: isDarkContrast ? '#e2e8f0' : '#2d3748',
          padding: '3px 6px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }} {...props} />;
      } else {
        return (
          <pre style={{
            backgroundColor: isDarkContrast ? '#2d3748' : '#f7fafc',
            color: isDarkContrast ? '#e2e8f0' : '#2d3748',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            border: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0',
            margin: '12px 0'
          }}>
            <code {...props} />
          </pre>
        );
      }
    },
    
    // Enhanced lists with better spacing
    ul: ({ node, ...props }) => (
      <ul style={{ 
        margin: '12px 0', 
        paddingLeft: '20px',
        listStyleType: 'none'
      }} {...props} />
    ),
    
    // Custom list items with emojis and colors
    li: ({ node, children, ...props }) => {
      const text = children ? children.toString() : '';
      let bulletColor = isDarkContrast ? '#a0aec0' : '#718096';
      let bullet = '•';
      
      // Don't add custom bullet if content already has emojis
      if (text.includes('❌') || text.includes('🔶') || text.includes('💡') || text.includes('🎙️') || text.includes('✅')) {
        bullet = '';
      } else {
        bullet = '▸ ';
        bulletColor = '#4299e1';
      }
      
      return (
        <li style={{ 
          margin: '8px 0', 
          lineHeight: '1.6',
          position: 'relative',
          paddingLeft: bullet ? '16px' : '0'
        }} {...props}>
          {bullet && (
            <span style={{
              position: 'absolute',
              left: '0',
              color: bulletColor,
              fontWeight: 'bold'
            }}>
              {bullet}
            </span>
          )}
          {children}
        </li>
      );
    },
  }), [isDarkContrast]);

  return (
    <div style={messageStyle}>
      {/* Bot Avatar */}
      {message.sender === 'bot' && (
        <div style={avatarStyle}>
          <img src={chatboticon} alt="Bot" />
        </div>
      )}
      
      <div style={bubbleStyle}>
        {/* Message tail */}
        <div style={tailStyle} />

        <ReactMarkdown components={markdownComponents}>
          {message.text}
        </ReactMarkdown>

        {/* Visualization embed */}
        {message.sender === 'bot' && message.embedHtml && (
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              fontWeight: '600',
              fontSize: '14px',
              color: isDarkContrast ? '#a0aec0' : '#4a5568'
            }}>
              📊 <span>Interactive Visualization</span>
            </div>
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              border: isDarkContrast ? '1px solid #4a5568' : '1px solid #e2e8f0'
            }}>
              <Embedhtml html={message.embedHtml} />
            </div>
          </div>
        )}

        {/* Audio controls for bot messages */}
        {message.sender === 'bot' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isPlaying && !isPaused && (
              <button
                onClick={() => handleSpeechControl('play')}
                style={{
                  fontSize: '13px',
                  background: 'linear-gradient(135deg, #006beeff 0%, #006ad4ff 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                <FiVolume2 size={14} />
                Listen
              </button>
            )}
            
            {isPlaying && (
              <>
                <button
                  onClick={() => handleSpeechControl('pause')}
                  style={{
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(237, 137, 54, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(237, 137, 54, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(237, 137, 54, 0.3)';
                  }}
                >
                  <FiPause size={14} />
                  Pause
                </button>
                
                <button
                  onClick={() => handleSpeechControl('stop')}
                  style={{
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(245, 101, 101, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(245, 101, 101, 0.3)';
                  }}
                >
                  <FiSquare size={14} />
                  Stop
                </button>
              </>
            )}
            
            {isPaused && (
              <>
                <button
                  onClick={() => handleSpeechControl('play')}
                  style={{
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(72, 187, 120, 0.3)';
                  }}
                >
                  <FiPlay size={14} />
                  Resume
                </button>
                
                <button
                  onClick={() => handleSpeechControl('stop')}
                  style={{
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(245, 101, 101, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(245, 101, 101, 0.3)';
                  }}
                >
                  <FiSquare size={14} />
                  Stop
                </button>
              </>
            )}
            
            {/* Audio status indicator */}
            {(isPlaying || isPaused) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '12px',
                background: isDarkContrast ? 'rgba(74, 85, 104, 0.6)' : 'rgba(237, 242, 247, 0.8)',
                fontSize: '11px',
                color: isDarkContrast ? '#cbd5e0' : '#4a5568',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isPlaying ? '#48bb78' : '#ed8936',
                  animation: isPlaying ? 'pulse 1s infinite' : 'none',
                }} />
                {isPlaying ? 'Playing...' : 'Paused'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {message.sender === 'user' && (
        <div style={avatarStyle}>
          <FiUser size={18} color="white" />
        </div>
      )}
    </div>
  );
});

MessageComponent.displayName = 'MessageComponent';

MessageComponent.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    embedHtml: PropTypes.string,
  }).isRequired,
  isDarkContrast: PropTypes.bool.isRequired,
  speakText: PropTypes.func.isRequired,
};

export default MessageComponent;