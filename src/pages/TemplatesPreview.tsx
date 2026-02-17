import { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Nav } from "react-bootstrap";
import { Navigation } from "../components/Navigation";
import { PAGE_TEMPLATES } from "../data/pageTemplates";
import { PageBlock } from "../components/PageBuilder";
import { HeroBlockComponent } from "../components/PageBuilder/blocks/HeroBlock";
import { RichTextBlockComponent } from "../components/PageBuilder/blocks/RichTextBlock";
import { CTABlockComponent } from "../components/PageBuilder/blocks/CTABlock";
import { CardsBlockComponent } from "../components/PageBuilder/blocks/CardsBlock";
import { ImageGalleryBlockComponent } from "../components/PageBuilder/blocks/ImageGalleryBlock";

export function TemplatesPreview() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PAGE_TEMPLATES[0].id,
  );

  const selectedTemplate = PAGE_TEMPLATES.find(
    (t) => t.id === selectedTemplateId,
  );

  // Convert template blocks to PageBlock format for rendering
  const blocks: PageBlock[] =
    selectedTemplate?.blocks.map((block, index) => ({
      ...block,
      id: `preview-${index}`,
      order: index,
    })) as PageBlock[] || [];

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
    <>
      <Navigation />
      <Container fluid className="py-4 bg-light min-vh-100">
        <Container>
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <h1 className="h3 mb-2">Page Templates</h1>
              <p className="text-muted">
                Preview and explore professionally designed page templates
              </p>
            </Col>
            <Col xs="auto">
              <Button
                as="a"
                href="/content/new"
                variant="primary"
              >
                <i className="bi bi-plus-lg me-1"></i>
                Create New Content
              </Button>
            </Col>
          </Row>

          {/* Template Selector */}
          <Card className="mb-4">
            <Card.Body>
              <Nav variant="pills" className="gap-2">
                {PAGE_TEMPLATES.map((template) => (
                  <Nav.Item key={template.id}>
                    <Nav.Link
                      active={selectedTemplateId === template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className="d-flex align-items-center gap-2"
                    >
                      {template.name}
                      <Badge bg={getCategoryVariant(template.category)} className="ms-1">
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
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h4 className="mb-2">{selectedTemplate.name}</h4>
                    <p className="text-muted mb-3">
                      {selectedTemplate.description}
                    </p>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Badge
                      bg={getCategoryVariant(selectedTemplate.category)}
                      className="me-2"
                    >
                      {getCategoryLabel(selectedTemplate.category)}
                    </Badge>
                    <Badge bg="light" text="dark">
                      {selectedTemplate.blocks.length} blocks
                    </Badge>
                    <div className="mt-3">
                      <Button
                        as="a"
                        href="/content/new"
                        variant="success"
                        size="sm"
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
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-eye me-2"></i>
                Live Preview
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="bg-white">
                {blocks.map((block) => renderBlock(block))}
              </div>
            </Card.Body>
          </Card>

          {/* Block List */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-stack me-2"></i>
                Template Blocks ({blocks.length})
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
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
                    <Badge bg="light" text="dark" pill>
                      {block.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </>
  );
}
