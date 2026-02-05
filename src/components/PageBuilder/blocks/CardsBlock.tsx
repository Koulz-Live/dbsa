import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { CardsBlock } from "../types";

interface CardsBlockComponentProps {
  block: CardsBlock;
  isEditing?: boolean;
}

export const CardsBlockComponent: React.FC<CardsBlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const { title, cards, columns } = block.data;

  const colSize = {
    2: 6, // 2 columns = col-md-6
    3: 4, // 3 columns = col-md-4
    4: 3, // 4 columns = col-md-3
  }[columns];

  return (
    <div className={`p-4 ${isEditing ? "border border-2 border-primary" : ""}`}>
      <div className="container py-4">
        {title && (
          <h2 className="display-5 fw-bold text-center mb-5">{title}</h2>
        )}

        <Row className="g-4">
          {cards.map((card) => (
            <Col key={card.id} xs={12} md={colSize}>
              <Card className="h-100 shadow-sm">
                {card.image && (
                  <Card.Img
                    variant="top"
                    src={card.image}
                    alt={card.title}
                    style={{ height: "12rem", objectFit: "cover" }}
                  />
                )}

                <Card.Body>
                  <Card.Title className="h5">{card.title}</Card.Title>
                  <Card.Text className="text-muted">
                    {card.description}
                  </Card.Text>

                  {card.link && (
                    <a
                      href={card.link}
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={(e) => isEditing && e.preventDefault()}
                    >
                      Learn more <i className="bi bi-arrow-right"></i>
                    </a>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
