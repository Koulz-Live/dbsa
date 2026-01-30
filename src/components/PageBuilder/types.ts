/**
 * Page Builder Block Types and Interfaces
 * Defines the structure for all page builder blocks
 */

export type BlockType = 'hero' | 'richtext' | 'cta' | 'cards' | 'image-gallery';

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaUrl?: string;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface RichTextBlock extends BaseBlock {
  type: 'richtext';
  data: {
    content: string; // HTML content
  };
}

export interface CTABlock extends BaseBlock {
  type: 'cta';
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
  link?: string;
}

export interface CardsBlock extends BaseBlock {
  type: 'cards';
  data: {
    title?: string;
    cards: Card[];
    columns: 2 | 3 | 4;
  };
}

export interface ImageGalleryBlock extends BaseBlock {
  type: 'image-gallery';
  data: {
    title?: string;
    images: {
      id: string;
      url: string;
      alt: string;
      caption?: string;
    }[];
    layout: 'grid' | 'masonry' | 'carousel';
  };
}

export type PageBlock =
  | HeroBlock
  | RichTextBlock
  | CTABlock
  | CardsBlock
  | ImageGalleryBlock;

export interface PageBuilderData {
  blocks: PageBlock[];
}

// Block templates for initialization
export const BLOCK_TEMPLATES: Record<BlockType, Omit<PageBlock, 'id' | 'order'>> = {
  hero: {
    type: 'hero',
    data: {
      title: 'Hero Title',
      subtitle: 'Hero subtitle text',
      alignment: 'center',
    },
  },
  richtext: {
    type: 'richtext',
    data: {
      content: '<p>Enter your content here...</p>',
    },
  },
  cta: {
    type: 'cta',
    data: {
      title: 'Call to Action',
      description: 'Compelling description',
      buttonText: 'Learn More',
      buttonUrl: '#',
    },
  },
  cards: {
    type: 'cards',
    data: {
      title: 'Cards Section',
      columns: 3,
      cards: [
        {
          id: '1',
          title: 'Card 1',
          description: 'Card description',
        },
        {
          id: '2',
          title: 'Card 2',
          description: 'Card description',
        },
        {
          id: '3',
          title: 'Card 3',
          description: 'Card description',
        },
      ],
    },
  },
  'image-gallery': {
    type: 'image-gallery',
    data: {
      title: 'Image Gallery',
      layout: 'grid',
      images: [],
    },
  },
};
