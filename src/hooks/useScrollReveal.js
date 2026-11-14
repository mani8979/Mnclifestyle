import { useState, useEffect, useRef } from 'react';

/**
 * Custom React hook for high-performance scroll-triggered fade-in animations.
 * Built on the native IntersectionObserver API with complete cross-browser fallbacks
 * and accessibility support for prefers-reduced-motion.
 *
 * @param {Object} options
 * @param {number} [options.threshold=0.1] - Percentage of element visibility required to trigger.
 * @param {string} [options.rootMargin='0px 0px -40px 0px'] - Viewport boundary offset.
 * @param {number} [options.delay=0] - Delay in milliseconds before animation starts.
 * @param {number} [options.duration=750] - Animation duration in milliseconds.
 * @param {number} [options.distance=20] - Initial vertical displacement in pixels.
 * @param {boolean} [options.once=true] - Whether to unobserve after the first reveal.
 * @returns {Object} { ref, isVisible, style }
 */
export function useScrollReveal({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
  duration = 750,
  distance = 20,
  once = true
} = {}) {
  // Check browser capability and user accessibility preferences synchronously
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasIntersectionObserver =
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window;

  // Fallback: If no IntersectionObserver or reduced motion is requested, show immediately
  const shouldRevealImmediately = !hasIntersectionObserver || isReducedMotion;

  const [isVisible, setIsVisible] = useState(shouldRevealImmediately);
  const elementRef = useRef(null);

  useEffect(() => {
    if (shouldRevealImmediately) {
      setIsVisible(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    // Handle elements already in the initial viewport
    const rect = node.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      setIsVisible(true);
      if (once) return;
    }

    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (once && observer) {
                observer.unobserve(entry.target);
              }
            } else if (!once) {
              setIsVisible(false);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
    } catch (err) {
      // In case of any unexpected observer error, fail open
      console.warn('IntersectionObserver error:', err);
      setIsVisible(true);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin, once, shouldRevealImmediately]);

  // Luxury easing curve specified: cubic-bezier(0.22, 1, 0.36, 1)
  const style = isReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform'
      };

  return { ref: elementRef, isVisible, style };
}

export default useScrollReveal;
