import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NewMatch from './pages/NewMatch'
import Match from './pages/Match'
import Table from './pages/Table'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-match" element={<NewMatch />} />
        <Route path="/match/:id" element={<Match />} />
        <Route path="/table" element={<Table />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
