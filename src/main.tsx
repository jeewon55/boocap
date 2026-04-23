import { createRoot } from "react-dom/client";
import { installResizeObserverPolyfill } from "./lib/resizeObserverPolyfill";
import App from "./App.tsx";
import "./index.css";

try {
  installResizeObserverPolyfill();
} catch (e) {
  console.error("[Boocap] ResizeObserver polyfill failed", e);
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Missing #root element');
}
createRoot(rootEl).render(<App />);
