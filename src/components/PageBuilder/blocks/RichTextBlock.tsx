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
  const { content, fullWidth } = block.data;

  return (
    <div
      className={`${fullWidth ? "p-0" : "p-4"} ${
        isEditing ? "border border-2 border-primary" : ""
      }`}
    >
      <div
        className={fullWidth ? "container-fluid px-0" : "container px-0"}
        style={{ maxWidth: fullWidth ? "100%" : "65ch" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
