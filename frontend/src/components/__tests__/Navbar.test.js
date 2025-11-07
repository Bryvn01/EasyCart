import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <Navbar />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.overflow = 'unset';
    document.body.style.overflowX = 'unset';
    document.documentElement.style.overflowX = 'unset';
  });

  afterEach(() => {
    // Clean up after tests
    document.body.style.overflow = 'unset';
    document.body.style.overflowX = 'unset';
    document.documentElement.style.overflowX = 'unset';
  });

  test('renders branding "EasyCart" on mobile', () => {
    renderNavbar();
    const brandingElements = screen.getAllByText('EasyCart');
    expect(brandingElements.length).toBeGreaterThan(0);
    // The branding should be visible (not have hidden class)
    const brandingSpan = brandingElements[0];
    expect(brandingSpan).toBeInTheDocument();
  });

  test('mobile menu is closed by default', () => {
    renderNavbar();
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
    expect(mobileMenu).toHaveClass('-translate-x-full');
  });

  test('mobile menu opens when hamburger button is clicked', async () => {
    renderNavbar();
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
      expect(mobileMenu).toHaveClass('translate-x-0');
    });
  });

  test('body overflow is prevented when mobile menu is open', async () => {
    renderNavbar();
    const menuButton = screen.getByLabelText('Open menu');
    
    // Initially, overflow should be unset
    expect(document.body.style.overflow).not.toBe('hidden');
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.documentElement.style.overflow).toBe('hidden');
    });
  });

  test('mobile menu closes when close button is clicked', async () => {
    renderNavbar();
    
    // Open menu
    const openButton = screen.getByLabelText('Open menu');
    fireEvent.click(openButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
      expect(mobileMenu).toHaveClass('translate-x-0');
    });
    
    // Close menu
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
      expect(mobileMenu).toHaveClass('-translate-x-full');
    });
  });

  test('body overflow is restored when mobile menu is closed', async () => {
    renderNavbar();
    const menuButton = screen.getByLabelText('Open menu');
    
    // Open menu
    fireEvent.click(menuButton);
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
    
    // Close menu
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
      expect(document.documentElement.style.overflow).toBe('unset');
    });
  });

  test('mobile menu closes when Escape key is pressed', async () => {
    renderNavbar();
    
    // Open menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
      expect(mobileMenu).toHaveClass('translate-x-0');
    });
    
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    await waitFor(() => {
      const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
      expect(mobileMenu).toHaveClass('-translate-x-full');
    });
  });

  test('overlay backdrop is rendered when menu is open', async () => {
    renderNavbar();
    
    // Initially no overlay (using role for better selector)
    const overlayBefore = document.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(overlayBefore).not.toBeInTheDocument();
    
    // Open menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const overlayAfter = document.querySelector('[aria-hidden="true"].fixed.inset-0');
      expect(overlayAfter).toBeInTheDocument();
    });
  });

  test('mobile menu has correct z-index for overlay effect', () => {
    renderNavbar();
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
    expect(mobileMenu).toHaveClass('z-[70]');
  });

  test('mobile menu slides from left (not right)', () => {
    renderNavbar();
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
    expect(mobileMenu).toHaveClass('left-0');
    expect(mobileMenu).not.toHaveClass('right-0');
  });
});
