import React, { useState, useEffect, useRef } from 'react';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'support', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Thanks for your message! Our team will get back to you shortly. We typically respond within 2-4 hours during business hours.",
        sender: 'support',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        style={{
          bottom: '24px',
          right: '20px',
          width: '56px', 
          height: '56px',
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', 
          border: 'none',
          fontSize: '22px', 
          cursor: 'pointer', 
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)', 
          touchAction: 'manipulation',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 45
        }}
        aria-label="Open support chat"
      >
        💬
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"
          style={{
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)'
          }}
        />
      </button>
    );
  }

  return (
    <div 
      className="fixed flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl backdrop-blur-sm"
      style={{
        bottom: '90px',
        right: '20px', 
        width: 'min(calc(100vw - 40px), 380px)',
        height: 'min(450px, calc(100vh - 200px))',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(255, 255, 255, 0.98)',
        zIndex: 45
      }}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            💬
          </div>
          <div>
            <h4 className="font-semibold text-sm">Support Chat</h4>
            <p className="text-xs text-emerald-100">We're here to help!</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close chat"
        >
          <span className="text-lg leading-none">×</span>
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
        <div className="flex gap-2">
          <input
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium min-w-[70px]"
          >
            {isTyping ? '•••' : 'Send'}
          </button>
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