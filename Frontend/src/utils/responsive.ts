// Responsive utilities and constants

// Breakpoints following Tailwind CSS convention
export const BREAKPOINTS = {
  sm: 640,   // Small devices
  md: 768,   // Medium devices
  lg: 1024,  // Large devices
  xl: 1280,  // Extra large devices
  '2xl': 1536 // 2x Extra large devices
} as const;

// Hook to detect screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < BREAKPOINTS.md,
    isTablet: screenSize.width >= BREAKPOINTS.md && screenSize.width < BREAKPOINTS.lg,
    isDesktop: screenSize.width >= BREAKPOINTS.lg,
    isSmallScreen: screenSize.width < BREAKPOINTS.lg,
  };
};

// Responsive class generators
export const responsiveClasses = {
  // Grid responsivo
  grid: {
    mobile: "grid-cols-1",
    tablet: "sm:grid-cols-2 md:grid-cols-2",
    desktop: "lg:grid-cols-3 xl:grid-cols-4",
    full: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  },
  
  // Padding responsivo
  padding: {
    mobile: "p-2 sm:p-4",
    tablet: "p-4 md:p-6",
    desktop: "p-6 lg:p-8",
    full: "p-2 sm:p-4 md:p-6 lg:p-8"
  },
  
  // Margin responsivo
  margin: {
    mobile: "m-2 sm:m-4",
    tablet: "m-4 md:m-6", 
    desktop: "m-6 lg:m-8",
    full: "m-2 sm:m-4 md:m-6 lg:m-8"
  },

  // Text sizes responsivos
  text: {
    heading: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
    subheading: "text-base sm:text-lg md:text-xl",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm"
  },

  // Container responsivo
  container: {
    mobile: "max-w-full px-4",
    tablet: "max-w-4xl px-6 mx-auto",
    desktop: "max-w-7xl px-8 mx-auto",
    full: "max-w-full sm:max-w-4xl lg:max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto"
  },

  // Modal responsivo
  modal: {
    mobile: "w-full mx-4 max-h-[95vh]",
    tablet: "max-w-2xl w-full mx-4 max-h-[90vh]",
    desktop: "max-w-4xl w-full mx-4 max-h-[85vh]",
    full: "w-full max-w-2xl lg:max-w-4xl mx-4 max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh]"
  },

  // Flex responsivo
  flex: {
    mobile: "flex-col",
    tablet: "flex-col sm:flex-row",
    desktop: "flex-row",
    wrap: "flex-col sm:flex-row flex-wrap"
  }
};

// Utility para combinar classes condicionalmente
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// React import helper
import React from 'react';