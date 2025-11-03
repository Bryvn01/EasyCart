/**
 * Add to Cart Micro-interactions
 */

export const animateAddToCart = (buttonElement, cartIconElement) => {
  if (!buttonElement) return;

  // Button bounce animation
  buttonElement.style.transform = 'scale(0.95)';
  setTimeout(() => {
    buttonElement.style.transform = 'scale(1.05)';
    setTimeout(() => {
      buttonElement.style.transform = 'scale(1)';
    }, 150);
  }, 150);

  // Change button to checkmark temporarily
  const originalText = buttonElement.innerHTML;
  buttonElement.innerHTML = '✓ Added!';
  buttonElement.style.backgroundColor = 'var(--success)';
  
  setTimeout(() => {
    buttonElement.innerHTML = originalText;
    buttonElement.style.backgroundColor = '';
  }, 2000);

  // Animate cart icon if provided
  if (cartIconElement) {
    cartIconElement.style.transform = 'scale(1.3)';
    cartIconElement.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      cartIconElement.style.transform = 'scale(1)';
    }, 300);
  }

  // Haptic feedback if supported
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

export const updateCartBadge = (badgeElement, newCount) => {
  if (!badgeElement) return;

  // Pulse animation
  badgeElement.style.transform = 'scale(1.5)';
  badgeElement.style.transition = 'transform 0.3s ease';
  
  setTimeout(() => {
    badgeElement.style.transform = 'scale(1)';
    badgeElement.textContent = newCount > 99 ? '99+' : newCount;
  }, 300);
};

export const showCartNotification = (productName) => {
  // Create floating notification
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg style="width: 24px; height: 24px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <div style="font-weight: 600;">Added to cart!</div>
          <div style="font-size: 14px; opacity: 0.9;">${productName}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
