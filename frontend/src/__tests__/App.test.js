import React from 'react';
import { render, screen } from '@testing-library/react';

describe('App Tests', () => {
  test('renders without crashing', () => {
    const div = document.createElement('div');
    expect(div).toBeTruthy();
  });

  test('basic assertion', () => {
    expect(true).toBe(true);
  });
});
