import React from 'react';
import { ImageGalleryBlock } from '../types';

interface ImageGalleryBlockComponentProps {
  block: ImageGalleryBlock;
  isEditing?: boolean;
}

export const ImageGalleryBlockComponent: React.FC<ImageGalleryBlockComponentProps> = ({
  block,
  isEditing,
}) => {
  const { title, images, layout } = block.data;

  const layoutClass = {
    grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    masonry: 'columns-2 md:columns-3 lg:columns-4 gap-4',
    carousel: 'flex overflow-x-auto gap-4 snap-x snap-mandatory',
  }[layout];

  return (
    <div className={`p-8 ${isEditing ? 'border-2 border-blue-300' : ''}`}>
      {title && (
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">{title}</h2>
      )}
      
      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No images added yet</p>
        </div>
      ) : (
        <div className={layoutClass}>
          {images.map((image) => (
            <div
              key={image.id}
              className={`${
                layout === 'carousel' ? 'flex-shrink-0 w-64 snap-start' : ''
              } group relative overflow-hidden rounded-lg`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
