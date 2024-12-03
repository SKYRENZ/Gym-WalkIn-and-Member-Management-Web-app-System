import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './MainAdmin.css'
import Admin from './Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
)
