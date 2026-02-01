import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, Dropdown } from "react-bootstrap";
import { supabase } from "../lib/supabase";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Sign out from Supabase
      await supabase.auth.signOut();
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if there's an error
      navigate("/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar bg="white" className="border-bottom">
      <Container>
        <Navbar.Brand
          as={Link}
          to="/dashboard"
          className="fw-bold text-primary"
        >
          DBSA CMS
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/dashboard" active={isActive("/dashboard")}>
            Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/content" active={isActive("/content")}>
            Content
          </Nav.Link>
          <Nav.Link as={Link} to="/audit-logs" active={isActive("/audit-logs")}>
            Audit Logs
          </Nav.Link>
        </Nav>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" id="user-menu" size="sm">
            <span className="me-1">👤</span>
            Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item disabled>
              <small className="text-muted">Logged in</small>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to="/dashboard">
              🏠 Dashboard
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/content">
              📄 Content
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/content/new">
              ➕ New Content
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/audit-logs">
              📊 Audit Logs
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={handleLogout}
              className="text-danger"
              disabled={loggingOut}
            >
              {loggingOut ? "⏳ Logging out..." : "🚪 Logout"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
};
