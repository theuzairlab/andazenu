'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/lib/imagekit';

type WebsiteSettings = {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroSliderImages: string[] | null;
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

      // Set last saved time from updatedAt if available
      if (data.updatedAt) {
        setLastSaved(new Date(data.updatedAt));
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
      [name]: value,
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    if (!settings) return;

    const updatedSocialLinks = {
      ...(settings.socialLinks || {}),
      [platform]: value,
    };

    setSettings({
      ...settings,
      socialLinks: updatedSocialLinks,
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
        [field]: imageUrl,
      });

      toast.dismiss();
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      toast.error('Failed to upload image');
    }
  };

  const handleAddSliderImage = async () => {
    if (!newSliderImage.trim() || !settings) return;

    // Check if it's a valid URL
    try {
      new URL(newSliderImage);
    } catch (e) {
      toast.error('Please enter a valid URL');
      return;
    }

    setSliderImages([...sliderImages, newSliderImage]);
    setNewSliderImage('');
  };

  const handleRemoveSliderImage = (index: number) => {
    const updatedImages = [...sliderImages];
    updatedImages.splice(index, 1);
    setSliderImages(updatedImages);
  };

  const handleSliderImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading slider image...');
      const fileName = `slider_${Date.now()}_${file.name}`;

      // Upload the file to ImageKit
      const imageUrl = await uploadImage(file, fileName);

      // Add to slider images
      setSliderImages([...sliderImages, imageUrl]);

      // Clear the file input
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

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);

      // Prepare data for submission
      const dataToSubmit = {
        ...settings,
        heroSliderImages: sliderImages,
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

      // Update settings and last saved time
      setSettings(data.settings);
      setLastSaved(new Date());

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
      <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Website Settings</h1>
          <p className="text-gray-600 mt-1">Customize your website appearance and configuration</p>
          {lastSaved && (
            <p className="text-xs text-gray-500 mt-1">Last saved: {lastSaved.toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 gap-8">
        {/* General Settings */}
        <section>
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
              <input
                type="text"
                name="footerText"
                value={settings.footerText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@andazenu.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
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

        {/* Logo & Favicon */}
        <section>
          <h2 className="text-lg font-medium mb-4">Logo & Favicon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
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
                onChange={e => handleFileUpload(e, 'logoUrl')}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 500x110px, PNG or ICO format
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
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
                onChange={e => handleFileUpload(e, 'faviconUrl')}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px, PNG or ICO format</p>
            </div>
          </div>
        </section>

        {/* Hero Slider Images */}
        <section>
          <h2 className="text-lg font-medium mb-4">Hero Slider Images</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload New Slider Image
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleSliderImageUpload}
                ref={fileInputRef}
                className="flex-grow"
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-2">
                Recommended: 1920x800px, JPG or PNG format
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Or Add Image URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={newSliderImage}
                onChange={e => setNewSliderImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSliderImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {sliderImages.map((imageUrl, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={imageUrl}
                    alt={`Slider image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSliderImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 focus:outline-none"
                    aria-label="Remove image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate">{imageUrl}</p>
                </div>
              </div>
            ))}
          </div>

          {sliderImages.length === 0 && (
            <p className="text-gray-500">No slider images added yet.</p>
          )}
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-lg font-medium mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['facebook', 'instagram', 'tiktok', 'youtube'].map(platform => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.[platform] || ''}
                  onChange={e => handleSocialLinkChange(platform, e.target.value)}
                  placeholder={`https://${platform}.com/andazenu`}
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
