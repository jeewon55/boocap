import "@testing-library/jest-dom";
import { installResizeObserverPolyfill } from "@/lib/resizeObserverPolyfill";

installResizeObserverPolyfill();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
