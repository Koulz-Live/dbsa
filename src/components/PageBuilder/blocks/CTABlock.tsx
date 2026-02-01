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
      className={`p-12 text-center ${isEditing ? "border-2 border-blue-300" : ""}`}
      style={{
        backgroundColor: backgroundColor || "#3b82f6",
        color: textColor || "#ffffff",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>

        {description && (
          <p className="text-lg md:text-xl mb-8 opacity-90">{description}</p>
        )}

        <a
          href={buttonUrl}
          className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          onClick={(e) => isEditing && e.preventDefault()}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};
