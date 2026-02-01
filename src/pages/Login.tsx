import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

export const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.user) {
          setMessage(
            "Account created! Please check your email to verify your account.",
          );
          // Clear form
          setEmail("");
          setPassword("");
          // Switch to login mode after 3 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setMessage("");
          }, 3000);
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          // Redirect to dashboard on successful login
          navigate("/dashboard");
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={5} xl={4}>
            {/* Logo and Title */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#6366f1",
                }}
              >
                <svg
                  width="40"
                  height="40"
                  fill="white"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    fill="none"
                  />
                </svg>
              </div>
              <h1 className="fw-bold text-white mb-2">DBSA CMS</h1>
              <p className="text-white-50">
                {isSignUp ? "Create your account" : "Welcome back"}
              </p>
            </div>

            {/* Login/Signup Card */}
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      disabled={loading}
                      size="lg"
                    />
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      disabled={loading}
                      size="lg"
                    />
                    {isSignUp && (
                      <Form.Text className="text-muted">
                        Password must be at least 6 characters
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* Error Message */}
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  {/* Success Message */}
                  {message && (
                    <Alert variant="success" className="mb-3">
                      {message}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      style={{
                        backgroundColor: "#6366f1",
                        borderColor: "#6366f1",
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : isSignUp ? (
                        "Create Account"
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Toggle Sign Up / Sign In */}
                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                      setMessage("");
                    }}
                    className="text-decoration-none"
                    style={{ color: "#6366f1" }}
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </Button>
                </div>

                {/* Divider */}
                <hr className="my-4" />

                <p className="text-center text-muted small mb-0">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </Card.Body>
            </Card>

            {/* Help Text */}
            <div className="text-center mt-4">
              <p className="text-white small">
                Need help?{" "}
                <a
                  href="mailto:support@dbsa.com"
                  className="text-white fw-bold text-decoration-none"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
