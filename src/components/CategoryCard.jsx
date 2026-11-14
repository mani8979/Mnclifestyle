import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.id}`}
      className="group relative block rounded-2xl overflow-hidden bg-beige-200 border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-500"
    >
      {/* Category Image with smooth zoom */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover luxury-image-zoom brightness-[0.92] group-hover:brightness-100 transition-all duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent transition-opacity duration-300" />

        {/* Text Content */}
        <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end text-white">
          <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] text-bronze-light mb-1">
            {category.tagline}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white mb-2 group-hover:text-ivory-100 transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-ivory-200/90 line-clamp-2 leading-relaxed mb-4 max-w-xs font-sans">
            {category.description}
          </p>

          {/* Call to action */}
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-white group-hover:text-bronze-light transition-colors">
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

