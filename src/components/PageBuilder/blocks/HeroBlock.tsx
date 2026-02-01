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
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment];

  return (
    <div
      className={`relative min-h-[400px] flex items-center justify-center p-8 ${
        isEditing ? "border-2 border-blue-300" : ""
      }`}
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundColor: !backgroundImage ? "#f3f4f6" : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      )}

      <div className={`relative z-10 max-w-4xl mx-auto ${alignmentClass}`}>
        <h1
          className={`text-4xl md:text-5xl font-bold mb-4 ${
            backgroundImage ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={`text-xl md:text-2xl mb-6 ${
              backgroundImage ? "text-gray-100" : "text-gray-600"
            }`}
          >
            {subtitle}
          </p>
        )}

        {ctaText && ctaUrl && (
          <a
            href={ctaUrl}
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            onClick={(e) => isEditing && e.preventDefault()}
          >
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
};
