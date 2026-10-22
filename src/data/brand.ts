// J & A POOLS LLC — single source of truth.
// Grounded in owner-supplied service board, photos, reviews, and verified Phoenix AZ profiles.

export const BRAND = {
  name: 'J & A POOLS LLC',
  owner: 'Joe C. Campos',
  tagline: 'Pool Service • Cleaning • Repairs • Maintenance',
  positioning: 'Clean, clear pools. Happier days.',
  primaryLocation: 'Phoenix, Arizona 85031',
  serviceArea: 'Phoenix and surrounding Valley areas',
  businessTypes: 'Swimming Pools · Pool Service (Residential & Commercial)',
  accreditation: 'Better Business Bureau (BBB) Accredited Business',
  bbbRating: 'A+',
  accreditedSince: '2023',
  bbbUrl: 'https://www.bbb.org/us/az/phoenix/profile/swimming-pools/j-a-pools-llc-1126-1000113314',
  websiteUrl: 'https://www.ethicalcommunity.org/jandapools',
  googleShareUrl1: 'https://share.google/9Qjen79ZDflyMr2ye',
  googleShareUrl2: 'https://share.google/pgsInM5vSJPAXc5w8',
  phoneDisplay: '480-688-7254',
  phoneE164: '+14806887254',
  zipCode: '85031',
};

export const TEL_LINK = `tel:${BRAND.phoneE164}`;

export const buildSmsLink = (body: string) =>
  `sms:${BRAND.phoneE164}?body=${encodeURIComponent(body)}`;

const B = import.meta.env.BASE_URL;

// Owner-supplied J & A Pools LLC brand & field imagery
export const IMAGES = {
  logoPng: `${B}assets/Japools.png`,
  logoJpg: `${B}assets/ja_logo.jpg`,
  monogram: `${B}assets/Japools.png`,
  heroTriptych: `${B}assets/cloud_reflection_pool.jpg`,
  poster: `${B}assets/service_overview_board.jpg`,
  leatherBanner: `${B}assets/before_after.jpg`,
  artistCutout: `${B}assets/team_cleaning_wide.jpg`,
  headshot: `${B}assets/team_cleaning_aqua.jpg`,
  lifestyle: `${B}assets/cloud_reflection_pool.jpg`,
  beforePool: `${B}assets/before_pool.jpg`,
  afterPool: `${B}assets/after_pool.jpg`,
  yelpReviews: `${B}assets/yelp_reviews.jpg`,
  og: `${B}assets/service_overview_board.jpg`,
  fallbackSilk: `${B}assets/cloud_reflection_pool.jpg`,
};

export interface CoreServicePillar {
  id: string;
  title: string;
  subtitle: string;
  icon: 'net' | 'flask' | 'filter' | 'wrench' | 'gear' | 'calendar';
}

export const CORE_PILLARS: CoreServicePillar[] = [
  {
    id: 'pool-cleaning',
    title: 'Pool Cleaning',
    subtitle: 'Skimming, vacuuming, brushing, filter care',
    icon: 'net',
  },
  {
    id: 'water-balancing',
    title: 'Water Balancing',
    subtitle: 'Safe, clear, comfortable water',
    icon: 'flask',
  },
  {
    id: 'filter-pump-care',
    title: 'Filter & Pump Care',
    subtitle: 'Inspection, cleaning, replacements',
    icon: 'filter',
  },
  {
    id: 'repairs',
    title: 'Repairs',
    subtitle: 'Leaks, equipment, plumbing',
    icon: 'wrench',
  },
  {
    id: 'equipment-upgrades',
    title: 'Equipment Upgrades',
    subtitle: 'Pumps, filters, automation',
    icon: 'gear',
  },
  {
    id: 'scheduled-service',
    title: 'Scheduled Service',
    subtitle: 'Weekly, bi-weekly, or custom plans',
    icon: 'calendar',
  },
];

export interface ReviewItem {
  id: string;
  author: string;
  source: string;
  rating: number;
  dateLabel: string;
  quote: string;
  url: string;
}

