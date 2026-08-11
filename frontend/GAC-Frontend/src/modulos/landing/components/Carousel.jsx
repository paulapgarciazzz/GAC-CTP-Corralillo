import { useState, useEffect } from "react";

const Carousel = () => {
    const images = [
    "https://scontent.fsyq6-1.fna.fbcdn.net/v/t39.30808-6/710059187_1628590942603660_5414905977431291317_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1365&ctp=s2048x1365&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_ohc=oNIHGfE-8RQQ7kNvwHJ8mfs&_nc_oc=Adpuci9NXT2Uz_gppp7erSXy0jSP1ScweMq5gflRRJXGyPsCTphmt-H_9E--4l8r2S4&_nc_zt=23&_nc_ht=scontent.fsyq6-1.fna&_nc_gid=r2mwE2w97YFKDkJf0eI3BQ&_nc_ss=7b2a8&oh=00_AQGKorrTPenrdzQ_BwJSM24zYovOhHhovDMfCZeaDU7a-g&oe=6A803F3E",
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