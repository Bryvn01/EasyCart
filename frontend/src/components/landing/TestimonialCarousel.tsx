
import React, { useState } from 'react';

export interface Testimonial {
  name: string;
  text: string;
  date: string;
  avatar?: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  { name: 'Jane Doe', text: 'Amazing service and fast delivery!', date: '2025-10-01', avatar: '', rating: 5 },
  { name: 'John Smith', text: 'Great selection and prices. Will shop again!', date: '2025-09-15', avatar: '', rating: 5 },
  { name: 'Mary W.', text: 'Customer support was very helpful.', date: '2025-08-20', avatar: '', rating: 5 },
];

const TestimonialCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  return (
    <section aria-labelledby="testimonial-heading" className="bg-white py-12 px-4 rounded-lg shadow-md max-w-4xl mx-auto mb-12">
      <h2 id="testimonial-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">What Our Customers Say</h2>
      <div className="relative overflow-hidden" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center p-6 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            tabIndex={i === active ? 0 : -1}
            role="group"
            aria-label={`Testimonial ${i + 1}`}
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 mb-2" />
            <span className="text-lg font-semibold text-gray-900 mb-1">{t.name}</span>
            <span className="text-sm text-gray-500 mb-2">{t.date}</span>
            <p className="text-gray-700 text-base mb-2">{t.text}</p>
            <div className="flex gap-1 mb-2" aria-label={`Rating: ${t.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, star) => (
                <span key={star} aria-hidden="true" className={star < t.rating ? 'text-yellow-400' : 'text-gray-300'}>605</span>
              ))}
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full ${i === active ? 'bg-primary-500' : 'bg-gray-300'} hover:bg-primary-500 transition-colors`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={()=>setActive(i)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
