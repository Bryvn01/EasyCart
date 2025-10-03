import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import '@testing-library/jest-dom';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('uid=test123&token=testtoken')],
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Welcome Back to Easycart')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('has sign up link', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const signUpLink = screen.getByText('Sign up here');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('shows forgot password link after error', async () => {
    const { authAPI } = require('../services/api');
    authAPI.login.mockRejectedValue({
      response: { data: { non_field_errors: ['Invalid credentials'] } }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByText('Sign In');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });
  });
});

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Join Easycart')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const passwordInput = screen.getAllByPlaceholderText(/enter.*password/i)[0];
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByText('Create Account');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('has sign in link', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const signInLink = screen.getByText('Sign in here');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email address/i)).toBeInTheDocument();
  });

  it('has back to login link', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    const loginLink = screen.getByText('Sign in here');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows success message after submission', async () => {
    const { authAPI } = require('../services/api');
    authAPI.forgotPassword.mockResolvedValue({ data: { message: 'Email sent' } });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    const submitButton = screen.getByText('Send Reset Instructions');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password reset instructions have been sent/i)).toBeInTheDocument();
    });
  });
});

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
  });

  it('validates password match', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByText('Reset Password');

    fireEvent.change(passwordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('validates minimum password length', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByText('Reset Password');

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('has back to login link', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    const loginLink = screen.getByText('Sign in here');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

describe('Password Security', () => {
  it('password fields are of type password', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('register form has password confirmation', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
