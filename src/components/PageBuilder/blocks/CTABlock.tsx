import React from "react";
import { CTABlock } from "../types";

interface CTABlockComponentProps {
  block: CTABlock;
  isEditing?: boolean;
}

export const CTABlockComponent: React.FC<CTABlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const {
    title,
    description,
    buttonText,
    buttonUrl,
    backgroundColor,
    textColor,
  } = block.data;

  return (
    <div
      className={`py-5 text-center ${isEditing ? "border border-2 border-primary" : ""}`}
      style={{
        backgroundColor: backgroundColor || "#0d6efd",
        color: textColor || "#ffffff",
        padding: "5rem 1rem",
      }}
    >
      <div className="container" style={{ maxWidth: "48rem" }}>
        <h2 className="display-4 fw-bold mb-4">{title}</h2>

        {description && (
          <p className="fs-5 mb-4" style={{ opacity: 0.9 }}>
            {description}
          </p>
        )}

        <a
          href={buttonUrl}
          className="btn btn-light btn-lg shadow"
          onClick={(e) => isEditing && e.preventDefault()}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};
