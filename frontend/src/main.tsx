import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { ProvedorDeDados } from "./lib/store.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProvedorDeDados>
      <App />
    </ProvedorDeDados>
  </StrictMode>,
)
