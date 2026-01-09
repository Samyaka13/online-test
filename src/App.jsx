import { Routes, Route, Navigate } from "react-router-dom"
import AdminDocxUpload from "./pages/AdminDocxUpload"
import TestPage from "./pages/TestPage"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Navigate to="/test" />} />
        <Route path="/admin" element={<AdminDocxUpload />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  )
}

export default App
