import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { apiClient } from "../lib/apiClient";
import { Navigation } from "../components/Navigation";

interface DashboardStats {
  total_content: number;
  published_content: number;
  draft_content: number;
  in_review_content: number;
  total_media: number;
  total_users: number;
  recent_activity: Array<{
    id: string;
    action: string;
    user_id: string;
    resource_type: string;
    created_at: string;
  }>;
  content_by_status: Array<{
    status: string;
    count: number;
  }>;
  content_by_type: Array<{
    type: string;
    count: number;
  }>;
  recent_content: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    author_id: string;
  }>;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get("/api/admin/stats");
        setStats(response.data.data);
      } catch (err: unknown) {
        console.error("Dashboard error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load dashboard statistics";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusVariant = (status: string): string => {
    switch (status.toLowerCase()) {
      case "published":
        return "success";
      case "draft":
        return "secondary";
      case "inreview":
      case "in review":
        return "warning";
      case "approved":
        return "info";
      case "unpublished":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              <Alert variant="danger">
                <Alert.Heading>Error Loading Dashboard</Alert.Heading>
                <p>{error}</p>
                <hr />
                <div className="mb-0">
                  <p className="mb-2">
                    <strong>Possible reasons:</strong>
                  </p>
                  <ul className="mb-3">
                    <li>You have not been assigned an admin role yet</li>
                    <li>The backend server is not running</li>
                    <li>There is a network connectivity issue</li>
                  </ul>
                  <p className="mb-2">
                    <strong>To fix this:</strong>
                  </p>
                  <ol>
                    <li>Make sure you have created an account and logged in</li>
                    <li>Go to Supabase Dashboard</li>
                    <li>Open the auth.users table and copy your user ID</li>
                    <li>Run this SQL in the SQL Editor:</li>
                  </ol>
                  <Card bg="dark" text="white" className="mt-2">
                    <Card.Body>
                      <code>
                        INSERT INTO user_roles (user_id, role) VALUES
                        ('your-user-id', 'Admin');
                      </code>
                    </Card.Body>
                  </Card>
                  <div className="mt-3">
                    <Link to="/login" className="btn btn-primary">
                      Back to Login
                    </Link>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <Container className="py-5">
          <Alert variant="warning">No statistics available</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />

      <div className="bg-white border-bottom">
        <Container className="py-4">
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 mb-0">Dashboard</h1>
              <p className="text-muted mb-0">Welcome to DBSA CMS</p>
            </Col>
            <Col xs="auto">
              <Link to="/content/new" className="btn btn-primary">
                Create Content
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Text className="text-muted mb-1">
                      Total Content
                    </Card.Text>
                    <h2 className="mb-0">{stats.total_content}</h2>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">📄</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Text className="text-muted mb-1">Published</Card.Text>
                    <h2 className="mb-0">{stats.published_content}</h2>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">✅</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Text className="text-muted mb-1">Drafts</Card.Text>
                    <h2 className="mb-0">{stats.draft_content}</h2>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    ✏️
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Text className="text-muted mb-1">In Review</Card.Text>
                    <h2 className="mb-0">{stats.in_review_content}</h2>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">⏳</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">Recent Content</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {stats.recent_content && stats.recent_content.length > 0 ? (
                  <ListGroup variant="flush">
                    {stats.recent_content.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-start"
                      >
                        <div className="flex-grow-1">
                          <Link
                            to={`/content/${item.id}`}
                            className="text-decoration-none text-dark fw-medium"
                          >
                            {item.title}
                          </Link>
                          <div className="small text-muted">
                            Created{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge bg={getStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Card.Body>
                    <p className="text-muted mb-0">No content yet</p>
                  </Card.Body>
                )}
              </Card.Body>
              <Card.Footer className="bg-white">
                <Link to="/content" className="btn btn-sm btn-outline-primary">
                  View All Content
                </Link>
              </Card.Footer>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">Content by Status</h5>
              </Card.Header>
              <Card.Body>
                {stats.content_by_status &&
                stats.content_by_status.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.content_by_status.map((item) => (
                      <div key={item.status}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">{item.status}</span>
                          <span className="fw-medium">{item.count}</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className={`progress-bar bg-${getStatusVariant(item.status)}`}
                            style={{
                              width: `${(item.count / stats.total_content) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No data available</p>
                )}
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item action as={Link} to="/content/new">
                  <div className="d-flex align-items-center">
                    <div className="me-3">➕</div>
                    <div>Create New Content</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/content">
                  <div className="d-flex align-items-center">
                    <div className="me-3">📄</div>
                    <div>View All Content</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/audit-logs">
                  <div className="d-flex align-items-center">
                    <div className="me-3">📊</div>
                    <div>Audit Logs</div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
