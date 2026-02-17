import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export const AppFooter = () => {
  return (
    <footer className="app-footer mt-auto" aria-label="Footer">
      <Container fluid className="py-4 px-0">
        <div className="px-3 px-lg-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
            <div>
              <strong className="app-footer__brand">DBSA CMS</strong>
              <p className="app-footer__text mb-0">
                A secure editorial workspace for content, templates, and
                workflows.
              </p>
              <p className="app-footer__text mt-2 mb-0">
                Need help? Reach us at{" "}
                <a
                  href="mailto:support@dbsa.example"
                  className="app-footer__link"
                >
                  support@dbsa.example
                </a>
                .
              </p>
            </div>
            <nav aria-label="Footer links">
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/content" className="app-footer__link">
                  Content
                </Link>
                <Link to="/templates" className="app-footer__link">
                  Templates
                </Link>
                <Link to="/audit" className="app-footer__link">
                  Audit Logs
                </Link>
                <Link to="/dashboard" className="app-footer__link">
                  Dashboard
                </Link>
              </div>
            </nav>
          </div>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-2 pt-4 mt-4 border-top border-light border-opacity-25">
            <small className="text-white-50">
              © {new Date().getFullYear()} DBSA. All rights reserved.
            </small>
            <div className="d-flex gap-3">
              <a href="#" className="app-footer__link">
                Privacy
              </a>
              <a href="#" className="app-footer__link">
                Terms
              </a>
              <a href="#" className="app-footer__link">
                Status
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
