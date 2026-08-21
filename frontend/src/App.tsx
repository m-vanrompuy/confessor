import { BrowserRouter, Routes, Route } from 'react-router'
import './App.css'
import Overzicht from './components/pages/Overzicht'

// Minimale app-shell. Toegang wordt bewaakt door Identity-Aware Proxy vóór de
// backend (zie ISSUES.md) - er is dus geen login-scherm of auth-state hier nodig.
// /confessions/:id komt erbij zodra de Detail-pagina bestaat (issue #35/#36).
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
