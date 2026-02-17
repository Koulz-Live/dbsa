import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export const AppFooter = () => {
  return (
    <footer className="app-footer mt-auto" aria-label="Footer">
      <Container className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div>
            <strong className="app-footer__brand">DBSA CMS</strong>
            <p className="app-footer__text mb-0">
              A secure editorial workspace for content, templates, and
              workflows.
            </p>
          </div>
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
            <a href="mailto:support@dbsa.example" className="app-footer__link">
              Support
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
