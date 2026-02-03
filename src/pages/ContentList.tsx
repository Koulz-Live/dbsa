import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Table,
  Pagination,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Navigation } from "../components/Navigation";
import { apiClient } from "../lib/apiClient";
import { ContentItem, ContentStatus } from "../../shared/types";

interface ContentListResponse {
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ContentList() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await apiClient.get<ContentListResponse>("/content", {
        params,
      });

      setContent(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch content";
      setError(errorMessage);
      console.error("Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      await apiClient.delete(`/content/${id}`);
      fetchContent();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to delete content";
      alert(errorMessage);
    }
  };

  const getStatusVariant = (status: ContentStatus): string => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "InReview":
        return "info";
      case "Approved":
        return "success";
      case "Published":
        return "primary";
      case "Unpublished":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: ContentStatus) => {
    return status === "InReview" ? "In Review" : status;
  };

  if (loading && content.length === 0) {
    return (
      <>
        <Navigation />
        <Container fluid className="py-4 bg-light min-vh-100">
          <Container>
            <Row className="mb-4">
              <Col>
                <h1 className="h3 mb-2">Content Management</h1>
                <p className="text-muted">
                  Manage all your content items across the CMS
                </p>
              </Col>
            </Row>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading content...</p>
            </div>
          </Container>
        </Container>
      </>
    );
  }

  if (error && content.length === 0) {
    return (
      <>
        <Navigation />
        <Container fluid className="py-4 bg-light min-vh-100">
          <Container>
            <Row className="mb-4">
              <Col>
                <h1 className="h3 mb-0">Content Management</h1>
              </Col>
            </Row>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Content</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" size="sm" onClick={fetchContent}>
                Try Again
              </Button>
            </Alert>
          </Container>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container fluid className="py-4 bg-light min-vh-100">
        <Container>
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <h1 className="h3 mb-2">Content Management</h1>
              <p className="text-muted">
                Manage all your content items across the CMS
              </p>
            </Col>
          </Row>

          {/* Actions Bar */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="g-3 align-items-end">
                {/* Search */}
                <Col lg={6}>
                  <Form onSubmit={handleSearch}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by title, slug, excerpt..."
                      />
                      <Button type="submit" variant="primary">
                        Search
                      </Button>
                    </InputGroup>
                  </Form>
                </Col>

                {/* Status Filter */}
                <Col lg={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as ContentStatus | "");
                      setPage(1);
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="InReview">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                    <option value="Unpublished">Unpublished</option>
                  </Form.Select>
                </Col>

                {/* New Content Button */}
                <Col lg={3} className="text-lg-end">
                  <Button
                    as="a"
                    href="/content/new"
                    variant="success"
                    className="w-100 w-lg-auto"
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    New Content
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Content Table */}
          <Card>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Updated</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <div>
                          <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                          <h5 className="mt-3">No content found</h5>
                          <p className="text-muted mb-3">
                            Get started by creating new content items or adjust
                            your filters.
                          </p>
                          <Button
                            as="a"
                            href="/content/new"
                            variant="primary"
                            size="sm"
                          >
                            Create Content
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    content.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <div className="fw-medium text-dark">
                              {item.title}
                            </div>
                            <div className="text-muted small">{item.slug}</div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {item.author_id.substring(0, 8)}...
                        </td>
                        <td className="text-muted small">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              as="a"
                              href={`/content/${item.id}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing page <strong>{page}</strong> of{" "}
                    <strong>{totalPages}</strong> ({total} total items)
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    />
                    <Pagination.Next
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    />
                  </Pagination>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </Container>
    </>
  );
}
