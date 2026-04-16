import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchInput from '../SearchInput';

describe('UI SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders placeholder and updated form styling', () => {
    render(<SearchInput onSearch={jest.fn()} placeholder="Search catalog..." />);
    const input = screen.getByPlaceholderText('Search catalog...');
    expect(input).toHaveClass('rounded', 'text-sm', 'focus:ring-1', 'focus:ring-gray-400');
  });

  test('debounces onSearch by 300ms', () => {
    const onSearch = jest.fn();
    render(<SearchInput onSearch={onSearch} />);

    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'coffee' }
    });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledWith('coffee');
  });
});

