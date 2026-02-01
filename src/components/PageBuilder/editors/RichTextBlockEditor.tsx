import React from "react";
import { RichTextBlock } from "../types";

interface RichTextBlockEditorProps {
  block: RichTextBlock;
  onChange: (block: RichTextBlock) => void;
}

export const RichTextBlockEditor: React.FC<RichTextBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const updateData = (updates: Partial<RichTextBlock["data"]>) => {
    onChange({
      ...block,
      data: { ...block.data, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content (HTML)
        </label>
        <textarea
          value={block.data.content}
          onChange={(e) => updateData({ content: e.target.value })}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="<p>Enter HTML content here...</p>"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can use HTML tags. In a production environment, use a rich text
          editor.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <strong>Preview:</strong>
        </p>
        <div
          className="mt-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: block.data.content }}
        />
      </div>
    </div>
  );
};
