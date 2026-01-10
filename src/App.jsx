import { Routes, Route, Navigate } from "react-router-dom"
import TestPage from "./pages/TestPage"
import AdminCSVUpload from "./pages/AdminCSVUpload"
import AdminPage from "./pages/AdminPage"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Navigate to="/test" />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  )
}

export default App
