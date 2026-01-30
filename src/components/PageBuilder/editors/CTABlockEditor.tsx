import React from 'react';
import { CTABlock } from '../types';

interface CTABlockEditorProps {
  block: CTABlock;
  onChange: (block: CTABlock) => void;
}

export const CTABlockEditor: React.FC<CTABlockEditorProps> = ({ block, onChange }) => {
  const updateData = (updates: Partial<CTABlock['data']>) => {
    onChange({
      ...block,
      data: { ...block.data, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={block.data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Call to Action Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={block.data.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Compelling description text"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text *
          </label>
          <input
            type="text"
            value={block.data.buttonText}
            onChange={(e) => updateData({ buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Learn More"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button URL *
          </label>
          <input
            type="text"
            value={block.data.buttonUrl}
            onChange={(e) => updateData({ buttonUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Styling</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={block.data.backgroundColor || '#3b82f6'}
              onChange={(e) => updateData({ backgroundColor: e.target.value })}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <input
              type="color"
              value={block.data.textColor || '#ffffff'}
              onChange={(e) => updateData({ textColor: e.target.value })}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
