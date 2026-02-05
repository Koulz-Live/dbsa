import React from "react";
import { RichTextBlock } from "../types";

interface RichTextBlockComponentProps {
  block: RichTextBlock;
  isEditing?: boolean;
}

export const RichTextBlockComponent: React.FC<RichTextBlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const { content } = block.data;

  return (
    <div className={`p-4 ${isEditing ? "border border-2 border-primary" : ""}`}>
      <div
        className="container"
        style={{ maxWidth: "65ch" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
