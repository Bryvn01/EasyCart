/**
 * Service Worker Registration Tests
 * Tests for PWA functionality
 */

describe('Service Worker Registration', () => {
  let serviceWorkerRegistration;

  beforeEach(() => {
    // Mock service worker
    global.navigator.serviceWorker = {
      register: jest.fn(),
      ready: Promise.resolve()
    };

    // Reset modules to get fresh import
    jest.resetModules();
    serviceWorkerRegistration = require('../serviceWorkerRegistration');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register service worker when available', () => {
      // Mock window.location
      delete window.location;
      window.location = {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000'
      };

      // Mock addEventListener
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      serviceWorkerRegistration.register();

      expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('should not register if service worker is not supported', () => {
      delete global.navigator.serviceWorker;

      const result = serviceWorkerRegistration.register();

      expect(result).toBeUndefined();
    });
  });

  describe('unregister', () => {
    it('should unregister service worker', async () => {
      const unregisterMock = jest.fn().mockResolvedValue(true);
      global.navigator.serviceWorker.ready = Promise.resolve({
        unregister: unregisterMock
      });

      await serviceWorkerRegistration.unregister();

      expect(unregisterMock).toHaveBeenCalled();
    });
  });

  describe('addNetworkListener', () => {
    it('should add online/offline event listeners', () => {
      const callback = jest.fn();
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      serviceWorkerRegistration.addNetworkListener(callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should return current online status', () => {
      const callback = jest.fn();
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      const status = serviceWorkerRegistration.addNetworkListener(callback);

      expect(status).toBe(true);
    });
  });

  describe('isInstalled', () => {
    it('should detect if app is installed as PWA', () => {
      // Mock matchMedia for standalone display mode
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const installed = serviceWorkerRegistration.isInstalled();

      expect(installed).toBe(true);
    });
  });
});

describe('PWA Manifest', () => {
  it('should have valid manifest.json', () => {
    const manifest = require('../../public/manifest.json');

    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('icons');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#2563eb');
  });

  it('should have required icon sizes', () => {
    const manifest = require('../../public/manifest.json');

    const iconSizes = manifest.icons.map(icon => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  it('should have app shortcuts', () => {
    const manifest = require('../../public/manifest.json');

    expect(manifest.shortcuts).toBeDefined();
    expect(manifest.shortcuts.length).toBeGreaterThan(0);

    // Check first shortcut structure
    const firstShortcut = manifest.shortcuts[0];
    expect(firstShortcut).toHaveProperty('name');
    expect(firstShortcut).toHaveProperty('url');
  });
});
