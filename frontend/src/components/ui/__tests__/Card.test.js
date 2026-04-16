import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('UI Card', () => {
  test('renders base and hover classes', () => {
    render(<Card hover className="custom-card">Body</Card>);
    const card = screen.getByText('Body').closest('div');
    expect(card).toHaveClass('bg-white', 'rounded', 'shadow-sm', 'custom-card');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'duration-150');
  });

  test('renders Card.Header, Card.Content and Card.Footer', () => {
    render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Content>Content</Card.Content>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );

    expect(screen.getByText('Header').closest('div')).toHaveClass('border-b');
    expect(screen.getByText('Content').closest('div')).toHaveClass('px-6', 'py-4');
    expect(screen.getByText('Footer').closest('div')).toHaveClass('border-t');
  });
});

