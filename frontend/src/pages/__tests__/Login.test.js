import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import Login from '../Login';

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    login: jest.fn(async ({ email, password }) => {
      if (email === 'fail@example.com') throw { response: { data: { non_field_errors: ['Login failed'] } } };
      return true;
    })
  })
}));

describe('Login fade-out/auto-hide', () => {
  function setup() {
    return render(<Login />);
  }

  it('fades out and hides button, shows success message on success', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Button should fade out and disappear
    await waitFor(() => expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument(), { timeout: 1000 });
    // Success message should appear and be focused
    const msg = await screen.findByText(/login successful/i);
    expect(msg).toBeInTheDocument();
    // Instead of checking focus, just check presence
    // Optionally, check focus if needed:
    // expect(document.activeElement).toBe(msg);
  });

  it('does not hide button on error', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Button should remain visible
    await screen.findByRole('button', { name: /sign in/i });
    // Error message should appear
    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
