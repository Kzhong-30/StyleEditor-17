import { describe, it, expect } from 'vitest';
import { classifyResourceType } from '../composables/usePerformance';

describe('usePerformance helper functions', () => {
  describe('classifyResourceType', () => {
    it('should classify images by extension', () => {
      expect(classifyResourceType('link', 'https://example.com/photo.jpg')).toBe('image');
      expect(classifyResourceType('link', 'https://example.com/icon.PNG')).toBe('image');
      expect(classifyResourceType('link', 'https://example.com/pic.webp')).toBe('image');
      expect(classifyResourceType('link', 'https://example.com/img.svg')).toBe('image');
    });

    it('should classify images by initiator', () => {
      expect(classifyResourceType('img', 'https://example.com/resource')).toBe('image');
    });

    it('should classify JavaScript by extension', () => {
      expect(classifyResourceType('link', 'https://example.com/app.js')).toBe('js');
      expect(classifyResourceType('link', 'https://example.com/app.mjs')).toBe('js');
    });

    it('should classify JavaScript by initiator', () => {
      expect(classifyResourceType('script', 'https://example.com/chunk')).toBe('js');
    });

    it('should classify CSS by extension', () => {
      expect(classifyResourceType('link', 'https://example.com/style.css')).toBe('css');
    });

    it('should classify CSS by initiator', () => {
      expect(classifyResourceType('link', 'https://example.com/css')).toBe('css');
    });

    it('should classify fonts by extension', () => {
      expect(classifyResourceType('css', 'https://example.com/font.woff2')).toBe('font');
      expect(classifyResourceType('other', 'https://example.com/font.ttf')).toBe('font');
    });

    it('should classify XHR by initiator', () => {
      expect(classifyResourceType('xmlhttprequest', 'https://example.com/api')).toBe('xhr');
      expect(classifyResourceType('fetch', 'https://example.com/api')).toBe('xhr');
    });

    it('should default to xhr for unknown types', () => {
      expect(classifyResourceType('other', 'https://example.com/resource')).toBe('xhr');
    });
  });

  describe('boundary checks', () => {
    it('should handle empty URL', () => {
      expect(classifyResourceType('img', '')).toBe('image');
      expect(classifyResourceType('', '')).toBe('xhr');
    });

    it('should handle URLs without extension', () => {
      expect(classifyResourceType('script', 'https://example.com/endpoint')).toBe('js');
    });

    it('should handle URLs with multiple dots', () => {
      expect(classifyResourceType('link', 'https://example.com/file.min.js')).toBe('js');
    });
  });
});
