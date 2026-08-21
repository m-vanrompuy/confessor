import './App.css'

// Minimale app-shell. Toegang wordt bewaakt door Identity-Aware Proxy vóór de
// backend (zie ISSUES.md) - er is dus geen login-scherm of auth-state hier nodig.
// De echte schermen (Overzicht/Detail/Instellingen) komen in issues #33-#38.
function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Confessor</h1>
      </header>
      <main className="app-main">
        <p>Nog geen scherm gekoppeld.</p>
      </main>
    </div>
  )
}

export default App
