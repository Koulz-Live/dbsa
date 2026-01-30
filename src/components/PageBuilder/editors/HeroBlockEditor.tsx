import React from 'react';
import { HeroBlock } from '../types';

interface HeroBlockEditorProps {
  block: HeroBlock;
  onChange: (block: HeroBlock) => void;
}

export const HeroBlockEditor: React.FC<HeroBlockEditorProps> = ({ block, onChange }) => {
  const updateData = (updates: Partial<HeroBlock['data']>) => {
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
          placeholder="Enter hero title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          value={block.data.subtitle || ''}
          onChange={(e) => updateData({ subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter hero subtitle"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Image URL
        </label>
        <input
          type="text"
          value={block.data.backgroundImage || ''}
          onChange={(e) => updateData({ backgroundImage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignment
        </label>
        <select
          value={block.data.alignment}
          onChange={(e) => updateData({ alignment: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Call to Action (Optional)</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={block.data.ctaText || ''}
              onChange={(e) => updateData({ ctaText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Learn More"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button URL
            </label>
            <input
              type="text"
              value={block.data.ctaUrl || ''}
              onChange={(e) => updateData({ ctaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
