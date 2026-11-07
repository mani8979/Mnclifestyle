import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import ShopTheLook from '../components/ShopTheLook';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { collections } from '../data/collections';
import { businessConfig } from '../data/businessConfig';
import { ArrowRight, Compass, ShieldCheck, Sparkles, Feather, LayoutGrid, Hourglass, Sliders } from 'lucide-react';

export default function Home() {
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const featuredPieces = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* A. Hero Section */}
      <Hero />

      {/* D. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Architectural Spaces"
          title="Shop by Category"
          description="Explore thoughtfully proportioned furniture systems designed to bring cohesion, warmth, and enduring grace to every room."
          linkText="View All Categories"
          linkTo="/shop"
          align="left"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* E. Featured Collections (Editorial Asymmetrical Layout) */}
      <section className="bg-beige-200/50 py-20 sm:py-28 border-y border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Curated Living Sets"
            title="Signature Collections"
            description="Our master design collections balance harmonious palettes, unadorned timber geometries, and tactile textures."
            align="center"
          />

          <div className="space-y-16 lg:space-y-24">
            {collections.slice(0, 2).map((col, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={col.id}
                  className={`flex flex-col ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } gap-8 lg:gap-16 items-center`}
                >
                  {/* Large Editorial Image */}
                  <div className="w-full lg:w-3/5 overflow-hidden rounded-2xl shadow-luxury group">
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-beige-300">
                      <img
                        src={col.image}
                        alt={col.title}
                        className="w-full h-full object-cover luxury-image-zoom"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-espresso/80 backdrop-blur-sm text-ivory-100 text-xs uppercase tracking-widest px-3 py-1 rounded">
                        {col.piecesCount}
                      </div>
                    </div>
                  </div>

                  {/* Narrative Block */}
                  <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze mb-2">
                      {col.subtitle}
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight mb-4">
                      {col.title}
                    </h3>
                    <p className="text-sm sm:text-base text-warmgrey leading-relaxed mb-6 font-sans">
                      {col.description}
                    </p>

                    {/* Materials preview */}
                    <div className="mb-8 pt-4 border-t border-beige-300">
                      <span className="text-xs uppercase tracking-wider text-charcoal font-semibold block mb-2">
                        Material Palette:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {col.materials.map((mat) => (
                          <span
                            key={mat}
                            className="text-xs bg-white text-charcoal-700 px-3 py-1 rounded-full border border-beige-300 shadow-2xs"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Link
                        to={`/category/${col.category}`}
                        className="inline-flex items-center gap-3 px-6 py-3.5 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors shadow-soft"
                      >
                        <span>Explore This Set</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-charcoal hover:text-bronze transition-colors pb-1 border-b border-charcoal/40 hover:border-bronze"
            >
              <span>View All Curated Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* F. Bestselling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Celebrated Works"
          title="Bestselling Furniture"
          description="Explore our most cherished pieces, refined through continuous client dialogue and handcrafted with timeless integrity."
          linkText="View Complete Collection"
          linkTo="/shop"
          align="left"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Shoppable Living Room Atmosphere */}
      <ShopTheLook />

      {/* G. Lifestyle / Brand Experience Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-espresso text-ivory-100 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* Left Content Column */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-bronze-light mb-3 block">
                The MNC Lifestyle Ethos
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] text-white mb-6">
                More Than Furniture.{' '}
                <span className="block font-light italic text-bronze-light">
                  A Way of Living.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-warmgrey-light leading-relaxed mb-6 font-sans">
                Bring together comfort, thoughtful design and timeless elegance with furniture that makes every space feel like your own.
              </p>
              <p className="text-xs sm:text-sm text-warmgrey-light/90 leading-relaxed mb-8 font-sans">
                True luxury is never loud. It lives in the weight of a solid timber table, the quiet glide of dovetailed drawers, and fabrics that grow softer with years of memory-making.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 mb-8">
                <div>
                  <h4 className="font-serif text-xl sm:text-2xl font-light text-white">Artisan</h4>
                  <p className="text-xs text-warmgrey-light uppercase tracking-wider mt-1">Hand-Finished Joinery</p>
                </div>
                <div>
                  <h4 className="font-serif text-xl sm:text-2xl font-light text-white">Mindful</h4>
                  <p className="text-xs text-warmgrey-light uppercase tracking-wider mt-1">Responsible Sourcing</p>
                </div>
              </div>

              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-bronze text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze-dark transition-colors shadow-soft"
                >
                  <span>Our Heritage & Craftsmanship</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Photography Column */}
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[440px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
                alt="MNC Lifestyle warm architectural living space"
                className="w-full h-full object-cover object-center brightness-95"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-espresso via-transparent to-transparent opacity-80 lg:opacity-60" />
            </div>

          </div>
        </div>
      </section>

      {/* H. Why Choose MNC Lifestyle? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Distinction in Detail"
          title="Why Choose MNC Lifestyle?"
          description="Every piece we create is anchored in thoughtful principles designed to stand apart from mass-produced trends."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              Thoughtful Designs
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              Every curve, bevel, and proportion is balanced for spatial harmony, creating pieces that ground the room without overwhelming it.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <LayoutGrid className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              Modern Aesthetics
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              Clean contemporary lines inspired by warm minimalism, mid-century Scandinavian simplicity, and Italian sculptural form.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <Feather className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              Comfort-Focused Living
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              Luxury is sterile without comfort. Multi-layer memory foam, natural down, and ergonomic contours ensure restorative ease.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <Hourglass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              Timeless Style
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              We reject fast furniture fads. Our pieces age with grace, acquiring a warm, rich patina that enriches your home for decades.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <Sliders className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              Personalized Spaces
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              Complimentary design concierge services to help select fabrics, timber species, and scale layouts to your exact floor plan.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-beige-300 shadow-soft hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-beige-200/80 flex items-center justify-center text-bronze mb-5">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2.5">
              {businessConfig.warranty.headline}
            </h3>
            <p className="text-xs sm:text-sm text-warmgrey leading-relaxed">
              {businessConfig.warranty.framing}
            </p>
          </div>
        </div>
      </section>

      {/* I. Interior Inspiration (Interactive Editorial Gallery) */}
      <section className="bg-ivory py-16 border-t border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Lookbook & Atmospheres"
            title="Interior Inspiration"
            description="Explore residences curated with MNC Lifestyle furnishings — where organic textures and architectural silhouettes shape everyday living."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large feature photo - Living Room */}
            <Link
              to="/category/living-room"
              aria-label="Explore Living Room Collection inspired by The Highline Penthouse Residence"
              className="md:col-span-7 rounded-2xl overflow-hidden bg-beige-200 relative group aspect-[16/11] block shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Living Room Sanctuary"
                className="w-full h-full object-cover luxury-image-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-bronze-light font-semibold">Living Sanctuary</span>
                <h4 className="font-serif text-2xl text-white mt-1 group-hover:text-bronze-light transition-colors">
                  The Highline Penthouse Residence
                </h4>
                <p className="text-xs text-ivory-200 mt-1">Featuring the Aura Curved Bouclé Sofa and Kanso Travertine Table</p>
                <div className="inline-flex items-center gap-1.5 text-xs text-bronze-light font-semibold mt-3 group-hover:translate-x-1.5 transition-transform">
                  <span>Explore Living Room Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Vertical right side - Bedroom */}
            <Link
              to="/category/bedroom"
              aria-label="Explore Bedroom Collection inspired by Kyoto Oak Bed"
              className="md:col-span-5 rounded-2xl overflow-hidden bg-beige-200 relative group aspect-[4/5] md:aspect-auto block shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1000&q=80"
                alt="Minimalist Bedroom Retreat"
                className="w-full h-full object-cover luxury-image-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-bronze-light font-semibold">Bedroom Retreat</span>
                <h4 className="font-serif text-2xl text-white mt-1 group-hover:text-bronze-light transition-colors">
                  Kyoto Oak Bed in Warm Daylight
                </h4>
                <p className="text-xs text-ivory-200 mt-1">Harmonious joinery with natural Belgian linen headboards</p>
                <div className="inline-flex items-center gap-1.5 text-xs text-bronze-light font-semibold mt-3 group-hover:translate-x-1.5 transition-transform">
                  <span>Explore Bedroom Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Bottom 3 smaller editorial features */}
            {/* Dining */}
            <Link
              to="/category/dining"
              aria-label="Explore Dining Collection inspired by Dining Atelier"
              className="md:col-span-4 rounded-2xl overflow-hidden bg-beige-200 relative group aspect-[4/3] block shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"
                alt="Contemporary Dining Space"
                className="w-full h-full object-cover luxury-image-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-bronze-light font-semibold">Dining Atelier</span>
                <h4 className="font-serif text-lg text-white group-hover:text-bronze-light transition-colors">
                  Valen Oak Table & Celine Chairs
                </h4>
                <div className="inline-flex items-center gap-1 text-[11px] text-bronze-light font-medium mt-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore Dining</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>

            {/* Office */}
            <Link
              to="/category/office"
              aria-label="Explore Office Furniture inspired by Executive Study"
              className="md:col-span-4 rounded-2xl overflow-hidden bg-beige-200 relative group aspect-[4/3] block shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
                alt="Executive Study Room"
                className="w-full h-full object-cover luxury-image-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-bronze-light font-semibold">Executive Study</span>
                <h4 className="font-serif text-lg text-white group-hover:text-bronze-light transition-colors">
                  Atelier Desk in Bookmatched Walnut
                </h4>
                <div className="inline-flex items-center gap-1 text-[11px] text-bronze-light font-medium mt-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore Workspaces</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>

            {/* Storage */}
            <Link
              to="/category/storage"
              aria-label="Explore Storage Collection inspired by Paloma Credenza"
              className="md:col-span-4 rounded-2xl overflow-hidden bg-beige-200 relative group aspect-[4/3] block shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80"
                alt="Storage & Architectural Credenza"
                className="w-full h-full object-cover luxury-image-zoom"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-bronze-light font-semibold">Artisan Storage</span>
                <h4 className="font-serif text-lg text-white group-hover:text-bronze-light transition-colors">
                  Paloma Fluted Marble Credenza
                </h4>
                <div className="inline-flex items-center gap-1 text-[11px] text-bronze-light font-medium mt-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Explore Credenzas</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* J. Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-beige-300/60 border border-beige-300 p-8 sm:p-14 lg:p-20 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze mb-3 block">
              Start Your Project
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-medium tracking-tight mb-4 leading-tight">
              Let's Create a Space You'll Love.
            </h2>
            <p className="text-sm sm:text-base text-warmgrey mb-8 font-sans leading-relaxed">
              Find furniture that reflects your taste and transforms your everyday living. Our design consultants are available for personalized room styling, timber selections, and bespoke dimensions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-espresso text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-bronze transition-colors shadow-soft"
              >
                Get in Touch
              </Link>
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-white text-charcoal text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-beige-100 transition-colors border border-beige-300"
              >
                Browse All Pieces
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

