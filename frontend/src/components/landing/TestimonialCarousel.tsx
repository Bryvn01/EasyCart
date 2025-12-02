import React, { useState, useEffect, useCallback } from 'react';
import { FiStar, FiCheckCircle } from 'react-icons/fi';

export interface Testimonial {
  name: string;
  text: string;
  date: string;
  avatar?: string;
  rating: number;
  isVerified?: boolean;
}

const testimonials: Testimonial[] = [
  { name: 'Jane Doe', text: 'Amazing service and fast delivery!', date: '2024-10-01', avatar: '', rating: 5, isVerified: true },
  { name: 'John Smith', text: 'Great selection and prices. Will shop again!', date: '2024-09-15', avatar: '', rating: 5, isVerified: true },
  { name: 'Mary W.', text: 'Customer support was very helpful.', date: '2024-08-20', avatar: '', rating: 5, isVerified: true },
];

const TestimonialCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate testimonials
  const nextTestimonial = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextTestimonial]);

  return (
    <section aria-labelledby="testimonial-heading" className="bg-white py-12 px-4 rounded-lg shadow-md max-w-4xl mx-auto mb-12">
      <h2 id="testimonial-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">What Our Customers Say</h2>
      <div 
        className="relative overflow-hidden min-h-[280px]" 
        onMouseEnter={() => setIsPaused(true)} 
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-live="polite"
        aria-atomic="true"
      >
        {testimonials.map((t, i) => (
          <div
            key={`${t.name}-${t.date}`}
            className={`flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out absolute inset-0 ${
              i === active 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-full pointer-events-none'
            }`}
            tabIndex={i === active ? 0 : -1}
            role="group"
            aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
            aria-hidden={i !== active}
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-gray-400 text-2xl" aria-hidden="true">
              {t.name.charAt(0)}
            </div>
            <span className="text-lg font-semibold text-gray-900 mb-1">{t.name}</span>
            {t.isVerified && (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm mb-1">
                <FiCheckCircle aria-hidden="true" /> Verified Purchase
              </span>
            )}
            <span className="text-sm text-gray-500 mb-2">{t.date}</span>
            <p className="text-gray-700 text-base mb-2 text-center max-w-md">"{t.text}"</p>
            <div className="flex gap-1 mb-2" role="img" aria-label={`Rating: ${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, star) => (
                <FiStar 
                  key={star} 
                  aria-hidden="true" 
                  className={`w-5 h-5 ${star < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full ${i === active ? 'bg-primary-500' : 'bg-gray-300'} hover:bg-primary-500 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => setActive(i)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
