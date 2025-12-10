import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'support', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const chatButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Mark messages as read when chat is open
    if (isOpen && hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
  }, [messages, isOpen, hasUnreadMessages]);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        chatButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus trapping within chat when open
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = chatContainerRef.current?.querySelectorAll(
        'button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Add safe area support for mobile devices
  useEffect(() => {
    const updateSafeArea = () => {
      const safeAreaBottom = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-bottom)') || '0px';
      document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom);
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  const sanitizeInput = (input) => {
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const sanitizedMessage = sanitizeInput(newMessage);
    if (!sanitizedMessage) return;

    const message = {
      id: Date.now(),
      text: sanitizedMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const supportMessage = {
        id: Date.now() + 1,
        text: "Thanks for your message! Our team will get back to you shortly. We typically respond within 2-4 hours during business hours.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
      // Set unread messages flag only if chat was closed before this timeout
      // This ensures new messages received while chat is closed trigger the notification
      setTimeout(() => {
        setHasUnreadMessages(prevHasUnread => {
          // Only set to true if there are new support messages and chat is still closed
          return !isOpen || prevHasUnread;
        });
      }, 100);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        ref={chatButtonRef}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="chat-button fixed transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200 group"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Open support chat. Press Enter or Space to open."
        aria-haspopup="dialog"
        title="Chat with support (Press Enter to open)"
        tabIndex={0}
      >
        <FiMessageCircle className="w-7 h-7" aria-hidden="true" />
        {hasUnreadMessages && (
          <>
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"
              style={{
                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)'
              }}
              aria-hidden="true"
            />
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              You have unread messages
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      role="dialog"
      aria-labelledby="chat-header-title"
      aria-modal="true"
      className="fixed flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl backdrop-blur-sm md:!bottom-[calc(100px+env(safe-area-inset-bottom,0px))]"
      style={{
        // On mobile (< 768px), position above the bottom nav
        // On desktop (>= 768px), use standard positioning via Tailwind class
        bottom: 'calc(156px + env(safe-area-inset-bottom, 0px))',
        right: '20px',
        width: 'min(calc(100vw - 40px), 380px)',
        height: 'min(500px, calc(100vh - 160px))',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(255, 255, 255, 0.98)',
        zIndex: 50
      }}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FiMessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 id="chat-header-title" className="font-semibold">Support Chat</h4>
            <p className="text-xs text-emerald-100">We're here to help!</p>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          onClick={() => {
            setIsOpen(false);
            chatButtonRef.current?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(false);
              chatButtonRef.current?.focus();
            }
          }}
          className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close chat. Press Escape or Enter to close."
          tabIndex={0}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
            }`}>
              {message.text}
              <div className={`text-xs mt-1 opacity-70 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Form */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <label htmlFor="chat-message-input" className="sr-only">
          Type your message to support team
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="chat-message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            disabled={isTyping}
            aria-label="Message input"
            aria-describedby="chat-status"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            aria-label="Send message"
          >
            <FiSend className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Status for screen readers */}
        <div id="chat-status" className="sr-only" aria-live="polite" aria-atomic="true">
          {isTyping ? 'Support is typing...' : 'Ready to send message'}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          {['Order Status', 'Returns', 'Payment'].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setNewMessage(`I need help with ${action.toLowerCase()}`)}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default SupportChat;
