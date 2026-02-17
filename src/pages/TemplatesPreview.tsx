import { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Nav } from "react-bootstrap";
import { AppShell } from "../components/AppShell";
import { PAGE_TEMPLATES } from "../data/pageTemplates";
import { PageBlock } from "../components/PageBuilder";
import { HeroBlockComponent } from "../components/PageBuilder/blocks/HeroBlock";
import { RichTextBlockComponent } from "../components/PageBuilder/blocks/RichTextBlock";
import { CTABlockComponent } from "../components/PageBuilder/blocks/CTABlock";
import { CardsBlockComponent } from "../components/PageBuilder/blocks/CardsBlock";
import { ImageGalleryBlockComponent } from "../components/PageBuilder/blocks/ImageGalleryBlock";
import { TabsBlockComponent } from "../components/PageBuilder/blocks/TabsBlock";

export function TemplatesPreview() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PAGE_TEMPLATES[0].id,
  );

  const selectedTemplate = PAGE_TEMPLATES.find(
    (t) => t.id === selectedTemplateId,
  );

  // Convert template blocks to PageBlock format for rendering
  const blocks: PageBlock[] =
    (selectedTemplate?.blocks.map((block, index) => ({
      ...block,
      id: `preview-${index}`,
      order: index,
    })) as PageBlock[]) || [];

  const renderBlock = (block: PageBlock) => {
    switch (block.type) {
      case "hero":
        return <HeroBlockComponent key={block.id} block={block} />;
      case "richtext":
        return <RichTextBlockComponent key={block.id} block={block} />;
      case "cta":
        return <CTABlockComponent key={block.id} block={block} />;
      case "cards":
        return <CardsBlockComponent key={block.id} block={block} />;
      case "image-gallery":
        return <ImageGalleryBlockComponent key={block.id} block={block} />;
      case "tabs":
        return <TabsBlockComponent key={block.id} block={block} />;
      default:
        return null;
    }
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case "marketing":
        return "primary";
      case "corporate":
        return "success";
      case "content":
        return "info";
      default:
        return "secondary";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <AppShell>
      <Container fluid className="py-4 bg-body-tertiary min-vh-100">
        <Container>
          {/* Header */}
          <Row className="mb-4" aria-labelledby="templates-title">
            <Col>
              <h1 className="h3 mb-2" id="templates-title">
                Page Templates
              </h1>
              <p className="text-muted mb-0 text-prose">
                Preview and explore professionally designed page templates
              </p>
            </Col>
            <Col xs="auto">
              <Button
                as="a"
                href="/content/new"
                variant="primary"
                className="fw-semibold"
              >
                <i className="bi bi-plus-lg me-1"></i>
                Create New Content
              </Button>
            </Col>
          </Row>

          {/* Template Selector */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <Nav
                variant="pills"
                className="gap-2"
                role="tablist"
                aria-label="Template options"
              >
                {PAGE_TEMPLATES.map((template) => (
                  <Nav.Item key={template.id}>
                    <Nav.Link
                      id={`template-tab-${template.id}`}
                      active={selectedTemplateId === template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className="d-flex align-items-center gap-2 fw-semibold"
                      role="tab"
                      aria-selected={selectedTemplateId === template.id}
                      aria-controls={`template-panel-${template.id}`}
                    >
                      {template.name}
                      <Badge
                        bg={getCategoryVariant(template.category)}
                        className="ms-1 text-uppercase"
                        text="light"
                      >
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Body>
          </Card>

          {/* Template Details */}
          {selectedTemplate && (
            <Card
              className="mb-4 border-0 shadow-sm"
              id={`template-panel-${selectedTemplate.id}`}
              role="tabpanel"
              aria-labelledby={`template-tab-${selectedTemplate.id}`}
            >
              <Card.Body className="p-4">
                <Row>
                  <Col md={8}>
                    <h2 className="h4 mb-2">{selectedTemplate.name}</h2>
                    <p className="text-muted mb-3">
                      {selectedTemplate.description}
                    </p>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Badge
                      bg={getCategoryVariant(selectedTemplate.category)}
                      className="me-2 text-uppercase"
                      text="light"
                    >
                      {getCategoryLabel(selectedTemplate.category)}
                    </Badge>
                    <Badge bg="dark" className="ms-1">
                      {selectedTemplate.blocks.length} blocks
                    </Badge>
                    <div className="mt-3">
                      <Button
                        as="a"
                        href="/content/new"
                        variant="dark"
                        size="sm"
                        className="fw-semibold"
                      >
                        <i className="bi bi-file-earmark-plus me-1"></i>
                        Use This Template
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Template Preview */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-body border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="h5 mb-0">
                  <i className="bi bi-eye me-2"></i>
                  Live Preview
                </h3>
                <span className="text-muted small">Scrollable preview</span>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="bg-white" aria-label="Template preview">
                {blocks.map((block) => renderBlock(block))}
              </div>
            </Card.Body>
          </Card>

          {/* Block List */}
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Header className="bg-body border-bottom">
              <h3 className="h6 mb-0">
                <i className="bi bi-stack me-2"></i>
                Template Blocks ({blocks.length})
              </h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush" role="list">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-4 py-3"
                    role="listitem"
                  >
                    <div>
                      <Badge bg="secondary" className="me-2">
                        {index + 1}
                      </Badge>
                      <strong className="text-capitalize">{block.type}</strong>
                      {block.type === "hero" && (
                        <span className="text-muted ms-2">
                          - {block.data.title}
                        </span>
                      )}
                      {block.type === "cta" && (
                        <span className="text-muted ms-2">
                          - {block.data.title}
                        </span>
                      )}
                      {block.type === "cards" && (
                        <span className="text-muted ms-2">
                          - {block.data.cards.length} cards
                        </span>
                      )}
                      {block.type === "image-gallery" && (
                        <span className="text-muted ms-2">
                          - {block.data.images.length} images
                        </span>
                      )}
                    </div>
                    <Badge bg="dark" pill>
                      {block.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </AppShell>
  );
}
