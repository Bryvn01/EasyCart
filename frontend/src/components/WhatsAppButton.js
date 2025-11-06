import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Replace with actual WhatsApp number
  const phoneNumber = '+254700000000'; // Kenyan format
  const message = 'Hi! I need help with my EasyCart order.';
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
      style={{
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        left: '20px',
        width: isHovered ? 'auto' : '60px',
        height: '60px',
        padding: isHovered ? '0 20px 0 16px' : '0'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8 flex-shrink-0" />
      {isHovered && (
        <span className="ml-2 font-semibold whitespace-nowrap text-sm">Chat on WhatsApp</span>
      )}
    </a>
  );
};

export default WhatsAppButton;
