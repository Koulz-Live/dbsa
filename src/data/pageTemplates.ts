/**
 * Page Templates
 * Pre-built page templates using PageBuilder blocks
 */

import { PageBlock } from "../components/PageBuilder/types";

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: "marketing" | "corporate" | "content" | "other";
  thumbnail?: string;
  blocks: Omit<PageBlock, "id" | "order">[];
}

/**
 * Landing Page Template
 * Perfect for product launches, campaigns, or promotional pages
 */
export const landingPageTemplate: PageTemplate = {
  id: "landing-page",
  name: "Landing Page",
  description:
    "A conversion-focused landing page with hero, features, testimonials, and call-to-action sections",
  category: "marketing",
  blocks: [
    // Hero Section
    {
      type: "hero",
      data: {
        title: "Transform Your Business with Our Solution",
        subtitle:
          "Join thousands of companies already using our platform to achieve remarkable results",
        backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
        ctaText: "Get Started Free",
        ctaUrl: "#signup",
        alignment: "center",
      },
    },

    // Introduction Rich Text
    {
      type: "richtext",
      data: {
        content: `
          <div class="container py-5">
            <div class="row justify-content-center">
              <div class="col-lg-8 text-center">
                <h2 class="mb-4">Why Choose Us?</h2>
                <p class="lead text-muted">
                  We provide cutting-edge solutions that help businesses grow faster, 
                  work smarter, and achieve their goals with confidence.
                </p>
              </div>
            </div>
          </div>
        `,
      },
    },

    // Features Cards
    {
      type: "cards",
      data: {
        title: "Powerful Features",
        columns: 3,
        cards: [
          {
            id: "1",
            title: "Fast & Reliable",
            description:
              "Lightning-fast performance with 99.9% uptime guarantee. Your business never stops.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
          },
          {
            id: "2",
            title: "Secure by Default",
            description:
              "Enterprise-grade security with end-to-end encryption and compliance certifications.",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3",
          },
          {
            id: "3",
            title: "Easy Integration",
            description:
              "Connect with your existing tools in minutes. Works with everything you already use.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
          },
        ],
      },
    },

    // Social Proof / Stats
    {
      type: "richtext",
      data: {
        content: `
          <div class="bg-primary text-white py-5">
            <div class="container">
              <div class="row text-center">
                <div class="col-md-4 mb-4 mb-md-0">
                  <h2 class="display-4 fw-bold">10,000+</h2>
                  <p class="lead">Active Users</p>
                </div>
                <div class="col-md-4 mb-4 mb-md-0">
                  <h2 class="display-4 fw-bold">99.9%</h2>
                  <p class="lead">Uptime</p>
                </div>
                <div class="col-md-4">
                  <h2 class="display-4 fw-bold">24/7</h2>
                  <p class="lead">Support</p>
                </div>
              </div>
            </div>
          </div>
        `,
      },
    },

    // Testimonials
    {
      type: "cards",
      data: {
        title: "What Our Customers Say",
        columns: 2,
        cards: [
          {
            id: "t1",
            title: "Sarah Johnson, CEO at TechCorp",
            description:
              '"This platform has completely transformed how we work. Our productivity has increased by 200% and our team loves it."',
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          },
          {
            id: "t2",
            title: "Michael Chen, CTO at InnovateLabs",
            description:
              '"The best investment we\'ve made this year. Implementation was seamless and the results speak for themselves."',
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          },
        ],
      },
    },

    // Final CTA
    {
      type: "cta",
      data: {
        title: "Ready to Get Started?",
        description:
          "Join thousands of companies already transforming their business. Start your free trial today.",
        buttonText: "Start Free Trial",
        buttonUrl: "#signup",
        backgroundColor: "#0d6efd",
        textColor: "#ffffff",
      },
    },
  ],
};

/**
 * About Us Template
 * Professional corporate about page with mission, team, and values
 */
