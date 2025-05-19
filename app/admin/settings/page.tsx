'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/lib/imagekit';

type WebsiteSettings = {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  heroSliderImages: string[] | null;
  categoryImages: Record<string, string> | null;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: Record<string, string> | null;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [newSliderImage, setNewSliderImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const categoryOptions = [
    { id: 'mens', label: 'Men\'s Collection' },
    { id: 'kids', label: 'Kids Collection' },
    { id: 'featured', label: 'Featured Products' },
  ];

  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
      
      // Initialize slider images array
      if (data.heroSliderImages && Array.isArray(data.heroSliderImages)) {
        setSliderImages(data.heroSliderImages);
      } else {
        setSliderImages([]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    if (!settings) return;
    
    const updatedSocialLinks = {
      ...(settings.socialLinks || {}),
      [platform]: value
    };
    
    setSettings({
      ...settings,
      socialLinks: updatedSocialLinks
    });
  };

  const handleCategoryImageChange = (categoryId: string, imageUrl: string) => {
    if (!settings) return;
    
    const updatedCategoryImages = {
      ...(settings.categoryImages || {}),
      [categoryId]: imageUrl
    };
    
    setSettings({
      ...settings,
      categoryImages: updatedCategoryImages
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;
    
    try {
      toast.loading('Uploading image...');
      const fileName = `${field}_${Date.now()}_${file.name}`;
      
      // Upload the file to ImageKit
      const imageUrl = await uploadImage(file, fileName);
      
      // Update the appropriate field
      setSettings({
        ...settings,
        [field]: imageUrl
      });
      
      toast.dismiss();
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      toast.error('Failed to upload image');
    }
  };

  const handleSliderImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      toast.loading('Uploading slider image...');
      const fileName = `slider_${Date.now()}_${file.name}`;
      
      // Upload the file to ImageKit
      const imageUrl = await uploadImage(file, fileName);
      
      // Add to slider images array
      setSliderImages([...sliderImages, imageUrl]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.dismiss();
      toast.success('Slider image uploaded successfully');
    } catch (error) {
      console.error('Error uploading slider image:', error);
      toast.dismiss();
      toast.error('Failed to upload slider image');
    }
  };

  const addSliderImageUrl = () => {
    if (!newSliderImage) return;
    
    setSliderImages([...sliderImages, newSliderImage]);
    setNewSliderImage('');
  };

  const removeSliderImage = (index: number) => {
    const updatedImages = [...sliderImages];
    updatedImages.splice(index, 1);
    setSliderImages(updatedImages);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...settings,
        heroSliderImages: sliderImages
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }
      
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-500">Error loading settings. Please try again.</p>
        <button
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold">Website Settings</h1>
        <p className="text-gray-600 mt-1">Customize your website appearance and configuration</p>
      </div>

      <div className="p-6 grid grid-cols-1 gap-8">
        {/* General Settings */}
        <section>
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Text
              </label>
              <input
                type="text"
                name="footerText"
                value={settings.footerText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-lg font-medium mb-4">Theme Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleColorChange}
                  className="h-10 w-10 mr-2"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={handleInputChange}
                  name="primaryColor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleColorChange}
                  className="h-10 w-10 mr-2"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={handleInputChange}
                  name="secondaryColor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Logo & Favicon */}
        <section>
          <h2 className="text-lg font-medium mb-4">Logo & Favicon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Image
              </label>
              {settings.logoUrl && (
                <div className="mb-2">
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="h-16 object-contain bg-gray-100 p-2 rounded"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logoUrl')}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon
              </label>
              {settings.faviconUrl && (
                <div className="mb-2">
                  <img 
                    src={settings.faviconUrl} 
                    alt="Favicon" 
                    className="h-16 w-16 object-contain bg-gray-100 p-2 rounded"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 32x32px, PNG or ICO format
              </p>
            </div>
          </div>
        </section>

        {/* Hero Slider Images */}
        <section>
          <h2 className="text-lg font-medium mb-4">Hero Slider Images</h2>
          
          {/* Current Slider Images */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Slider Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sliderImages.length === 0 ? (
                <p className="text-gray-500">No slider images added yet</p>
              ) : (
                sliderImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={imageUrl} 
                      alt={`Slider ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeSliderImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {imageUrl.split('/').pop()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Add New Slider Image */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Slider Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Upload Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleSliderImageUpload}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Or Enter Image URL</label>
                <div className="flex">
                  <input
                    type="text"
                    value={newSliderImage}
                    onChange={(e) => setNewSliderImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSliderImageUrl}
                    disabled={!newSliderImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Images */}
        <section>
          <h2 className="text-lg font-medium mb-4">Category Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categoryOptions.map((category) => (
              <div key={category.id} className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {category.label}
                </h3>
                
                {settings.categoryImages?.[category.id] && (
                  <div className="mb-2">
                    <img 
                      src={settings.categoryImages[category.id]} 
                      alt={category.label} 
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    try {
                      toast.loading(`Uploading ${category.label} image...`);
                      const fileName = `category_${category.id}_${Date.now()}_${file.name}`;
                      const imageUrl = await uploadImage(file, fileName);
                      handleCategoryImageChange(category.id, imageUrl);
                      toast.dismiss();
                      toast.success('Image uploaded successfully');
                    } catch (error) {
                      console.error('Error uploading category image:', error);
                      toast.dismiss();
                      toast.error('Failed to upload image');
                    }
                  }}
                  className="w-full mt-2"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-lg font-medium mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  placeholder={`https://${platform}.com/yourhandle`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
} 