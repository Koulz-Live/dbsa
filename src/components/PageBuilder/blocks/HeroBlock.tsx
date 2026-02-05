import React from "react";
import { HeroBlock } from "../types";

interface HeroBlockComponentProps {
  block: HeroBlock;
  isEditing?: boolean;
}

export const HeroBlockComponent: React.FC<HeroBlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const { title, subtitle, backgroundImage, ctaText, ctaUrl, alignment } =
    block.data;

  const alignmentClass = {
    left: "text-start",
    center: "text-center",
    right: "text-end",
  }[alignment];

  return (
    <div
      className={`position-relative d-flex align-items-center justify-content-center p-5 ${
        isEditing ? "border border-2 border-primary" : ""
      }`}
      style={{
        minHeight: "400px",
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundColor: !backgroundImage ? "#f8f9fa" : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.4 }}
        ></div>
      )}

      <div
        className={`position-relative z-1 container ${alignmentClass}`}
        style={{ maxWidth: "56rem" }}
      >
        <h1
          className={`display-3 fw-bold mb-4 ${
            backgroundImage ? "text-white" : "text-dark"
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={`fs-4 mb-4 ${
              backgroundImage ? "text-white-50" : "text-muted"
            }`}
          >
            {subtitle}
          </p>
        )}

        {ctaText && ctaUrl && (
          <a
            href={ctaUrl}
            className="btn btn-primary btn-lg"
            onClick={(e) => isEditing && e.preventDefault()}
          >
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
};
