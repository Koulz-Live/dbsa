import React, { useState } from 'react';
import { PageBlock, BlockType, BLOCK_TEMPLATES } from './types';
import { HeroBlockComponent } from './blocks/HeroBlock';
import { RichTextBlockComponent } from './blocks/RichTextBlock';
import { CTABlockComponent } from './blocks/CTABlock';
import { CardsBlockComponent } from './blocks/CardsBlock';
import { ImageGalleryBlockComponent } from './blocks/ImageGalleryBlock';
import { HeroBlockEditor } from './editors/HeroBlockEditor';
import { RichTextBlockEditor } from './editors/RichTextBlockEditor';
import { CTABlockEditor } from './editors/CTABlockEditor';
import { CardsBlockEditor } from './editors/CardsBlockEditor';
import { ImageGalleryBlockEditor } from './editors/ImageGalleryBlockEditor';

interface PageBuilderProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ blocks, onChange }) => {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Add a new block
  const addBlock = (type: BlockType) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock: PageBlock = {
      ...template,
      id: Date.now().toString(),
      order: blocks.length,
    } as PageBlock;

    onChange([...blocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  // Update a block
  const updateBlock = (blockId: string, updatedBlock: PageBlock) => {
    onChange(blocks.map((block) => (block.id === blockId ? updatedBlock : block)));
  };

  // Delete a block
  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks
      .filter((block) => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    onChange(updatedBlocks);
    setEditingBlockId(null);
  };

  // Move block up
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks.map((block, idx) => ({ ...block, order: idx })));
  };

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks.map((block, idx) => ({ ...block, order: idx })));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    
    onChange(newBlocks.map((block, idx) => ({ ...block, order: idx })));
    setDraggedIndex(null);
  };

  // Render block component
  const renderBlock = (block: PageBlock) => {
    switch (block.type) {
      case 'hero':
        return <HeroBlockComponent block={block} isEditing />;
      case 'richtext':
        return <RichTextBlockComponent block={block} isEditing />;
      case 'cta':
        return <CTABlockComponent block={block} isEditing />;
      case 'cards':
        return <CardsBlockComponent block={block} isEditing />;
      case 'image-gallery':
        return <ImageGalleryBlockComponent block={block} isEditing />;
      default:
        return null;
    }
  };

  // Render block editor
  const renderBlockEditor = (block: PageBlock) => {
    switch (block.type) {
      case 'hero':
        return (
          <HeroBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case 'richtext':
        return (
          <RichTextBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case 'cta':
        return (
          <CTABlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case 'cards':
        return (
          <CardsBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case 'image-gallery':
        return (
          <ImageGalleryBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      default:
        return null;
    }
  };

  const blockTypeLabels: Record<BlockType, string> = {
    hero: 'Hero Section',
    richtext: 'Rich Text',
    cta: 'Call to Action',
    cards: 'Card Grid',
    'image-gallery': 'Image Gallery',
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel - Block List and Preview */}
      <div className="flex-1 space-y-4">
        {/* Add Block Toolbar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Block</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addBlock('hero')}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
            >
              + Hero
            </button>
            <button
              type="button"
              onClick={() => addBlock('richtext')}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100"
            >
              + Rich Text
            </button>
            <button
              type="button"
              onClick={() => addBlock('cta')}
              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
            >
              + CTA
            </button>
            <button
              type="button"
              onClick={() => addBlock('cards')}
              className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100"
            >
              + Cards
            </button>
            <button
              type="button"
              onClick={() => addBlock('image-gallery')}
              className="px-3 py-1.5 text-sm bg-pink-50 text-pink-700 border border-pink-200 rounded hover:bg-pink-100"
            >
              + Gallery
            </button>
          </div>
        </div>

        {/* Blocks Preview */}
        <div className="space-y-4">
          {blocks.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-2">No blocks added yet</p>
              <p className="text-sm text-gray-400">
                Click a button above to add your first block
              </p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white border-2 rounded-lg overflow-hidden transition-all ${
                  editingBlockId === block.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Block Controls */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="cursor-move text-gray-400 hover:text-gray-600"
                      title="Drag to reorder"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {blockTypeLabels[block.type]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveBlockUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlockDown(index)}
                      disabled={index === blocks.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingBlockId(editingBlockId === block.id ? null : block.id)
                      }
                      className={`px-3 py-1 text-xs rounded ${
                        editingBlockId === block.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {editingBlockId === block.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete block"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Block Preview */}
                <div className="bg-white">{renderBlock(block)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Block Editor */}
      {editingBlockId && (
        <div className="w-96 bg-white border border-gray-200 rounded-lg p-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Edit {blockTypeLabels[blocks.find((b) => b.id === editingBlockId)!.type]}
          </h3>
          {renderBlockEditor(blocks.find((b) => b.id === editingBlockId)!)}
        </div>
      )}
    </div>
  );
};
