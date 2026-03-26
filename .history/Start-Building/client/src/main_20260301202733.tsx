import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply extension-mode class for popup/side panel sizing
if (import.meta.env.VITE_IS_EXTENSION === "true") {
  document.body.classList.add("extension-mode");
}

createRoot(document.getElementById("root")!).render(<App />);
