import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import './index.css'
import App from './App.jsx'

// Loading component for PersistGate
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-brintelli-base">
    <div className="text-center">
      <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
      <p className="text-textMuted">Loading...</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
