/**
 * Page Builder Block Types and Interfaces
 * Defines the structure for all page builder blocks
 */

export type BlockType =
  | "hero"
  | "richtext"
  | "cta"
  | "cards"
  | "image-gallery"
  | "tabs";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaUrl?: string;
    alignment: "left" | "center" | "right";
    fullWidth?: boolean;
  };
}

export interface RichTextBlock extends BaseBlock {
  type: "richtext";
  data: {
    content: string; // HTML content
  };
}

export interface CTABlock extends BaseBlock {
  type: "cta";
  data: {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface Card {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  isDecorative?: boolean;
  category?: string;
  readingTime?: string;
  contentType?: string;
  link?: string;
}

export interface CardsBlock extends BaseBlock {
  type: "cards";
  data: {
    title?: string;
    cards: Card[];
    columns: 2 | 3 | 4;
    fullWidth?: boolean;
    titleAlign?: "start" | "center";
  };
}

export interface ImageGalleryBlock extends BaseBlock {
  type: "image-gallery";
  data: {
    title?: string;
    images: {
      id: string;
      url: string;
      alt: string;
      caption?: string;
    }[];
    layout: "grid" | "masonry" | "carousel";
  };
}

export interface TabStat {
  id: string;
  value: string;
  label: string;
}

export interface TabItem {
  id: string;
  label: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  linkText?: string;
  linkUrl?: string;
  stats?: TabStat[];
}

export interface TabsBlock extends BaseBlock {
  type: "tabs";
  data: {
    title?: string;
    tabs: TabItem[];
    fullWidth?: boolean;
  };
}

export type PageBlock =
  | HeroBlock
  | RichTextBlock
  | CTABlock
  | CardsBlock
  | ImageGalleryBlock
  | TabsBlock;

export interface PageBuilderData {
  blocks: PageBlock[];
}

// Block templates for initialization
export const BLOCK_TEMPLATES: Record<
  BlockType,
  Omit<PageBlock, "id" | "order">
> = {
  hero: {
    type: "hero",
    data: {
      title: "Hero Title",
      subtitle: "Hero subtitle text",
      alignment: "center",
    },
  },
  richtext: {
    type: "richtext",
    data: {
      content: "<p>Enter your content here...</p>",
    },
  },
  cta: {
    type: "cta",
    data: {
      title: "Call to Action",
      description: "Compelling description",
      buttonText: "Learn More",
      buttonUrl: "#",
    },
  },
  cards: {
    type: "cards",
    data: {
      title: "Cards Section",
      columns: 3,
      cards: [
        {
          id: "1",
          title: "Card 1",
          description: "Card description",
        },
        {
          id: "2",
          title: "Card 2",
          description: "Card description",
        },
        {
          id: "3",
          title: "Card 3",
          description: "Card description",
        },
      ],
    },
  },
  "image-gallery": {
    type: "image-gallery",
    data: {
      title: "Image Gallery",
      layout: "grid",
      images: [],
    },
  },
  tabs: {
    type: "tabs",
    data: {
      title: "Tabbed Section",
      tabs: [
        {
          id: "tab-1",
          label: "Tab 1",
          title: "Tab headline",
          description: "Tab description goes here.",
          stats: [
            { id: "stat-1", value: "2×", label: "sample metric" },
            { id: "stat-2", value: "35%", label: "improvement" },
          ],
        },
      ],
    },
  },
};
