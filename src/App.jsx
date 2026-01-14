import { Routes, Route, Navigate } from "react-router-dom";
import TestPage from "./pages/TestPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./pages/AdminLogin"; 
import ProtectedRoute from "./componets/ProtectedRoute";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Navigate to="/test" />} />
        
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />

        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;