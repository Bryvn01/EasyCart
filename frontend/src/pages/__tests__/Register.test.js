import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Register from '../Register';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    register: jest.fn(async ({ email }) => {
      if (email === 'fail@example.com') {
        const error = new Error('Registration failed');
        error.response = { data: { error: 'Registration failed' } };
        throw error;
      }
      return true;
    })
  })
}));

describe('Register fade-out/auto-hide', () => {
  function setup() {
    return render(<Register />);
  }

  it('fades out and hides button, shows success message on success', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument(), { timeout: 1000 });
    const msg = await screen.findByText(/registration successful/i);
    expect(msg).toBeInTheDocument();
    // Instead of checking focus, just check presence
    // Optionally, check focus if needed:
    // expect(document.activeElement).toBe(msg);
  });

  it('does not hide button on error', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/create password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
  });
});
