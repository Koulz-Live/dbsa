import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ProtectedRoute } from "./lib/auth/ProtectedRoute";
import { ContentList } from "./pages/ContentList";
import { ContentEditor } from "./pages/ContentEditor";

// Placeholder pages - will be implemented
const LoginPage = () => <div>Login Page</div>;
const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">DBSA CMS Dashboard</h1>
    <div className="space-y-4">
      <a href="/content" className="block text-blue-600 hover:underline">
        → View All Content
      </a>
      <a href="/content/new" className="block text-blue-600 hover:underline">
        → Create New Content
      </a>
      <a href="/audit" className="block text-blue-600 hover:underline">
        → Audit Logs
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
