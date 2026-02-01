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
    <div
      className={`prose max-w-none p-6 ${isEditing ? "border-2 border-blue-300" : ""}`}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
