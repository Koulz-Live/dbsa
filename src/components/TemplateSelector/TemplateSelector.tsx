import { Modal, Button, Card, Row, Col, Badge } from "react-bootstrap";
import { PageTemplate, PAGE_TEMPLATES } from "../../data/pageTemplates";
import { PageBlock } from "../PageBuilder/types";

interface TemplateSelectorProps {
  show: boolean;
  onHide: () => void;
  onSelectTemplate: (blocks: PageBlock[]) => void;
}

export function TemplateSelector({
  show,
  onHide,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const handleSelectTemplate = (template: PageTemplate) => {
    // Convert template blocks to PageBlock format with IDs and order
    const blocks: PageBlock[] = template.blocks.map((block, index) => ({
      ...block,
      id: `${Date.now()}-${index}`,
      order: index,
    })) as PageBlock[];

    onSelectTemplate(blocks);
    onHide();
  };

  const getCategoryVariant = (category: PageTemplate["category"]) => {
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

  const getCategoryLabel = (category: PageTemplate["category"]) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      aria-labelledby="template-selector-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="template-selector-title">
          Choose a Page Template
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-4">
        <p className="text-muted mb-4">
          Start with a professionally designed template. You can customize all
          blocks after applying the template.
        </p>

        <Row className="g-4">
          {PAGE_TEMPLATES.map((template) => (
            <Col key={template.id} md={6}>
              <Card className="h-100 border-0 shadow-sm">
                {template.thumbnail ? (
                  <Card.Img
                    variant="top"
                    src={template.thumbnail}
                    alt={`${template.name} template preview`}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-body-tertiary d-flex align-items-center justify-content-center"
                    style={{ height: "160px" }}
                    aria-hidden="true"
                  >
                    <i className="bi bi-layout-text-window-reverse fs-1 text-muted"></i>
                  </div>
                )}
                <Card.Body className="d-flex flex-column p-4">
                  <div className="mb-2 d-flex align-items-center flex-wrap gap-2">
                    <Badge
                      bg={getCategoryVariant(template.category)}
                      className="text-uppercase"
                      text="light"
                    >
                      {getCategoryLabel(template.category)}
                    </Badge>
                    <Badge bg="dark">{template.blocks.length} blocks</Badge>
                  </div>
                  <Card.Title className="h5">{template.name}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {template.description}
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleSelectTemplate(template)}
                    className="mt-2 fw-semibold"
                    aria-label={`Use ${template.name} template`}
                  >
                    Use This Template
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
