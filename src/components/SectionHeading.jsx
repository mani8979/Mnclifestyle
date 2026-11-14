import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function SectionHeading({
  subtitle,
  title,
  description,
  linkText,
  linkTo,
  align = 'center', // 'center' or 'left'
  dark = false,
}) {
  const isCenter = align === 'center';

  return (
    <ScrollReveal
      className={`mb-6 sm:mb-8 md:mb-10 ${isCenter ? 'text-center max-w-3xl mx-auto' : 'flex flex-col md:flex-row md:items-end justify-between gap-6'}`}
      threshold={0.1}
      duration={650}
    >
      <div className={isCenter ? '' : 'max-w-2xl'}>
        {subtitle && (
          <span className={`text-[11px] md:text-xs font-semibold uppercase tracking-[0.25em] block mb-2.5 ${
            dark ? 'text-bronze-light' : 'text-bronze'
          }`}>
            {subtitle}
          </span>
        )}
        <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.15] ${
          dark ? 'text-white' : 'text-charcoal'
        }`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-3.5 text-sm sm:text-base leading-relaxed font-sans ${
            dark ? 'text-warmgrey-light' : 'text-warmgrey'
          }`}>
            {description}
          </p>
        )}
      </div>

      {linkText && linkTo && !isCenter && (
        <div className="flex-shrink-0">
          <Link
            to={linkTo}
            className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium group transition-colors pb-1 border-b ${
              dark 
                ? 'text-white border-white/40 hover:text-bronze-light hover:border-bronze-light' 
                : 'text-charcoal border-charcoal/30 hover:text-bronze hover:border-bronze'
            }`}
          >
            <span>{linkText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </ScrollReveal>
  );
}

