import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './App.scss'
import Preloader from './components/Preloader'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preloader>
      <App />
    </Preloader>
  </StrictMode>,
)