export const REVIEWS: ReviewItem[] = [
  {
    id: 'julius-d',
    author: 'Julius D.',
    source: 'Yelp Verified Review',
    rating: 5,
    dateLabel: '5.0 ★ · Phoenix, AZ',
    quote: 'Really saved my summer and my pool’s life. These guys show up on time and communicate effectively. Thanks a ton guys.',
    url: BRAND.googleShareUrl1,
  },
  {
    id: 'deb-f',
    author: 'Deb F.',
    source: 'Yelp Verified Review',
    rating: 5,
    dateLabel: '5.0 ★ · Phoenix, AZ',
    quote: 'Love Joe! Does a good job and communication is great.',
    url: BRAND.googleShareUrl2,
  },
  {
    id: 'shannon-r',
    author: 'Shannon R.',
    source: 'BBB Customer Review',
    rating: 5,
    dateLabel: '5.0 ★ · BBB Accredited A+',
    quote: 'Great service. Had multiple pool services over the years and they’ve had our pool in the best condition.',
    url: BRAND.bbbUrl,
  },
  {
    id: 'gail-g',
    author: 'Gail G.',
    source: 'BBB Customer Review',
    rating: 5,
    dateLabel: '5.0 ★ · BBB Accredited A+',
    quote: 'Outstanding service! Reliable, our pool has never looked better!',
    url: BRAND.bbbUrl,
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const QUICK_QA: FaqItem[] = [
  {
    question: 'How often should my pool be serviced?',
    answer: 'Most pools do well with weekly or bi-weekly service, depending on usage, trees, and weather.',
  },
  {
    question: 'Do you service residential and commercial pools?',
    answer: 'Yes, we service both residential and commercial pools in the Phoenix area.',
  },
  {
    question: 'What areas do you service?',
    answer: 'We are based in Phoenix, AZ 85031 and service surrounding areas.',
  },
  {
    question: 'How do I schedule service?',
    answer: "Call 480-688-7254 or use the Schedule Your Pool Service form and we'll get you set up quickly.",
  },
];

export interface DirectoryItem {
  id: string;
  brand: string;
  name: string;
  description: string;
  href: string;
  cta: string;
}

export const DIRECTORY_LINKS: DirectoryItem[] = [
  {
    id: 'bbb-profile',
    brand: 'Better Business Bureau',
    name: 'J & A Pools LLC — BBB A+ Accredited Business',
    description: 'BBB Accredited since July 2023 with an A+ rating for Swimming Pools and Pool Service in Phoenix, AZ 85031.',
    href: BRAND.bbbUrl,
    cta: 'View BBB Business Review',
  },
  {
    id: 'ethical-community',
    brand: 'Ethical Community',
    name: 'Official Ethical Community Profile',
    description: 'Verified Phoenix business listing highlighting our commitment to honest pricing, reliable scheduling, and clear communication.',
    href: BRAND.websiteUrl,
    cta: 'Visit EthicalCommunity.org',
  },
  {
    id: 'google-share-1',
    brand: 'Google Business Profile',
    name: 'J & A Pools LLC — Phoenix Service Listing',
    description: 'Find directions, service area coverage across Phoenix & Mesa, and customer reviews on Google.',
    href: BRAND.googleShareUrl1,
    cta: 'Open Google Listing',
  },
  {
    id: 'google-share-2',
    brand: 'Google Maps & Reviews',
    name: 'J & A Pools LLC — Direct Share Link',
    description: 'Share or bookmark our official Google Business card for fast pool service dispatch in the Valley.',
    href: BRAND.googleShareUrl2,
    cta: 'Open Google Card',
  },
  {
    id: 'direct-sms',
    brand: 'Fast Text Dispatch',
    name: 'Text 480-688-7254 to Schedule Service',
    description: 'Send a photo of your pool or equipment pad directly to Joe and the J & A Pools team for scheduling.',
    href: buildSmsLink("Hi J & A Pools! I'd like to schedule pool service in the Phoenix area."),
    cta: 'Text 480-688-7254 to Schedule',
  },
  {
    id: 'direct-call',
    brand: 'Direct Phone Line',
    name: 'Call 480-688-7254',
    description: 'Speak directly with J & A Pools LLC about weekly maintenance, green-to-clean recovery, or equipment repairs.',
    href: TEL_LINK,
    cta: 'Call 480-688-7254',
  },
];

// About J & A Pools LLC
export const ABOUT = {
  quote: 'Clean, clear pools. Happier days.',
  accolade: 'BBB Accredited Business · A+ Rating · Serving Phoenix, AZ 85031 & Surrounding Areas',
  story: [
    {
      text: 'In the Arizona heat, your pool should be the best part of your day—not another chore on your weekend list.',
    },
    {
      text: 'Founded in Phoenix by owner Joe C. Campos, J & A Pools LLC delivers dependable, detail-driven swimming pool cleaning, water balancing, filter and pump care, and equipment repairs for both residential homes and commercial properties.',
    },
    {
      text: 'We show up on time, communicate clearly, and keep your water crystal clear.',
      pull: true,
    },
    {
      text: 'Whether your backyard pool needs consistent weekly or bi-weekly scheduled maintenance, a seasonal filter and pump inspection, plumbing or leak repairs, or a complete Green-to-Clean transformation, our technicians treat your pool like our own.',
    },
    {
      text: 'Every visit covers the essentials that protect your swimmers and your equipment:',
    },
    {
      text: 'Balanced chemistry, spotless surfaces, healthy circulation, and honest updates.',
      pull: true,
    },
    {
      text: 'Based in Phoenix, AZ 85031 and servicing surrounding Valley communities, we make getting started effortless—just call or text 480-688-7254 and we will get you set up quickly.',
    },
  ] as { text: string; pull?: boolean }[],
};

export type ServiceId = 'weekly-service' | 'biweekly-service' | 'repair-upgrade' | 'green-to-clean';

export interface Service {
  id: ServiceId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  onSite: boolean;
  perPerson?: boolean;
  minPeople?: number;
}

export const SERVICES: Service[] = [
  {
    id: 'weekly-service',
    name: 'Weekly Scheduled Service',
    price: 0,
    priceLabel: 'Weekly Plan',
    description: 'Skimming, vacuuming, brushing, baskets, filter care & full water balancing every week.',
    onSite: true,
  },
  {
    id: 'biweekly-service',
    name: 'Bi-Weekly / Custom Plan',
    price: 0,
    priceLabel: 'Bi-Weekly / Custom',
    description: 'Tailored bi-weekly or custom schedule based on pool usage, trees, and weather.',
    onSite: true,
  },
  {
    id: 'repair-upgrade',
    name: 'Filter, Pump & Equipment Care',
    price: 0,
    priceLabel: 'Inspection & Repair',
    description: 'Filter cleaning, leak & plumbing repairs, variable-speed pumps, filters, and automation upgrades.',
    onSite: true,
  },
  {
    id: 'green-to-clean',
    name: 'Green-to-Clean Recovery',
    price: 0,
    priceLabel: 'Full Restoration',
    description: 'Complete algae eradication, chemical shock, brushing, filter servicing & crystal-clear water recovery.',
    onSite: true,
  },
];

export const getService = (id: ServiceId) => SERVICES.find((s) => s.id === id) ?? SERVICES[0];

export const NAV_LINKS = [
  { id: 'about', label: 'About & Results' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
  { id: 'retail', label: 'Quick Q&A' },
];

export const PAYMENT_LABELS: Record<string, string> = {
  not_collected: 'Quote requested',
  pending: 'Inspection scheduled',
  card_on_file: 'Plan active',
  charged: 'Paid',
  failed: 'Follow up needed',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New Request',
  contacted: 'Contacted',
  confirmed: 'Scheduled',
  declined: 'Declined',
  completed: 'Completed',
};
