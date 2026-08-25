import { BrowserRouter, Routes, Route, Link } from 'react-router'
import './App.css'
import Overzicht from './components/pages/Overzicht'
import Detail from './components/pages/Detail'
import Instellingen from './components/pages/Instellingen'

// Minimale app-shell. Toegang wordt bewaakt door Identity-Aware Proxy vóór de
// backend (zie ISSUES.md) - er is dus geen login-scherm of auth-state hier nodig.
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <h1>Confessor</h1>
          <nav className="app-nav">
            <Link to="/">Overzicht</Link>
            <Link to="/instellingen">Instellingen</Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Overzicht />} />
            <Route path="/confessions/:id" element={<Detail />} />
            <Route path="/instellingen" element={<Instellingen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
