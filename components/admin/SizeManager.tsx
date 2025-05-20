'use client';

import React, { useState, Dispatch, SetStateAction } from 'react';

interface Size {
  id?: string;
  size: string;
  stock: number;
}

interface SizeManagerProps {
  sizes: Size[];
  setSizes: Dispatch<SetStateAction<Size[]>>;
  totalStock?: number;
  onChange?: (sizes: Size[]) => void; // Keep for backwards compatibility
}

export default function SizeManager({
  sizes,
  setSizes,
  totalStock = 0,
  onChange,
}: SizeManagerProps) {
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState(0);

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '2 - 3Y', '4 - 5Y', '6 - 7Y', '8 - 9Y', '10 - 11Y', '12 - 13Y'];

  const updateSizes = (newSizes: Size[]) => {
    setSizes(newSizes);
    // Call onChange for backwards compatibility
    if (onChange) {
      onChange(newSizes);
    }
  };

  const handleAddSize = () => {
    if (!newSize) return;

    // Check if size already exists
    if (sizes.some(s => s.size === newSize)) {
      alert(`Size ${newSize} already exists`);
      return;
    }

    updateSizes([...sizes, { size: newSize, stock: newStock }]);
    setNewSize('');
    setNewStock(0);
  };

  const handleQuickAddSize = (size: string) => {
    if (sizes.some(s => s.size === size)) {
      alert(`Size ${size} already exists`);
      return;
    }

    updateSizes([...sizes, { size, stock: 0 }]);
  };

  const handleRemoveSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    updateSizes(updatedSizes);
  };

  const handleStockChange = (index: number, stock: number) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = { ...updatedSizes[index], stock };
    updateSizes(updatedSizes);
  };

  // Calculate total allocated stock
  const allocatedStock = sizes.reduce((total, size) => total + size.stock, 0);
  const remainingStock = Math.max(0, totalStock - allocatedStock);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {commonSizes.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => handleQuickAddSize(size)}
            disabled={sizes.some(s => s.size === size)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {size}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div>
          <label htmlFor="new-size" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Size
          </label>
          <input
            type="text"
            id="new-size"
            value={newSize}
            onChange={e => setNewSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g. 4XL"
          />
        </div>
        <div>
          <label htmlFor="new-stock" className="block text-sm font-medium text-gray-700 mb-1">
            Initial Stock
          </label>
          <input
            type="number"
            id="new-stock"
            value={newStock}
            onChange={e => setNewStock(Number(e.target.value))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAddSize}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      {totalStock > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="flex justify-between text-sm">
            <span>Total Stock: {totalStock}</span>
            <span>Allocated: {allocatedStock}</span>
            <span className={remainingStock > 0 ? 'text-green-600' : 'text-red-600'}>
              Remaining: {remainingStock}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${remainingStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{
                width: `${Math.min(100, (allocatedStock / totalStock) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Added Sizes</h4>
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Size
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sizes.map((size, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {size.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="number"
                        value={size.stock}
                        onChange={e => handleStockChange(index, Number(e.target.value))}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveSize(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
