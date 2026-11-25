'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F0E8',
          color: '#211A15',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E9D8C5',
            borderRadius: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(33, 23, 16, 0.08)',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#855214',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            MNC LifeStyle
          </span>
          <h1 style={{ fontSize: '1.5rem', color: '#211710', fontWeight: 600, margin: '0 0 0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#766B61', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            An unexpected error occurred while rendering this page. Please try reloading.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#211710',
                color: '#F8F0E8',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/shop"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#FFFFFF',
                color: '#211710',
                border: '1px solid #E9D8C5',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Browse Catalog
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
