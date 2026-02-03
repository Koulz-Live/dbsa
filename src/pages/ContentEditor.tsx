import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { Navigation } from "../components/Navigation";
import { apiClient } from "../lib/apiClient";
import { ContentItem, ContentStatus, Block } from "../../shared/types";
import { PageBuilder, PageBlock } from "../components/PageBuilder";

// Helper to convert database blocks to PageBlock format
const convertToPageBlocks = (blocks: Block[] | undefined): PageBlock[] => {
  if (!blocks) return [];
  return blocks.map((block, index) => ({
    ...block,
    order: index,
    type: block.type.toLowerCase() as PageBlock["type"], // Convert "Hero" -> "hero", etc.
  })) as PageBlock[];
};

// Helper to convert PageBlocks back to database format
const convertFromPageBlocks = (blocks: PageBlock[]): Block[] => {
  return blocks.map((block) => ({
    id: block.id,
    type: (block.type.charAt(0).toUpperCase() +
      block.type.slice(1)) as Block["type"],
    data: block.data as Record<string, unknown>,
  }));
};

interface ContentFormData {
  title: string;
  slug: string;
  excerpt: string;
  content_type_id: string;
  department_id: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  hero_image_url: string;
  page_blocks: PageBlock[]; // Add page blocks
}

export function ContentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem | null>(null);

  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content_type_id: "",
    department_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: [],
    hero_image_url: "",
    page_blocks: [],
  });

  useEffect(() => {
    if (isEditMode) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ContentItem>(`/content/${id}`);
      setContent(response.data);

      // Populate form
      setFormData({
        title: response.data.title,
        slug: response.data.slug,
        excerpt: response.data.excerpt || "",
        content_type_id: response.data.content_type_id,
        department_id: response.data.department_id || "",
        meta_title: response.data.meta_title || "",
        meta_description: response.data.meta_description || "",
        meta_keywords: response.data.meta_keywords || [],
        hero_image_url: response.data.hero_image_url || "",
        page_blocks: convertToPageBlocks(response.data.page_data?.blocks),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Prepare payload with page_data
      const payload = {
        ...formData,
        page_data: {
          blocks: convertFromPageBlocks(formData.page_blocks),
        },
      };

      if (isEditMode) {
        await apiClient.patch(`/content/${id}`, payload);
        alert("Content updated successfully!");
      } else {
        const response = await apiClient.post<ContentItem>("/content", payload);
        alert("Content created successfully!");
        navigate(`/content/${response.data.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflowAction = async (action: string) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      await apiClient.post(`/workflow/${action}`, { content_id: id });
      alert(`Action "${action}" completed successfully!`);
      fetchContent(); // Refresh to get updated status
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  const getStatusBadgeVariant = (status: ContentStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "InReview":
        return "warning";
      case "Approved":
        return "success";
      case "Published":
        return "primary";
      case "Unpublished":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: ContentStatus) => {
    return status === "InReview" ? "In Review" : status;
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading content...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-vh-100 bg-light">
        <Container className="py-4">
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <Button
                variant="link"
                onClick={() => navigate("/content")}
                className="text-decoration-none p-0 mb-2"
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Content List
              </Button>
              <h1 className="h2 mb-2">
                {isEditMode ? "Edit Content" : "Create New Content"}
              </h1>
              {content && (
                <div className="d-flex align-items-center gap-3">
                  <Badge bg={getStatusBadgeVariant(content.status)}>
                    {getStatusLabel(content.status)}
                  </Badge>
                  <small className="text-muted">
                    Last updated:{" "}
                    {new Date(content.updated_at).toLocaleString()}
                  </small>
                </div>
              )}
            </Col>
          </Row>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="mb-4"
            >
              <Alert.Heading>Error</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}

          <Row>
            {/* Main Form */}
            <Col lg={8}>
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="card-title mb-4">Basic Information</h5>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Title <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                        placeholder="Enter content title"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Slug <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          required
                          placeholder="content-url-slug"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        URL-friendly version of the title
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Excerpt</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        placeholder="Brief description of the content"
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Content Type <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={formData.content_type_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                content_type_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select type...</option>
                            <option value="page">Page</option>
                            <option value="article">Article</option>
                            <option value="news">News</option>
                            <option value="event">Event</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Select
                            value={formData.department_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Select department...</option>
                            <option value="dept1">Marketing</option>
                            <option value="dept2">Communications</option>
                            <option value="dept3">Operations</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* SEO Settings */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="card-title mb-4">SEO Settings</h5>

                    <Form.Group className="mb-3">
                      <Form.Label>Meta Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meta_title: e.target.value,
                          })
                        }
                        placeholder="SEO title (defaults to main title)"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Meta Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.meta_description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            meta_description: e.target.value,
                          })
                        }
                        placeholder="Description for search engines"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Hero Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        value={formData.hero_image_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero_image_url: e.target.value,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Page Builder */}
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="card-title mb-4">Page Content</h5>
                    <PageBuilder
                      blocks={formData.page_blocks}
                      onChange={(blocks) =>
                        setFormData({ ...formData, page_blocks: blocks })
                      }
                    />
                  </Card.Body>
                </Card>

                {/* Form Actions */}
                <div className="d-flex gap-2 mb-4">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : isEditMode ? (
                      "Update Content"
                    ) : (
                      "Create Content"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/content")}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              {/* Workflow Actions */}
              {content && (
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="card-title mb-3">Workflow Actions</h5>
                    <div className="d-grid gap-2">
                      {content.status === "Draft" && (
                        <Button
                          onClick={() => handleWorkflowAction("submit")}
                          disabled={saving}
                          variant="primary"
                        >
                          Submit for Review
                        </Button>
                      )}

                      {content.status === "InReview" && (
                        <>
                          <Button
                            onClick={() => handleWorkflowAction("approve")}
                            disabled={saving}
                            variant="success"
                          >
                            Approve Content
                          </Button>
                          <Button
                            onClick={() =>
                              handleWorkflowAction("request-changes")
                            }
                            disabled={saving}
                            variant="warning"
                          >
                            Request Changes
                          </Button>
                        </>
                      )}

                      {content.status === "Approved" && (
                        <>
                          <Button
                            onClick={() => handleWorkflowAction("publish")}
                            disabled={saving}
                            variant="success"
                          >
                            Publish Now
                          </Button>
                          <Button
                            onClick={() => {
                              /* Schedule modal */
                            }}
                            disabled={saving}
                            variant="info"
                          >
                            Schedule Publishing
                          </Button>
                        </>
                      )}

                      {content.status === "Published" && (
                        <Button
                          onClick={() => handleWorkflowAction("unpublish")}
                          disabled={saving}
                          variant="danger"
                        >
                          Unpublish Content
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Quick Info */}
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="card-title mb-3">Quick Info</h5>
                  {content ? (
                    <dl className="mb-0">
                      <dt className="text-muted small">Created</dt>
                      <dd className="mb-2">
                        {new Date(content.created_at).toLocaleDateString()}
                      </dd>
                      <dt className="text-muted small">Author</dt>
                      <dd className="mb-2 font-monospace small">
                        {content.author_id.substring(0, 8)}...
                      </dd>
                      {content.publish_at && (
                        <>
                          <dt className="text-muted small">
                            Scheduled Publish
                          </dt>
                          <dd className="mb-0">
                            {new Date(content.publish_at).toLocaleString()}
                          </dd>
                        </>
                      )}
                    </dl>
                  ) : (
                    <p className="text-muted mb-0 small">
                      Save content to see details
                    </p>
                  )}
                </Card.Body>
              </Card>

              {/* Version History */}
              {content && (
                <Card>
                  <Card.Body>
                    <h5 className="card-title mb-3">Version History</h5>
                    <p className="small text-muted mb-3">
                      View and restore previous versions of this content.
                    </p>
                    <Button
                      onClick={() => navigate(`/content/${id}/versions`)}
                      variant="outline-secondary"
                      className="w-100"
                    >
                      View History
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
