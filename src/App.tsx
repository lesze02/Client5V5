import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import NewMatch from './pages/NewMatch'
import Match from './pages/Match'
import Table from './pages/Table'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-match" element={<NewMatch />} />
        <Route path="/match/:id" element={<Match />} />
        <Route path="/table" element={<Table />} />
      </Routes>
    </HashRouter>
  )
}

export default App
