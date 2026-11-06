import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/react'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const isAdminRoute = window.location.pathname.startsWith('/admin')

function ClerkSetupRequired() {
  return (
    <main className="setup-screen">
      <p className="eyebrow">IRIS · AUTHENTICATION SETUP</p>
      <h1>Connect your Clerk application</h1>
      <p>Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>Frontend/.env</code>, then restart the Vite server.</p>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    ) : isAdminRoute ? <App /> : <ClerkSetupRequired />}
  </StrictMode>,
)


