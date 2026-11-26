import React from 'react';

/**
 * Renders heading text with a clean upright sans-serif ampersand (&)
 * instead of Playfair Display's calligraphic italic ampersand glyph.
 */
export default function FormattedTitle({ text }) {
  if (!text) return null;
  const str = String(text);
  if (!str.includes('&')) return str;

  const parts = str.split(/(&)/g);
  return parts.map((part, idx) =>
    part === '&' ? (
      <span key={idx} className="font-sans font-normal not-italic">
        &amp;
      </span>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
}
