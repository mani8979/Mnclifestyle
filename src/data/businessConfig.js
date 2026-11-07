/**
 * MNC LIFESTYLE — Centralized Business Content Configuration
 * 
 * All commercial claims, warranties, delivery lead times, and showroom details
 * are centralized here so they can be reviewed and edited by the client.
 */

export const businessConfig = {
  brandName: 'MNC LIFESTYLE',
  tagline: 'Furniture & Contemporary Living',
  
  // Delivery & Service Claims
  delivery: {
    badge: 'White-Glove Placement',
    shortNote: 'White-Glove In-Home Placement & Inspection Available',
    standardLeadTime: 'Scheduled In-Home Delivery (Timeline confirmed upon consultation)',
    description: 'Two-person placement, leveling, and packaging removal coordinated by your concierge.',
    complimentaryNote: 'Complimentary on qualifying domestic curated suites',
  },

  // Warranty & Craftsmanship
  warranty: {
    headline: 'Structural Craftsmanship Commitment',
    durationLabel: 'Multi-Year Structural Guarantee',
    framing: 'Kiln-dried hardwood frames and structural joinery protected under our craftsmanship policy.',
    details: 'Covers mortise-and-tenon structural frame stability and internal suspension under normal residential use.',
  },

  // Sustainable Materials
  sustainability: {
    headline: 'Mindfully Sourced Hardwoods',
    claim: 'Responsibly Harvested European Oak & American Walnut',
    certificationNote: 'Sourced from certified managed timberlands with low-VOC natural plant oil finishes.',
  },

  // Showrooms & Concierge
  concierge: {
    hours: 'Monday – Saturday: 9:00 AM – 6:00 PM',
    status: 'Viewing by Private Appointment',
    showrooms: [
      { name: 'Flagship Design Gallery', location: 'Premier Design District, Suite 400', contact: 'Appointments coordinated by client concierge' },
      { name: 'Mayfair Atelier', location: 'Central Pavilions', contact: 'Dedicated Senior Interior Designer' },
      { name: 'West Coast Studio', location: 'Beverly Hills Design Corridor', contact: 'Material Swatch Concierge on site' }
    ]
  },

  // Disclaimer for presentation version
  disclaimer: 'Demonstration catalog for MNC Lifestyle. Final delivery schedules, fabric options, and bespoke specifications are finalized with your dedicated design consultant.'
};

