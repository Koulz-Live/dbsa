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
  const { title, cards, columns, fullWidth, titleAlign } = block.data;

  const colSize = {
    2: 6, // 2 columns = col-md-6
    3: 4, // 3 columns = col-md-4
    4: 3, // 4 columns = col-md-3
  }[columns];

  return (
    <div className={`p-4 ${isEditing ? "border border-2 border-primary" : ""}`}>
      <div
        className={`${
          fullWidth ? "container-fluid px-3 px-lg-4" : "container"
        } py-4`}
      >
        {title && (
          <h2
            className={`display-5 fw-bold mb-5 ${
              titleAlign === "start" ? "text-start" : "text-center"
            }`}
          >
            {title}
          </h2>
        )}

        <Row className="g-4">
          {cards.map((card) => {
            const isDecorative = card.isDecorative && !card.imageAlt;
            const imageAlt = isDecorative ? "" : card.imageAlt || card.title;
            return (
              <Col key={card.id} xs={12} md={colSize}>
                <Card className="h-100 card-link shadow-sm">
                  {card.image && (
                    <Card.Img
                      variant="top"
                      src={card.image}
                      alt={imageAlt}
                      aria-hidden={isDecorative ? true : undefined}
                      style={{ height: "12rem", objectFit: "cover" }}
                    />
                  )}

                  <Card.Body className="position-relative">
                    {(card.category ||
                      card.readingTime ||
                      card.contentType) && (
                      <div className="card-meta">
                        {card.category && <span>{card.category}</span>}
                        {card.contentType && <span>{card.contentType}</span>}
                        {card.readingTime && <span>{card.readingTime}</span>}
                      </div>
                    )}
                    <Card.Title className="h5 mb-2">{card.title}</Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {card.description}
                    </Card.Text>

                    {card.link && (
                      <>
                        <span className="card-link__cta text-primary">
                          Learn more <i className="bi bi-arrow-right"></i>
                        </span>
                        <a
                          href={card.link}
                          className="stretched-link"
                          aria-label={`Open ${card.title}`}
                          onClick={(e) => isEditing && e.preventDefault()}
                        ></a>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};
