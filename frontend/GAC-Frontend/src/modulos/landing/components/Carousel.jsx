import { useState, useEffect } from "react";

const Carousel = () => {
    const images = [
    "https://nicoya.go.cr/img/news/detail/293_1_vistadelaembajadoradesuizaalctpdecorralillo.jpg",
    "https://vozdeguanacaste.com/wp-content/uploads/2018/01/dsc_0061-1024x683.jpg",
    "https://cloudfront-us-east-1.images.arcpublishing.com/gruponacion/JK64NJLWHVCZPCYVYPJVGOHQ34.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section id="inicio" className="relative w-full overflow-hidden group">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="w-full shrink-0">
            <img
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>
        ))}
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 
                   bg-black/40 hover:bg-black/60 text-white 
                   p-3 rounded-full transition-all duration-300
                  opacity-100
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Imagen anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Flecha derecha */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 
                   bg-black/40 hover:bg-black/60 text-white 
                   p-3 rounded-full transition-all duration-300
                   opacity-100
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Imagen siguiente"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default Carousel;