import React from "react";
import { Row, Col } from "react-bootstrap";
import { ImageGalleryBlock } from "../types";

interface ImageGalleryBlockComponentProps {
  block: ImageGalleryBlock;
  isEditing?: boolean;
}

export const ImageGalleryBlockComponent: React.FC<
  ImageGalleryBlockComponentProps
> = ({ block, isEditing }) => {
  const { title, images, layout } = block.data;

  const renderGrid = () => (
    <Row className="g-3">
      {images.map((image) => (
        <Col key={image.id} xs={6} md={4} lg={3}>
          <div
            className="position-relative overflow-hidden rounded"
            style={{ paddingTop: "100%" }}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            />
            {image.caption && (
              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                <p className="mb-0 small">{image.caption}</p>
              </div>
            )}
          </div>
        </Col>
      ))}
    </Row>
  );

  const renderMasonry = () => (
    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
      {images.map((image) => (
        <div key={image.id} className="col">
          <div className="position-relative overflow-hidden rounded">
            <img src={image.url} alt={image.alt} className="w-100 h-auto" />
            {image.caption && (
              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                <p className="mb-0 small">{image.caption}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div
      className="d-flex overflow-auto gap-3"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          className="flex-shrink-0 position-relative overflow-hidden rounded"
          style={{ width: "16rem", scrollSnapAlign: "start" }}
        >
          <img src={image.url} alt={image.alt} className="w-100 h-auto" />
          {image.caption && (
            <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
              <p className="mb-0 small">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`p-4 ${isEditing ? "border border-2 border-primary" : ""}`}>
      <div className="container py-4">
        {title && (
          <h2 className="display-5 fw-bold text-center mb-5">{title}</h2>
        )}

        {images.length === 0 ? (
          <div className="text-center py-5 bg-light rounded">
            <p className="text-muted mb-0">No images added yet</p>
          </div>
        ) : (
          <>
            {layout === "grid" && renderGrid()}
            {layout === "masonry" && renderMasonry()}
            {layout === "carousel" && renderCarousel()}
          </>
        )}
      </div>
    </div>
  );
};
