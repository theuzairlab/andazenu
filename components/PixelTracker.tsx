'use client';

import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

const PixelTracker = () => {
  useEffect(() => {
    const pixelId = '1005322541746212';
    ReactPixel.init(pixelId);
    ReactPixel.pageView();
  }, []);
  
  return null;
};

export default PixelTracker; 