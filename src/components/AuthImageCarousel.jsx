import { useState, useEffect } from "react";

const AuthImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Images from public/authImages folder
  const images = [
    "/authImages/1 (1).jpg",
    "/authImages/1 (2).jpg",
    "/authImages/1 (3).jpg",
    "/authImages/1 (4).jpg",
    "/authImages/1 (5).jpg",
    "/authImages/1 (1) - Copy.jpg",
    "/authImages/1 (2) - Copy.jpg",
    "/authImages/1 (3) - Copy.jpg",
    "/authImages/1 (4) - Copy.jpg",
    "/authImages/1 (5) - Copy.jpg",
  ];

  // Preload images
  useEffect(() => {
    const imagePromises = images.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch((error) => {
        console.error("Error loading images:", error);
        setImagesLoaded(true); // Still show carousel even if some images fail
      });
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length, imagesLoaded]);

  if (!imagesLoaded) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Auth ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center',
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0
          }}
          onError={(e) => {
            console.error(`Failed to load image: ${image}`);
            e.target.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
};

export default AuthImageCarousel;

