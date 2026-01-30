import React from 'react';
import { ImageGalleryBlock } from '../types';

interface ImageGalleryBlockEditorProps {
  block: ImageGalleryBlock;
  onChange: (block: ImageGalleryBlock) => void;
}

export const ImageGalleryBlockEditor: React.FC<ImageGalleryBlockEditorProps> = ({
  block,
  onChange,
}) => {
  const updateData = (updates: Partial<ImageGalleryBlock['data']>) => {
    onChange({
      ...block,
      data: { ...block.data, ...updates },
    });
  };

  const addImage = () => {
    const newImage = {
      id: Date.now().toString(),
      url: '',
      alt: 'Image',
    };
    updateData({ images: [...block.data.images, newImage] });
  };

  const removeImage = (imageId: string) => {
    updateData({ images: block.data.images.filter((img) => img.id !== imageId) });
  };

  const updateImage = (imageId: string, updates: Partial<typeof block.data.images[0]>) => {
    updateData({
      images: block.data.images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gallery Title
        </label>
        <input
          type="text"
          value={block.data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Image Gallery"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Layout
        </label>
        <select
          value={block.data.layout}
          onChange={(e) =>
            updateData({ layout: e.target.value as 'grid' | 'masonry' | 'carousel' })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Images</h4>
          <button
            type="button"
            onClick={addImage}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Image
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {block.data.images.map((image, index) => (
            <div key={image.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Image {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={image.url}
                    onChange={(e) => updateImage(image.id, { url: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alt Text *
                  </label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description of the image"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Image caption"
                  />
                </div>

                {image.url && (
                  <div className="mt-2">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {block.data.images.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No images added yet. Click "Add Image" to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
