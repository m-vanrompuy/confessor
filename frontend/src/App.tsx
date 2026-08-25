import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'
import Overzicht from './components/pages/Overzicht'
import Detail from './components/pages/Detail'

// Minimale app-shell. Toegang wordt bewaakt door Identity-Aware Proxy vóór de
// backend (zie ISSUES.md) - er is dus geen login-scherm of auth-state hier nodig.
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <h1>Confessor</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Overzicht />} />
            <Route path="/confessions/:id" element={<Detail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
