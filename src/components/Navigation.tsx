import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, Dropdown, Button } from "react-bootstrap";
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

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="app-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar
        bg="white"
        expand="lg"
        className="border-bottom app-navbar"
        as="nav"
        aria-label="Primary"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/dashboard"
            className="fw-bold text-primary d-flex align-items-center gap-2"
          >
            <span className="app-logo">DBSA</span>
            <span className="app-logo-sub">CMS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="primary-navigation" />
          <Navbar.Collapse id="primary-navigation">
            <Nav className="me-auto gap-lg-2">
              <Nav.Link
                as={Link}
                to="/dashboard"
                active={isActive("/dashboard")}
                className={`app-nav-link ${isActive("/dashboard") ? "is-active" : ""}`}
                aria-current={isActive("/dashboard") ? "page" : undefined}
              >
                Dashboard
              </Nav.Link>
              <Dropdown as={Nav.Item} className="mega-menu">
                <Dropdown.Toggle
                  as={Nav.Link}
                  className="app-nav-link"
                  id="solutions-menu"
                >
                  Solutions
                </Dropdown.Toggle>
                <Dropdown.Menu className="mega-menu__menu shadow" align="start">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <h6 className="mega-menu__title">Platforms</h6>
                      <Dropdown.Item as={Link} to="/content">
                        Content Operations
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/templates">
                        Page Templates
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/content/new">
                        Content Creation
                      </Dropdown.Item>
                    </div>
                    <div className="col-12 col-md-6">
                      <h6 className="mega-menu__title">Insights</h6>
                      <Dropdown.Item as={Link} to="/audit">
                        Audit & Compliance
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/dashboard">
                        Performance Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item href="mailto:support@dbsa.example">
                        Support & Success
                      </Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              <Nav.Link
                as={Link}
                to="/content"
                active={isActive("/content")}
                className={`app-nav-link ${isActive("/content") ? "is-active" : ""}`}
                aria-current={isActive("/content") ? "page" : undefined}
              >
                Content
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/templates"
                active={isActive("/templates")}
                className={`app-nav-link ${isActive("/templates") ? "is-active" : ""}`}
                aria-current={isActive("/templates") ? "page" : undefined}
              >
                Templates
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/audit"
                active={isActive("/audit")}
                className={`app-nav-link ${isActive("/audit") ? "is-active" : ""}`}
                aria-current={isActive("/audit") ? "page" : undefined}
              >
                Audit Logs
              </Nav.Link>
            </Nav>

            <div className="d-lg-none border-top pt-3 mt-3">
              <div className="d-flex flex-column gap-2">
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-search me-2"></i>
                  Search
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-envelope me-2"></i>
                  Contact
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-life-preserver me-2"></i>
                  Support
                </Button>
              </div>
            </div>

            <Dropdown align="end" className="ms-lg-3 mt-3 mt-lg-0">
              <Dropdown.Toggle
                variant="outline-secondary"
                id="user-menu"
                size="sm"
              >
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
                <Dropdown.Item as={Link} to="/templates">
                  🎨 Templates
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/content/new">
                  ➕ New Content
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/audit">
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
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
