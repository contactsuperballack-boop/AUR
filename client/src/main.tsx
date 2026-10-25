import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root")!;

// Prerendered pages ship real HTML inside #root: hydrate it rather than re-render from scratch
// (keeps first paint instant and the crawler-visible markup intact). In `vite dev` the root is
// empty, so fall back to a normal client render.
if (container.hasChildNodes()) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
