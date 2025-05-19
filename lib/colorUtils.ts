import namer from 'color-namer';

/**
 * Color types shared across the application
 */
export interface ProductColor {
  id?: string;
  color: string;
  imageUrl: string;
}

/**
 * Gets a human-readable color name from a hex value
 */
export function getColorName(colorValue: string): string {
  try {
    // If it's a valid hex code, use color-namer to get the name
    if (colorValue.startsWith('#')) {
      const result = namer(colorValue);
      return result.basic[0].name;
    }
    // Otherwise just return the color value as is (might already be a name)
    return colorValue;
  } catch (error) {
    console.error('Error getting color name:', error);
    return colorValue;
  }
}

/**
 * Maps a color to a Tailwind CSS class
 */
export function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    'red': 'bg-red-500',
    'blue': 'bg-blue-600',
    'green': 'bg-green-500',
    'yellow': 'bg-yellow-400',
    'purple': 'bg-purple-500',
    'pink': 'bg-pink-400',
    'orange': 'bg-orange-500',
    'black': 'bg-black',
    'white': 'bg-white border border-gray-200',
    'gray': 'bg-gray-500',
    'brown': 'bg-amber-800',
    'cyan': 'bg-cyan-500',
    'navy': 'bg-blue-900',
    'navy blue': 'bg-blue-900',
    'royal blue': 'bg-blue-600',
    'bottle green': 'bg-green-800',
    'olive': 'bg-green-700',
    'maroon': 'bg-red-800',
    'sky-blue': 'bg-sky-400',
  };

  // Try with the exact color
  if (colorMap[color.toLowerCase()]) {
    return colorMap[color.toLowerCase()];
  }
  
  // If not found, try to find a close match
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.toLowerCase().includes(key)) {
      return value;
    }
  }

  // Default if no match found
  return 'bg-gray-300';
}

/**
 * Creates a mapping between color values and their associated image URLs
 * from an array of ProductColor objects
 */
export function createColorImageMap(colorData: ProductColor[]): Record<string, string> {
  return colorData.reduce((map: Record<string, string>, colorObj: ProductColor) => {
    // Use the color value as the key and imageUrl as the value
    map[colorObj.color] = colorObj.imageUrl;
    return map;
  }, {});
}

/**
 * Gets the image URL for a selected color from a color-to-image mapping
 * Returns a default image if the color isn't found in the mapping
 */
export function getImageForColor(
  color: string, 
  colorImageMap: Record<string, string>, 
  defaultImage: string
): string {
  // Debug logging
  console.log(`Getting image for color: ${color}`, colorImageMap);
  
  if (colorImageMap && colorImageMap[color]) {
    const imageUrl = colorImageMap[color];
    console.log(`Found image for color ${color}: ${imageUrl}`);
    return imageUrl;
  } else {
    console.warn(`No image found for color ${color}, using default image`);
    return defaultImage;
  }
} 