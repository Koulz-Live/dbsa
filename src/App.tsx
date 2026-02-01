import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ProtectedRoute } from "./lib/auth/ProtectedRoute";
import { ContentList } from "./pages/ContentList";
import { ContentEditor } from "./pages/ContentEditor";
import { Dashboard } from "./pages/Dashboard";
import { AuditLogs } from "./pages/AuditLogs";
import { Login } from "./pages/Login";
import { initializeCsrfToken } from "./lib/csrf";

function App() {
  // Initialize CSRF token on app load
  useEffect(() => {
    initializeCsrfToken();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <ContentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/new"
            element={
              <ProtectedRoute>
                <ContentEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/:id"
            element={
              <ProtectedRoute>
                <ContentEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
