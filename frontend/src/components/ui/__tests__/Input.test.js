import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('UI Input', () => {
  test('renders label/required state and updated class styling', () => {
    render(<Input id="email" label="Email" required placeholder="name@example.com" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toHaveClass('rounded', 'text-sm', 'focus:ring-1');
  });

  test('handles changes and displays error state', () => {
    const onChange = jest.fn();
    render(
      <Input
        id="phone"
        label="Phone"
        value=""
        onChange={onChange}
        error="Invalid number"
      />
    );

    const input = screen.getByLabelText('Phone');
    fireEvent.change(input, { target: { value: '0712345678' } });
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
  });
});

