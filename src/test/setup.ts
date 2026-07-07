import '@testing-library/jest-dom';
import '../i18n/config';

// jsdom has no ResizeObserver; several Radix Themes primitives (e.g. Switch)
// measure their own size with it on mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
