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
    "An IBM-style homepage layout with a hero split, news rail, recommended content, and enterprise sections",
  category: "marketing",
  blocks: [
    {
      type: "richtext",
      data: {
        content: `
          <style>
            :root{
              --ibm-blue:#0f62fe;
              --ink:#161616;
              --muted:#525252;
              --line:#e0e0e0;
              --soft:#f4f4f4;
            }
            .ibm-shell{ color:var(--ink); background:#fff; }
            .topbar{ border-bottom:1px solid var(--line); background:#fff; position:sticky; top:0; z-index:1030; }
            .ibm-nav-link{ color:#3d3d3d; font-size:.92rem; text-decoration:none; }
            .ibm-nav-link:hover{ color:var(--ink); }
            .brandmark{ font-weight:800; letter-spacing:.08em; font-size:1.05rem; margin-right:.5rem; }
            .hero-title{ font-size:clamp(2.1rem, 4vw, 3.2rem); line-height:1.05; letter-spacing:-.02em; font-weight:300; }
            .hero-sub{ color:var(--muted); max-width:42ch; font-size:1rem; }
            .btn-ibm{ background:var(--ibm-blue); border-color:var(--ibm-blue); color:#fff; border-radius:0; padding:.85rem 1rem; font-weight:600; }
            .btn-ibm:hover{ filter:brightness(.95); color:#fff; }
            .btn-ibm-outline{ border-radius:0; border:1px solid var(--line); padding:.85rem 1rem; font-weight:600; background:#fff; color:var(--ink); }
            .btn-ibm-outline:hover{ background:var(--soft); }
            .hero-media{ background:linear-gradient(180deg,#f2f2f2,#fff); border-left:1px solid var(--line); border-bottom:1px solid var(--line); position:relative; overflow:hidden; min-height:320px; }
            .hero-media img{ width:100%; height:100%; object-fit:cover; opacity:.95; display:block; }
            .news-rail{ border-left:1px solid var(--line); background:#fff; }
            .news-rail h6{ font-weight:700; font-size:.85rem; color:#393939; }
            .news-item{ padding:.85rem 0; border-bottom:1px solid var(--line); }
            .news-item a{ color:var(--ibm-blue); text-decoration:none; font-size:.92rem; font-weight:600; display:inline-block; }
            .news-item a:hover{ text-decoration:underline; }
            .pager{ display:flex; gap:.4rem; justify-content:flex-end; padding-top:.75rem; }
            .pager button{ width:28px; height:28px; border:1px solid var(--line); background:#fff; font-size:.85rem; }
            .pager button.active{ border-color:var(--ibm-blue); color:var(--ibm-blue); font-weight:700; }
            .rec-card{ border:1px solid var(--line); border-radius:0; background:#fff; height:100%; transition:transform .15s ease; }
            .rec-card:hover{ transform:translateY(-2px); }
            .rec-meta{ color:#6f6f6f; font-size:.8rem; }
            .arrow-link{ color:var(--ibm-blue); text-decoration:none; font-weight:700; }
            .arrow-link:hover{ text-decoration:underline; }
            .section-title{ font-size:2.3rem; font-weight:300; letter-spacing:-.02em; }
            .section-sub{ color:var(--muted); max-width:70ch; }
            .brand-tabs{ border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:#fff; overflow:auto; white-space:nowrap; }
            .brand-tabs button{ border:0; background:transparent; padding:1rem 1.2rem; font-weight:700; color:#6f6f6f; border-bottom:3px solid transparent; }
            .brand-tabs button.active{ color:var(--ink); border-bottom-color:var(--ibm-blue); }
            .case-wrap{ border-bottom:1px solid var(--line); }
            .case-kpis .kpi{ border-top:1px solid var(--line); padding-top:1rem; margin-top:1rem; }
            .kpi .val{ font-size:2rem; font-weight:300; color:var(--ibm-blue); line-height:1; }
            .kpi .lbl{ color:var(--muted); font-size:.9rem; }
            .case-media{ border-left:1px solid var(--line); background:#f3f3f3; min-height:280px; }
            .case-media img{ width:100%; height:100%; object-fit:cover; display:block; }
            .event-banner{ background:linear-gradient(90deg,#e8f0ff,#f6fbff); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
            .event-badge{ display:flex; align-items:center; gap:.75rem; font-weight:800; color:#0b4edb; letter-spacing:.02em; }
            .event-badge .chip{ background:#0b4edb; color:#fff; padding:.35rem .55rem; font-size:.75rem; border-radius:0; }
            .tile{ border:1px solid var(--line); border-radius:0; background:#fff; padding:1.2rem; height:100%; transition:transform .15s ease; }
            .tile:hover{ transform:translateY(-2px); }
            .tile .icon{ width:34px; height:34px; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; font-weight:800; color:#6f6f6f; margin-bottom:.9rem; }
            .tile h6{ margin:0 0 .5rem; font-weight:700; }
            .tile p{ margin:0; color:var(--muted); font-size:.95rem; }
            .inside-card{ padding:1.2rem 0; border-top:1px solid var(--line); }
            .inside-card h6{ font-weight:800; margin-bottom:.5rem; }
            .inside-card a{ color:var(--ibm-blue); text-decoration:none; font-weight:700; }
            .inside-card a:hover{ text-decoration:underline; }
            .stay-wrap{ border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:#fff; }
            .stay-graphic{ background:linear-gradient(135deg,#0f62fe,#58a6ff); min-height:240px; display:flex; align-items:center; justify-content:center; color:#fff; position:relative; overflow:hidden; }
            .stay-graphic:before{ content:""; position:absolute; inset:-40px; background:
              radial-gradient(circle at 20% 30%, rgba(255,255,255,.25) 0 2px, transparent 3px 100%),
              radial-gradient(circle at 55% 55%, rgba(255,255,255,.25) 0 2px, transparent 3px 100%),
              radial-gradient(circle at 75% 25%, rgba(255,255,255,.25) 0 2px, transparent 3px 100%);
              transform:rotate(8deg); opacity:.75; }
            .stay-graphic .eye{ position:relative; width:140px; height:140px; border:4px solid rgba(255,255,255,.85); border-radius:999px; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px); }
            .stay-graphic .eye:after{ content:""; width:34px; height:34px; background:rgba(255,255,255,.9); border-radius:999px; display:block; }
            footer{ background:#111; color:#cfcfcf; }
            footer a{ color:#cfcfcf; text-decoration:none; }
            footer a:hover{ color:#fff; text-decoration:underline; }
            .foot-title{ color:#fff; font-weight:800; margin-bottom:.75rem; font-size:.95rem; }
            .foot-small{ color:#a6a6a6; font-size:.85rem; }
            .chat-bubble{ position:fixed; right:16px; bottom:16px; z-index:9999; display:flex; align-items:end; gap:.5rem; }
            .chat-pill{ background:#0f62fe; color:#fff; border:0; border-radius:0; padding:.8rem .95rem; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,.25); }
            .chat-icon{ width:44px; height:44px; background:#0f62fe; border-radius:999px; border:0; box-shadow:0 10px 25px rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; }
          </style>

          <div class="ibm-shell">
            <header class="topbar" aria-label="Primary">
              <div class="container-fluid px-3 px-lg-4">
                <div class="d-flex align-items-center justify-content-between py-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="brandmark">IBM</span>
                    <nav class="d-none d-lg-flex align-items-center gap-3" aria-label="Main">
                      <a class="ibm-nav-link px-0" href="#">Software</a>
                      <a class="ibm-nav-link px-0" href="#">Infrastructure</a>
                      <a class="ibm-nav-link px-0" href="#">Consulting</a>
                      <a class="ibm-nav-link px-0" href="#">Support</a>
                      <a class="ibm-nav-link px-0" href="#">Think</a>
                    </nav>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-light border d-none d-md-inline-flex" type="button">Search</button>
                    <button class="btn btn-sm btn-light border d-none d-md-inline-flex" type="button">Globe</button>
                    <button class="btn btn-sm btn-light border d-none d-md-inline-flex" type="button">User</button>
                    <button class="btn btn-sm btn-light border d-lg-none" type="button">Menu</button>
                  </div>
                </div>
              </div>
            </header>
          </div>
        `,
      },
    },
    {
      type: "hero",
      data: {
        title: "Strengthen cyber resilience",
        subtitle:
          "Ensure the integrity and availability of your critical data with built-in intelligence designed to protect, adapt and perform.",
        backgroundImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
        ctaText: "Explore the portfolio →",
        ctaUrl: "#portfolio",
        alignment: "left",
        fullWidth: true,
      },
    },
    {
      type: "richtext",
      data: {
        fullWidth: true,
        content: `
          <section class="hero-wrap">
            <div class="container-fluid px-3 px-lg-4 pb-4">
              <div class="d-flex flex-column flex-sm-row gap-2">
                <a class="btn btn-ibm-outline" href="#">Rethink your AI infrastructure →</a>
              </div>
            </div>
            <div class="container-fluid px-0">
              <div class="row g-0">
                <div class="col-12 col-lg-9">
                  <div class="hero-media" style="border-left:0;">
                    <img alt="Developers collaborating on software" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" />
                  </div>
                </div>
                <aside class="col-12 col-lg-3 news-rail" aria-label="Latest news">
                  <div class="p-3 p-lg-4">
                    <h6 class="mb-3">Latest News</h6>
                    <div class="news-item">
                      <a href="#">IBM introduces autonomous storage with FlashSystem…</a>
                    </div>
                    <div class="news-item">
                      <a href="#">IBM opens Global RFP for AI-driven solutions shaping the future of work…</a>
                    </div>
                    <div class="pager" role="group" aria-label="News pages">
                      <button class="active" type="button">1</button>
                      <button type="button">2</button>
                      <button type="button">3</button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        `,
      },
    },
    {
      type: "cards",
      data: {
        title: "Recommended for you",
        columns: 4,
        fullWidth: true,
        titleAlign: "start",
        cards: [
          {
            id: "rec-1",
            title: "The Economist: How IBM became an AI clarifier",
            description:
              "How IBM clarifies AI outcomes with trusted governance.",
            category: "Insight",
            contentType: "Article",
            readingTime: "5 min",
            image:
              "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
            imageAlt: "Analysts reviewing research findings",
            link: "#",
          },
          {
            id: "rec-2",
            title: "Build a resilient foundation for your hybrid cloud",
            description: "Blueprints to modernize cloud operations end-to-end.",
            category: "Solutions",
            contentType: "Guide",
            readingTime: "7 min",
            image:
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
            imageAlt: "Engineers working on cloud infrastructure",
            link: "#",
          },
          {
            id: "rec-3",
            title: "Go cloud-right: accelerate delivery, reduce friction",
            description:
              "A client story on speeding releases with cloud-right.",
            category: "Client",
            contentType: "Case Study",
            readingTime: "4 min",
            image:
              "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
            imageAlt: "Team collaborating in a modern office",
            link: "#",
          },
          {
            id: "rec-4",
            title: "Unlock your potential with expert-led AI courses",
            description: "Short learning paths to build practical AI skills.",
            category: "Training",
            contentType: "Course",
            readingTime: "3 min",
            image:
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
            imageAlt: "Instructor guiding a classroom session",
            link: "#",
          },
        ],
      },
    },
    {
      type: "tabs",
      data: {
        title: "Smarter business. Real impact.",
        fullWidth: true,
        tabs: [
          {
            id: "tab-ferrari",
            label: "Scuderia Ferrari",
            icon: "speedometer2",
            title: "Scuderia Ferrari",
            description:
              "Deliver faster insights, streamline operations and improve performance with secure, scalable infrastructure and analytics.",
            image:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
            linkText: "Learn how →",
            linkUrl: "#",
            stats: [
              {
                id: "ferrari-1",
                value: "2×",
                label: "increase in daily active users",
              },
              {
                id: "ferrari-2",
                value: "35%",
                label: "reduction in response time",
              },
            ],
          },
          {
            id: "tab-avid",
            label: "Avid Solutions",
            icon: "cpu",
            title: "Avid Solutions",
            description:
              "Improve reliability and time-to-value with modern integration, observability and governed data operations.",
            image:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
            linkText: "Learn how →",
            linkUrl: "#",
            stats: [
              {
                id: "avid-1",
                value: "48%",
                label: "faster incident resolution",
              },
              { id: "avid-2", value: "3×", label: "deployment frequency" },
            ],
          },
          {
            id: "tab-pfizer",
            label: "Pfizer",
            icon: "shield-check",
            title: "Pfizer",
            description:
              "Accelerate research and decision-making using secure AI and analytics with strong governance and compliance.",
            image:
              "https://images.unsplash.com/photo-1521790366329-6a2b0f6dfc2a",
            linkText: "Learn how →",
            linkUrl: "#",
            stats: [
              { id: "pfizer-1", value: "60%", label: "faster data access" },
              {
                id: "pfizer-2",
                value: "25%",
                label: "lower operational costs",
              },
            ],
          },
          {
            id: "tab-usopen",
            label: "US Open",
            icon: "broadcast",
            title: "US Open",
            description:
              "Deliver real-time fan experiences at scale with resilient cloud and data platforms.",
            image:
              "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
            linkText: "Learn how →",
            linkUrl: "#",
            stats: [
              { id: "usopen-1", value: "1B+", label: "fan interactions" },
              { id: "usopen-2", value: "99.99%", label: "availability" },
            ],
          },
        ],
      },
    },
    {
      type: "richtext",
      data: {
        content: `
          <section class="event-banner">
            <div class="container-fluid px-3 px-lg-4 py-3">
              <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
                <div class="event-badge">
                  <span class="chip">IBM</span>
                  <span>Technology Summit</span>
                </div>
                <div class="text-muted">
                  Join us for a brand-defining event focused on responsible AI at scale—balancing performance, cost and risk.
                </div>
                <a class="btn btn-ibm-outline" href="#">Register now →</a>
              </div>
            </div>
          </section>
        `,
      },
    },
    {
      type: "cards",
      data: {
        title: "Enterprise technology",
        columns: 4,
        fullWidth: true,
        titleAlign: "start",
        cards: [
          {
            id: "ent-1",
            title: "AI productivity",
            description:
              "Automate work and accelerate outcomes with copilots and orchestration.",
            category: "Enterprise",
            contentType: "Solution Brief",
            readingTime: "4 min",
            image:
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
            imageAlt: "Team collaborating on AI initiatives",
            link: "#",
          },
          {
            id: "ent-2",
            title: "Hybrid infrastructure",
            description:
              "Modernize compute, storage and network to meet performance and resilience goals.",
            category: "Enterprise",
            contentType: "Solution Brief",
            readingTime: "6 min",
            image:
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
            imageAlt: "Engineers managing hybrid infrastructure",
            link: "#",
          },
          {
            id: "ent-3",
            title: "Security & governance",
            description:
              "Operate a Zero Trust program with policy, controls and measurable maturity.",
            category: "Enterprise",
            contentType: "Playbook",
            readingTime: "5 min",
            image:
              "https://images.unsplash.com/photo-1563986768609-322da13575f3",
            imageAlt: "Security team reviewing governance dashboards",
            link: "#",
          },
          {
            id: "ent-4",
            title: "Integration & resilience",
            description:
              "Connect systems and services end-to-end with dependable runtime operations.",
            category: "Enterprise",
            contentType: "Architecture",
            readingTime: "5 min",
            image:
              "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
            imageAlt: "Architects aligning integration plans",
            link: "#",
          },
          {
            id: "ent-5",
            title: "Analytics",
            description:
              "Build trustworthy dashboards and insights with governed data pipelines.",
            category: "Enterprise",
            contentType: "Overview",
            readingTime: "4 min",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
            imageAlt: "Analytics dashboard with key metrics",
            link: "#",
          },
          {
            id: "ent-6",
            title: "AI models",
            description:
              "Deploy models safely with lifecycle management, monitoring and guardrails.",
            category: "Enterprise",
            contentType: "Guide",
            readingTime: "6 min",
            image:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
            imageAlt: "Data scientists reviewing AI model outputs",
            link: "#",
          },
          {
            id: "ent-7",
            title: "Data management",
            description:
              "Unify data assets with lineage, quality controls and access governance.",
            category: "Enterprise",
            contentType: "Strategy",
            readingTime: "5 min",
            image:
              "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
            imageAlt: "Data engineers working on governance tools",
            link: "#",
          },
          {
            id: "ent-8",
            title: "Consulting",
            description:
              "Transform strategy, operating models and delivery with measurable value.",
            category: "Enterprise",
            contentType: "Engagement",
            readingTime: "4 min",
            image:
              "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
            imageAlt: "Consultants in a planning workshop",
            link: "#",
          },
        ],
      },
    },
    {
      type: "cards",
      data: {
        title: "Inside IBM",
        columns: 3,
        fullWidth: true,
        titleAlign: "start",
        cards: [
          {
            id: "inside-1",
            title: "Our company",
            description:
              "Explore history and a culture of putting technology to work in the real world.",
            image:
              "https://images.unsplash.com/photo-1497366216548-37526070297c",
            link: "#",
          },
          {
            id: "inside-2",
            title: "Our innovations",
            description:
              "Visit labs and see what’s in store for the future of computing.",
            image:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
            link: "#",
          },
          {
            id: "inside-3",
            title: "Our people",
            description:
              "See what it takes to become part of a global team building skills.",
            image:
              "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
            link: "#",
          },
        ],
      },
    },
    {
      type: "richtext",
      data: {
        fullWidth: true,
        content: `
          <section class="stay-wrap">
            <div class="container-fluid px-0">
              <div class="row g-0">
                <div class="col-12 col-lg-6">
                  <div class="stay-graphic">
                    <div class="eye" aria-hidden="true"></div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="p-4 p-lg-5">
                    <h3 class="section-title mb-3">Stay connected</h3>
                    <p class="text-muted mb-4">
                      Subscribe to stay on top of new product features, releases, use cases, video chats with experts, and learning opportunities.
                    </p>
                    <form class="row g-2" aria-label="Subscribe">
                      <div class="col-12 col-md-8">
                        <label class="form-label small text-muted" for="ibm-email">Business email</label>
                        <input class="form-control" id="ibm-email" type="email" placeholder="name@company.com" required />
                      </div>
                      <div class="col-12 col-md-4 d-flex align-items-end">
                        <button class="btn btn-ibm w-100" type="submit">Subscribe</button>
                      </div>
                      <div class="col-12">
                        <div class="small text-muted">By subscribing you agree to receive emails. You can unsubscribe any time.</div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        `,
      },
    },
    {
      type: "richtext",
      data: {
        fullWidth: true,
        content: `
          <footer class="pt-5">
            <div class="container-fluid px-3 px-lg-4">
              <div class="row g-4 pb-4">
                <div class="col-12 col-lg-3">
                  <div class="brandmark text-white mb-2">IBM</div>
                  <div class="foot-small">Discover trusted enterprise technology, services and learning.</div>
                </div>
                <div class="col-6 col-lg-3">
                  <div class="foot-title">Discover</div>
                  <div class="d-grid gap-1">
                    <a href="#">Products</a>
                    <a href="#">Consulting services</a>
                    <a href="#">Industries</a>
                    <a href="#">Case studies</a>
                    <a href="#">Financing</a>
                    <a href="#">Research</a>
                  </div>
                </div>
                <div class="col-6 col-lg-3">
                  <div class="foot-title">Connect</div>
                  <div class="d-grid gap-1">
                    <a href="#">Business partners</a>
                    <a href="#">Developers</a>
                    <a href="#">Events</a>
                    <a href="#">Newsletters</a>
                    <a href="#">Support</a>
                    <a href="#">TechXchange community</a>
                  </div>
                </div>
                <div class="col-12 col-lg-3">
                  <div class="foot-title">Follow</div>
                  <div class="d-grid gap-1">
                    <a href="#">LinkedIn</a>
                    <a href="#">X</a>
                    <a href="#">Instagram</a>
                    <a href="#">YouTube</a>
                    <a href="#">Podcasts</a>
                  </div>
                </div>
              </div>
              <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center py-3 border-top" style="border-color:#2a2a2a !important;">
                <div class="foot-small">© IBM</div>
                <div class="d-flex flex-wrap gap-3 foot-small">
                  <a href="#">Privacy</a>
                  <a href="#">Terms of use</a>
                  <a href="#">Accessibility</a>
                  <a href="#">Cookie preferences</a>
                </div>
              </div>
            </div>
          </footer>

          <div class="chat-bubble" aria-label="Chat helper">
            <button class="chat-pill d-none d-md-inline-flex" type="button">
              Hello! How can we help you?
            </button>
            <button class="chat-icon" type="button" aria-label="Open chat">⌁</button>
          </div>
        `,
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
        backgroundImage:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
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
            image:
              "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
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
            image:
              "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
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
            description:
              "CEO & Founder - Visionary leader with 15 years in tech",
            image:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
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
            image:
              "https://images.unsplash.com/photo-1580489944761-15a19d654956",
          },
          {
            id: "tm4",
            title: "James Wilson",
            description: "Head of Sales - Customer relationship builder",
            image:
              "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
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
