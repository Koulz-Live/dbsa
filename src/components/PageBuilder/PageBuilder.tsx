import React, { useState } from "react";
import { Card, Button, Badge, ButtonGroup } from "react-bootstrap";
import { PageBlock, BlockType, BLOCK_TEMPLATES } from "./types";
import { HeroBlockComponent } from "./blocks/HeroBlock";
import { RichTextBlockComponent } from "./blocks/RichTextBlock";
import { CTABlockComponent } from "./blocks/CTABlock";
import { CardsBlockComponent } from "./blocks/CardsBlock";
import { ImageGalleryBlockComponent } from "./blocks/ImageGalleryBlock";
import { HeroBlockEditor } from "./editors/HeroBlockEditor";
import { RichTextBlockEditor } from "./editors/RichTextBlockEditor";
import { CTABlockEditor } from "./editors/CTABlockEditor";
import { CardsBlockEditor } from "./editors/CardsBlockEditor";
import { ImageGalleryBlockEditor } from "./editors/ImageGalleryBlockEditor";

interface PageBuilderProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  blocks,
  onChange,
}) => {
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
    onChange(
      blocks.map((block) => (block.id === blockId ? updatedBlock : block)),
    );
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
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    onChange(newBlocks.map((block, idx) => ({ ...block, order: idx })));
  };

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
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
      case "hero":
        return <HeroBlockComponent block={block} isEditing />;
      case "richtext":
        return <RichTextBlockComponent block={block} isEditing />;
      case "cta":
        return <CTABlockComponent block={block} isEditing />;
      case "cards":
        return <CardsBlockComponent block={block} isEditing />;
      case "image-gallery":
        return <ImageGalleryBlockComponent block={block} isEditing />;
      default:
        return null;
    }
  };

  // Render block editor
  const renderBlockEditor = (block: PageBlock) => {
    switch (block.type) {
      case "hero":
        return (
          <HeroBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case "richtext":
        return (
          <RichTextBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case "cta":
        return (
          <CTABlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case "cards":
        return (
          <CardsBlockEditor
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
          />
        );
      case "image-gallery":
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
    hero: "Hero Section",
    richtext: "Rich Text",
    cta: "Call to Action",
    cards: "Card Grid",
    "image-gallery": "Image Gallery",
  };

  return (
    <div className="d-flex gap-3">
      {/* Left Panel - Block List and Preview */}
      <div className="flex-fill">
        {/* Add Block Toolbar */}
        <Card className="mb-3">
          <Card.Body>
            <h5 className="card-title h6 mb-3">Add Block</h5>
            <div className="d-flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => addBlock("hero")}
                variant="outline-primary"
                size="sm"
              >
                <i className="bi bi-image me-1"></i>
                Hero
              </Button>
              <Button
                type="button"
                onClick={() => addBlock("richtext")}
                variant="outline-secondary"
                size="sm"
              >
                <i className="bi bi-text-paragraph me-1"></i>
                Rich Text
              </Button>
              <Button
                type="button"
                onClick={() => addBlock("cta")}
                variant="outline-success"
                size="sm"
              >
                <i className="bi bi-megaphone me-1"></i>
                CTA
              </Button>
              <Button
                type="button"
                onClick={() => addBlock("cards")}
                variant="outline-warning"
                size="sm"
              >
                <i className="bi bi-grid-3x3 me-1"></i>
                Cards
              </Button>
              <Button
                type="button"
                onClick={() => addBlock("image-gallery")}
                variant="outline-info"
                size="sm"
              >
                <i className="bi bi-images me-1"></i>
                Gallery
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Blocks Preview */}
        <div className="d-flex flex-column gap-3">
          {blocks.length === 0 ? (
            <Card className="text-center py-5 bg-light border-2 border-dashed">
              <Card.Body>
                <i className="bi bi-box display-4 text-muted"></i>
                <p className="text-muted mb-1 mt-3">No blocks added yet</p>
                <p className="small text-muted">
                  Click a button above to add your first block
                </p>
              </Card.Body>
            </Card>
          ) : (
            blocks.map((block, index) => (
              <Card
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`${
                  editingBlockId === block.id
                    ? "border-primary border-2 shadow"
                    : "border"
                } ${draggedIndex === index ? "opacity-50" : ""}`}
                style={{ cursor: "move" }}
              >
                {/* Block Controls */}
                <Card.Header className="bg-light d-flex align-items-center justify-content-between py-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-grip-vertical text-muted"></i>
                    <Badge bg="secondary" className="fw-normal">
                      {blockTypeLabels[block.type]}
                    </Badge>
                  </div>

                  <ButtonGroup size="sm">
                    <Button
                      variant="outline-secondary"
                      onClick={() => moveBlockUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <i className="bi bi-arrow-up"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => moveBlockDown(index)}
                      disabled={index === blocks.length - 1}
                      title="Move down"
                    >
                      <i className="bi bi-arrow-down"></i>
                    </Button>
                    <Button
                      variant={
                        editingBlockId === block.id
                          ? "primary"
                          : "outline-secondary"
                      }
                      onClick={() =>
                        setEditingBlockId(
                          editingBlockId === block.id ? null : block.id,
                        )
                      }
                    >
                      <i
                        className={`bi bi-${editingBlockId === block.id ? "x" : "pencil"}`}
                      ></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => deleteBlock(block.id)}
                      title="Delete block"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </ButtonGroup>
                </Card.Header>

                {/* Block Preview */}
                <Card.Body className="p-0">{renderBlock(block)}</Card.Body>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Block Editor */}
      {editingBlockId && (
        <Card
          style={{
            width: "384px",
            position: "sticky",
            top: "1rem",
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
          }}
        >
          <Card.Body>
            <h5 className="card-title mb-3">
              Edit{" "}
              {
                blockTypeLabels[
                  blocks.find((b) => b.id === editingBlockId)!.type
                ]
              }
            </h5>
            {renderBlockEditor(blocks.find((b) => b.id === editingBlockId)!)}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
