import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaTimes, FaSpinner, FaUser } from 'react-icons/fa';
import './ChatBot.css';

// Groq API Key
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Spectrum, your AI photography assistant. Ask me anything about photography, camera gear, editing tips, or our packages!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fix keyboard overlay on mobile using Visual Viewport API
  useEffect(() => {
    const handleResize = () => {
      const chatbotContainer = document.querySelector('.chatbot-container');
      const chatInput = document.querySelector('.chatbot-input');
      
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;
        
        if (keyboardHeight > 150) { // Keyboard is open
          if (chatbotContainer) {
            chatbotContainer.style.height = `calc(100% - ${keyboardHeight}px)`;
            chatbotContainer.classList.add('keyboard-open');
          }
          // Scroll to input
          setTimeout(() => {
            if (chatInput) {
              chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 50);
        } else {
          if (chatbotContainer) {
            chatbotContainer.style.height = '';
            chatbotContainer.classList.remove('keyboard-open');
          }
        }
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Check if question is photography-related
  const isPhotographyQuestion = (text) => {
    const keywords = [
      'camera', 'photo', 'photograph', 'lens', 'edit', 'light', 'exposure', 
      'aperture', 'shutter', 'iso', 'portrait', 'wedding', 'landscape', 
      'film', 'digital', 'sensor', 'flash', 'tripod', 'composition', 
      'raw', 'jpeg', 'photoshop', 'lightroom', 'capture', 'shoot', 'studio',
      'photography', 'photographer', 'picture', 'image', 'session',
      'تصوير', 'كاميرا', 'عدسة', 'بورتريه', 'زواج', 'تعديل', 'صور'
    ];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    if (!isPhotographyQuestion(userInput)) {
      const botMessage = {
        id: Date.now() + 1,
        text: "I'm Spectrum, your photography assistant. I can only help with photography-related questions. Feel free to ask about cameras, lenses, editing techniques, or our photography packages!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const history = [
        { 
          role: 'system', 
          content: `You are "Spectrum", an AI photography assistant for "Spectra Frames" photography agency. 
          
IMPORTANT RULES:
1. ONLY answer questions related to PHOTOGRAPHY, CAMERAS, EDITING, PHOTOGRAPHY SERVICES, and the SPECTRA FRAMES AGENCY.
2. Keep responses friendly, professional, and concise (max 3-4 sentences).
3. Mention Spectra Frames services when relevant: Wedding Photography, Portrait Sessions, Commercial Photography, Social Media Content, and our photography packages.
4. You can give photography tips, camera recommendations, editing advice, and explain photography concepts.
5. Do NOT provide contact information unless asked - then direct them to the contact form on the website.` 
        }
      ];
      
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        if (msg.sender === 'user') {
          history.push({ role: 'user', content: msg.text });
        } else if (msg.sender === 'bot' && msg.id !== 1) {
          history.push({ role: 'assistant', content: msg.text });
        }
      }
      
      history.push({ role: 'user', content: userInput });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: history,
          temperature: 0.7,
          max_tokens: 300,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let botReply = data.choices[0]?.message?.content || "I'm not sure how to respond to that. Could you ask about photography?";

      if (botReply.length > 500) {
        botReply = botReply.substring(0, 500) + '...';
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botReply,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Groq API error:', error);
      
      let errorMessage = "Sorry, I'm having trouble connecting. Please try again in a moment.";
      
      if (error.message?.includes('429')) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes('API key') || error.message?.includes('401')) {
        errorMessage = "API key error. Please check the configuration.";
      }
      
      const errorBotMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <FaRobot />
            </div>
            <div>
              <h3>Spectrum</h3>
              <p>AI Photography Assistant</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'bot' ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-bubble">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">
                <FaRobot />
              </div>
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Ask me about photography..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            disabled={isLoading}
          />
          <button 
            className="chatbot-send" 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;