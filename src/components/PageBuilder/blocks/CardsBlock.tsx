import React from 'react';
import { CardsBlock } from '../types';

interface CardsBlockComponentProps {
  block: CardsBlock;
  isEditing?: boolean;
}

export const CardsBlockComponent: React.FC<CardsBlockComponentProps> = ({ block, isEditing }) => {
  const { title, cards, columns } = block.data;

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`p-8 ${isEditing ? 'border-2 border-blue-300' : ''}`}>
      {title && (
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      <div className={`grid ${gridCols} gap-6 max-w-7xl mx-auto`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {card.image && (
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              
              {card.link && (
                <a
                  href={card.link}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={(e) => isEditing && e.preventDefault()}
                >
                  Learn more →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
