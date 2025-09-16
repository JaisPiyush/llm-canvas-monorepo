import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import { CanvasAPI } from '@llm-canvas/sdk'

declare global {
  interface Window {
    // electronAPI: any
    LLMCANVAS_VERSION: string
    canvas: CanvasAPI
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
