import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, style, placeholder = "📦" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return (
    <div ref={imgRef} className={className} style={style}>
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'opacity 0.3s', opacity: isLoaded ? 1 : 0.7
          }}
        />
      )}
      {(!isInView || hasError || !isLoaded) && (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#f3f4f6', fontSize: '2rem'
        }}>
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default LazyImage;