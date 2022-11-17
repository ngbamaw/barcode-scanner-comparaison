import './App.css'

import Scanner from './components/scanner'

function App() {
  return (
    <div className="App">
      <Scanner enableCamera width="100%" height="100vh" onCode={console.log}/>
    </div>
  )
}

export default App
