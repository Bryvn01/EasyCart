import React from 'react';
import { render, fireEvent, screen, waitFor } from '../test-utils';
import * as api from '../services/api';
import ProductEditModal from '../components/ProductEditModal';

const baseProduct = {
  id: 1,
  name: 'Test Product',
  description: 'A product for testing',
  price: 100,
  stock: 10,
  image_url: '',
  category: 1,
  is_active: true,
};

describe('ProductEditModal', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL for image preview in jsdom
    global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
    jest.spyOn(api.productsAPI, 'getCategories').mockResolvedValue({ data: [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
    ] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  const onClose = jest.fn();
  const onUpdate = jest.fn();

  it('renders and allows image URL input', () => {
    render(<ProductEditModal
          product={baseProduct}
          isOpen={true}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      );
    expect(screen.getByLabelText(/Product Image/i)).toBeInTheDocument();
    const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
    fireEvent.change(urlInput, { target: { value: 'https://img.com/test.jpg' } });
    expect(urlInput.value).toBe('https://img.com/test.jpg');
    expect(screen.getByAltText('Product preview')).toBeInTheDocument();
  });

  it('shows error for non-image file upload', async () => {
    render(<ProductEditModal
          product={baseProduct}
          isOpen={true}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      );
    const fileInput = screen.getByLabelText(/Upload product image file/i);
    const fakeFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });
    await waitFor(() => {
      expect(screen.getByText(/Selected file is not an image/i)).toBeInTheDocument();
    });
  });

  it('shows preview for valid image file', async () => {
    render(<ProductEditModal
          product={baseProduct}
          isOpen={true}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      );
    const fileInput = screen.getByLabelText(/Upload product image file/i);
    const imageFile = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [imageFile] } });
    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByAltText('Product preview')).toBeInTheDocument();
    });
  });

  it('clears file when URL is entered', () => {
    render(<ProductEditModal
          product={baseProduct}
          isOpen={true}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      );
    const fileInput = screen.getByLabelText(/Upload product image file/i);
    const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
    const imageFile = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [imageFile] } });
    fireEvent.change(urlInput, { target: { value: 'https://img.com/test.jpg' } });
    expect(urlInput.value).toBe('https://img.com/test.jpg');
    // File should be cleared, so no filename shown
    expect(screen.queryByText('test.png')).not.toBeInTheDocument();
  });
});