export const aboutUsTemplate: PageTemplate = {
  id: "about-us",
  name: "About Us",
  description:
    "A comprehensive about page showcasing your company story, mission, team, and values",
  category: "corporate",
  blocks: [
    // Hero Section
    {
      type: "hero",
      data: {
        title: "About Our Company",
        subtitle:
          "Building the future through innovation, dedication, and excellence",
        backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
        alignment: "center",
      },
    },

    // Company Story
    {
      type: "richtext",
      data: {
        content: `
          <div class="container py-5">
            <div class="row justify-content-center">
              <div class="col-lg-10">
                <h2 class="mb-4">Our Story</h2>
                <p class="lead mb-4">
                  Founded in 2020, we set out with a simple mission: to make technology 
                  accessible and impactful for businesses of all sizes.
                </p>
                <p class="text-muted mb-4">
                  What started as a small team of passionate innovators has grown into a 
                  thriving organization serving thousands of customers worldwide. Our journey 
                  has been driven by a commitment to excellence, continuous innovation, and 
                  putting our customers first in everything we do.
                </p>
                <p class="text-muted">
                  Today, we're proud to be at the forefront of digital transformation, 
                  helping businesses navigate the complexities of modern technology while 
                  staying focused on what matters most: their success.
                </p>
              </div>
            </div>
          </div>
        `,
      },
    },

    // Mission & Vision
    {
      type: "cards",
      data: {
        title: "Our Mission & Values",
        columns: 3,
        cards: [
          {
            id: "m1",
            title: "Innovation First",
            description:
              "We constantly push boundaries and explore new possibilities to deliver cutting-edge solutions.",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
          },
          {
            id: "m2",
            title: "Customer Success",
            description:
              "Your success is our success. We're committed to delivering exceptional value and support.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978",
          },
          {
            id: "m3",
            title: "Integrity & Trust",
            description:
              "We operate with transparency, honesty, and respect in all our relationships.",
            image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
          },
        ],
      },
    },

    // Team Section
    {
      type: "richtext",
      data: {
        content: `
          <div class="bg-light py-5">
            <div class="container">
              <div class="row justify-content-center mb-5">
                <div class="col-lg-8 text-center">
                  <h2 class="mb-3">Meet Our Team</h2>
                  <p class="lead text-muted">
                    The talented people behind our success
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
      },
    },

    // Team Members
    {
      type: "cards",
      data: {
        columns: 4,
        cards: [
          {
            id: "tm1",
            title: "Jane Smith",
            description: "CEO & Founder - Visionary leader with 15 years in tech",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
          },
          {
            id: "tm2",
            title: "David Lee",
            description: "CTO - Technology innovator and architecture expert",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
          },
          {
            id: "tm3",
            title: "Maria Garcia",
            description: "Head of Product - User experience champion",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
          },
          {
            id: "tm4",
            title: "James Wilson",
            description: "Head of Sales - Customer relationship builder",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
          },
        ],
      },
    },

    // Company Highlights Gallery
    {
      type: "image-gallery",
      data: {
        title: "Our Journey in Pictures",
        layout: "grid",
        images: [
          {
            id: "g1",
            url: "https://images.unsplash.com/photo-1497366216548-37526070297c",
            alt: "Office workspace",
            caption: "Our modern workspace",
          },
          {
            id: "g2",
            url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
            alt: "Team collaboration",
            caption: "Collaboration at its best",
          },
          {
            id: "g3",
            url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd",
            alt: "Product development",
            caption: "Building the future",
          },
          {
            id: "g4",
            url: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
            alt: "Team meeting",
            caption: "Strategy sessions",
          },
        ],
      },
    },

    // Join Us CTA
    {
      type: "cta",
      data: {
        title: "Join Our Growing Team",
        description:
          "We're always looking for talented individuals who share our passion for innovation and excellence.",
        buttonText: "View Open Positions",
        buttonUrl: "/careers",
        backgroundColor: "#198754",
        textColor: "#ffffff",
      },
    },
  ],
};

/**
 * All available templates
 */
export const PAGE_TEMPLATES: PageTemplate[] = [
  landingPageTemplate,
  aboutUsTemplate,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: PageTemplate["category"],
): PageTemplate[] {
  return PAGE_TEMPLATES.filter((template) => template.category === category);
}
