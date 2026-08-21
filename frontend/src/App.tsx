import './App.css'
import Overzicht from './components/pages/Overzicht'

// Minimale app-shell. Toegang wordt bewaakt door Identity-Aware Proxy vóór de
// backend (zie ISSUES.md) - er is dus geen login-scherm of auth-state hier nodig.
// Overzicht is voorlopig het enige scherm - een router komt erbij zodra Detail/
// Instellingen (issues #35-#38) ook bestaan.
function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Confessor</h1>
      </header>
      <main className="app-main">
        <Overzicht />
      </main>
    </div>
  )
}

export default App
