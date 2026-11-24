'use client';
import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Reusable ScrollReveal wrapper component for elegant, hardware-accelerated fade-in-up reveals.
 *
 * @param {Object} props
 * @param {React.ElementType} [props.as='div'] - Element type to render ('div', 'section', etc.)
 * @param {number} [props.delay=0] - Base delay in ms
 * @param {number} [props.staggerIndex] - Item index for auto-calculating subtle staggered delay (70-100ms per item)
 * @param {number} [props.duration=750] - Animation duration in ms (600-800ms)
 * @param {number} [props.distance=20] - Vertical displacement in px (20px)
 * @param {number} [props.threshold=0.1] - IntersectionObserver threshold
 * @param {string} [props.rootMargin='0px 0px -40px 0px'] - IntersectionObserver root margin
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style={}] - Additional inline styles
 * @param {React.ReactNode} props.children - Child elements
 */
export default function ScrollReveal({
  as: Component = 'div',
  delay = 0,
  staggerIndex,
  duration = 750,
  distance = 20,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  style: userStyle = {},
  children,
  ...rest
}) {
  // Compute stagger delay if staggerIndex is provided (e.g. 0ms, 80ms, 160ms, 240ms)
  // Capped at 280ms so users never wait excessively during deep grids
  const computedDelay =
    typeof staggerIndex === 'number'
      ? delay + (staggerIndex % 4) * 80
      : delay;

  const { ref, isVisible, style: revealStyle } = useScrollReveal({
    threshold,
    rootMargin,
    delay: computedDelay,
    duration,
    distance,
    once: true
  });

  return (
    <Component
      ref={ref}
      className={`reveal-wrapper ${isVisible ? 'is-revealed' : 'is-hidden'} ${className}`}
      style={{
        ...revealStyle,
        ...userStyle
      }}
      data-revealed={isVisible}
      {...rest}
    >
      {children}
    </Component>
  );
}
