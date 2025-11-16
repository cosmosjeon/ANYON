import '@testing-library/jest-dom/vitest';

const createMatchMedia = (matches: boolean) => {
  return (query: string): MediaQueryList => ({
    matches: query.includes('dark') ? matches : !matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
};

// Default to light system preference; individual tests can override by
// reassigning window.matchMedia.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn(createMatchMedia(false)),
});

// jsdom의 localStorage를 Mantine color scheme manager가 사용하므로 간단한 스텁을 제공
const storage = new Map<string, string>();
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  },
});
