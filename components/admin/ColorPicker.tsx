'use client';

import React, { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';

interface Color {
  id?: string;
  color: string;
  imageUrl: string;
  file?: File;
}

interface ColorPickerProps {
  colors: Color[];
  setColors: Dispatch<SetStateAction<Color[]>>;
  onChange?: (colors: Color[]) => void; // Keep for backwards compatibility
}

export default function ColorPicker({ colors, setColors, onChange }: ColorPickerProps) {
  const [newColor, setNewColor] = useState('#000000');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInstructions, setShowInstructions] = useState(colors.length === 0);
  const [pendingImage, setPendingImage] = useState<{ file: File; objectUrl: string } | null>(null);

  // Create a hidden canvas element for image processing
  useEffect(() => {
    // Create new canvas only if it doesn't exist
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      canvas.width = 1;
      canvas.height = 1;
      canvasRef.current = canvas;

      // Append to body
      if (typeof document !== 'undefined') {
        document.body.appendChild(canvas);
      }
    }

    // Clean up on unmount
    return () => {
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        try {
          document.body.removeChild(canvasRef.current);
        } catch (error) {
          console.error('Error removing canvas:', error);
        }
      }
    };
  }, []);

  // Show instructions when there are no colors yet
  useEffect(() => {
    setShowInstructions(colors.length === 0);
  }, [colors.length]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(e.target.value);
  };

  const updateColors = (newColors: Color[]) => {
    setColors(newColors);
    // Call onChange for backwards compatibility
    if (onChange) {
      onChange(newColors);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    // If index is provided, update existing color
    if (index !== undefined) {
      const updatedColors = [...colors];
      updatedColors[index] = {
        ...updatedColors[index],
        file,
        imageUrl: objectUrl,
        // Keep the existing color for the current variant
      };
      updateColors(updatedColors);
    }
    // Otherwise store the uploaded image for later color selection
    else {
      setPendingImage({
        file,
        objectUrl,
      });
    }

    // Reset the input value
    e.target.value = '';
  };

  const addNewColorVariant = () => {
    if (!pendingImage) return;

    updateColors([
      ...colors,
      {
        color: newColor,
        imageUrl: pendingImage.objectUrl,
        file: pendingImage.file,
      },
    ]);

    // Clear the pending image after adding
    setPendingImage(null);

    // Show instructions when adding first color
    if (colors.length === 0) {
      setShowInstructions(true);
    }
  };

  const removeColor = (index: number) => {
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
    updateColors(updatedColors);
  };

  const cancelPendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.objectUrl);
      setPendingImage(null);
    }
  };

  return (
    <div className="space-y-6">
      {showInstructions && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
          <h3 className="text-blue-800 font-medium mb-2">How to Add Colors:</h3>
          <ol className="list-decimal pl-4 text-sm text-blue-800 space-y-1">
            <li>Upload an image of your product in a specific color</li>
            <li>
              Use the color picker to select the exact color that matches the shirt in the image
            </li>
            <li>Click "Add Color Variant" to save the image with its color</li>
            <li>This ensures customers see the correct image when they select a color</li>
          </ol>
        </div>
      )}

      {/* Color Variants */}
      <div className="flex flex-wrap gap-4">
        {colors.map((color, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-md border border-gray-300 overflow-hidden relative"
                style={{ backgroundColor: color.color }}
              >
                {color.imageUrl && (
                  <img
                    src={color.imageUrl}
                    alt={`Product color ${color.color}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.color }}
                ></div>
                <p className="text-xs mt-1 text-center overflow-hidden text-ellipsis max-w-[80px]">
                  {color.color}
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                id={`color-image-${index}`}
                className="hidden"
                onChange={e => handleImageChange(e, index)}
              />

              {hoveredIndex === index && (
                <label
                  htmlFor={`color-image-${index}`}
                  className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Color */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Add New Color Variant</h3>

        {!pendingImage ? (
          <div>
            <label
              htmlFor="new-color-image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              1. Upload Product Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="new-color-image"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleImageChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-md border border-gray-300 overflow-hidden">
                <img
                  src={pendingImage.objectUrl}
                  alt="Uploaded product image"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <label htmlFor="new-color" className="block text-sm font-medium text-gray-700 mb-1">
                  2. Select Matching Color <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="new-color"
                    value={newColor}
                    onChange={handleColorChange}
                    className="h-10 w-12 p-0 border-0"
                  />
                  <span className="text-sm text-gray-500">{newColor}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addNewColorVariant}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Color Variant
              </button>
              <button
                type="button"
                onClick={cancelPendingImage}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
