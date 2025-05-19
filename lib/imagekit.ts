'use client';

import ImageKit from 'imagekit';

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined';

// Create a function to get the ImageKit instance only when needed
let imageKitInstance: ImageKit | null = null;

export const getImageKit = (): ImageKit => {
  // Only initialize if it hasn't been initialized yet
  if (!imageKitInstance) {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    
    // Check for required credentials
    if (!publicKey || !urlEndpoint) {
      console.error('ImageKit credentials not properly configured. Please set the following environment variables:');
      console.error('- NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY');
      console.error('- NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT');
      
      throw new Error('ImageKit is not properly configured. Check your environment variables.');
    }
    
    // Create instance with only client-side keys
    imageKitInstance = new ImageKit({
      publicKey,
      urlEndpoint,
      privateKey: '', // Private key should only be used server-side
    });
  }
  
  return imageKitInstance;
};

// Generate authentication parameters for frontend uploads
export const getAuthenticationParameters = () => {
  return getImageKit().getAuthenticationParameters();
};

// Helper function to upload image through our server API proxy
export const uploadImage = async (file: File, fileName: string): Promise<string> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('folder', '/t-shirt-products');

    // Upload through our server API proxy instead of directly to ImageKit
    const response = await fetch('/api/imagekit/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Upload error:', await response.text());
      throw new Error(`Server upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.url;

  } catch (error) {
    console.error('Error in upload process:', error);
    // Return a placeholder image on failure
    return 'https://via.placeholder.com/400x400?text=Image+Upload+Failed';
  }
};

// Helper function to delete image - only for server-side use
export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await fetch(`/api/imagekit/delete?fileId=${fileId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

// Get file ID from URL (used for deletion)
export const getFileIdFromUrl = (url: string): string => {
  // Extract file ID from ImageKit URL
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1];
  } catch (error) {
    console.error('Error extracting file ID from URL:', error);
    return '';
  }
}; 