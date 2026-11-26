import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '@/index.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#211710',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mnclifestyle.in'),
  title: {
    default: 'MNC LifeStyle — Premium Indian Furniture & Contemporary Living | Visakhapatnam',
    template: '%s | MNC LifeStyle Visakhapatnam',
  },
  description:
    'MNC LifeStyle offers luxury handcrafted solid teakwood and sheesham furniture in Visakhapatnam, Andhra Pradesh. Browse sofas, beds, dining sets, and recliners and enquire directly via WhatsApp or showroom consultation.',
  keywords: [
    'MNC LifeStyle',
    'luxury furniture Visakhapatnam',
    'teak wood furniture Andhra Pradesh',
    'designer sofa Vizag',
    'dining tables',
    'king beds',
    'WhatsApp furniture enquiry',
    'contemporary living India',
  ],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'MNC LifeStyle — Premium Furniture & Contemporary Living',
    description:
      'Elevate Your Space. Define Your Lifestyle. Solid Teak, Sheesham & Travertine furniture in Visakhapatnam, AP. Enquire directly via WhatsApp.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://mnclifestyle.in',
    siteName: 'MNC LifeStyle',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
        width: 1600,
        height: 1000,
        alt: 'MNC LifeStyle Living Room Suite',
      },
    ],
  },
};

const furnitureStoreJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  name: 'MNC LifeStyle Furniture',
  image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
  telephone: '+91-87909-43457',
  email: 'hello@mnclifestyle.in',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Visakhapatnam',
    addressLocality: 'Visakhapatnam',
    addressRegion: 'Andhra Pradesh',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.80386734008789,
    longitude: 83.2098159790039,
  },
  priceRange: '₹₹₹',
  currenciesAccepted: 'INR',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:30',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:30',
      closes: '18:00',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${playfair.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(furnitureStoreJsonLd) }}
        />
      </head>
      <body className="bg-[#F8F0E8] text-[#211A15] font-sans antialiased selection:bg-[#E9D8C5] selection:text-[#211710] min-h-screen">
        {children}
      </body>
    </html>
  );
}
