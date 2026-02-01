import React from "react";
import { CardsBlock, Card } from "../types";

interface CardsBlockEditorProps {
  block: CardsBlock;
  onChange: (block: CardsBlock) => void;
}

export const CardsBlockEditor: React.FC<CardsBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const updateData = (updates: Partial<CardsBlock["data"]>) => {
    onChange({
      ...block,
      data: { ...block.data, ...updates },
    });
  };

  const addCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      title: "New Card",
      description: "Card description",
    };
    updateData({ cards: [...block.data.cards, newCard] });
  };

  const removeCard = (cardId: string) => {
    updateData({ cards: block.data.cards.filter((c) => c.id !== cardId) });
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    updateData({
      cards: block.data.cards.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={block.data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Cards Section Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Columns
        </label>
        <select
          value={block.data.columns}
          onChange={(e) =>
            updateData({ columns: parseInt(e.target.value) as 2 | 3 | 4 })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={2}>2 columns</option>
          <option value={3}>3 columns</option>
          <option value={4}>4 columns</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Cards</h4>
          <button
            type="button"
            onClick={addCard}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Card
          </button>
        </div>

        <div className="space-y-4">
          {block.data.cards.map((card, index) => (
            <div
              key={card.id}
              className="border border-gray-200 rounded-md p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Card {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) =>
                      updateCard(card.id, { title: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={card.description}
                    onChange={(e) =>
                      updateCard(card.id, { description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={card.image || ""}
                    onChange={(e) =>
                      updateCard(card.id, { image: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Link URL (optional)
                  </label>
                  <input
                    type="text"
                    value={card.link || ""}
                    onChange={(e) =>
                      updateCard(card.id, { link: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ))}

          {block.data.cards.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No cards added yet. Click "Add Card" to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
