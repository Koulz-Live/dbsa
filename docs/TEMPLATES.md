# Page Templates Documentation

This document describes the two page templates created for the DBSA CMS using the PageBuilder block system.

## Available Templates

### 1. Landing Page Template

**Purpose**: Conversion-focused marketing page for product launches, campaigns, or promotional content.

**Category**: Marketing

**Structure**: 6 blocks

#### Blocks Included:

1. **Hero Section**
   - Large heading: "Transform Your Business with Our Solution"
   - Subtitle with value proposition
   - Background image from Unsplash
   - Primary CTA button: "Get Started Free"
   - Center-aligned layout

2. **Introduction Rich Text**
   - "Why Choose Us?" heading
   - Lead paragraph explaining benefits
   - Container layout with centered content

3. **Features Cards** (3 columns)
   - Fast & Reliable
   - Secure by Default
   - Easy Integration
   - Each card includes an image, title, and description

4. **Social Proof Stats** (Rich Text)
   - 10,000+ Active Users
   - 99.9% Uptime
   - 24/7 Support
   - Blue background with white text

5. **Testimonials Cards** (2 columns)
   - Customer testimonial from Sarah Johnson, CEO
   - Customer testimonial from Michael Chen, CTO
   - Photos and quotes

6. **Final CTA Block**
   - "Ready to Get Started?" heading
   - Call-to-action description
   - "Start Free Trial" button
   - Blue background (#0d6efd)

**Best For**:

- Product launches
- Marketing campaigns
- Lead generation pages
- Service promotion
- SaaS landing pages

---

### 2. About Us Template

**Purpose**: Professional corporate page showcasing company story, mission, team, and values.

**Category**: Corporate

**Structure**: 7 blocks

#### Blocks Included:

1. **Hero Section**
   - Page title: "About Our Company"
   - Subtitle: Company tagline
   - Team collaboration background image
   - Center-aligned layout

2. **Company Story** (Rich Text)
   - "Our Story" heading
   - Foundation narrative (2020)
   - Company growth journey
   - Mission statement
   - Multi-paragraph storytelling format

3. **Mission & Values Cards** (3 columns)
   - Innovation First
   - Customer Success
   - Integrity & Trust
   - Each value includes an image and detailed description

4. **Team Section Header** (Rich Text)
   - "Meet Our Team" heading
   - Introductory text
   - Light gray background section

5. **Team Members Cards** (4 columns)
   - Jane Smith - CEO & Founder
   - David Lee - CTO
   - Maria Garcia - Head of Product
   - James Wilson - Head of Sales
   - Professional headshots and titles

6. **Company Gallery** (Image Gallery)
   - "Our Journey in Pictures" title
   - 4 images in grid layout:
     - Office workspace
     - Team collaboration
     - Product development
     - Strategy sessions
   - Each image includes caption

7. **Careers CTA Block**
   - "Join Our Growing Team" heading
   - Recruitment call-to-action
   - "View Open Positions" button
   - Green background (#198754)

**Best For**:

- Company about pages
- Corporate websites
- Team introductions
- Mission and values pages
- Recruitment landing pages

---

## How to Use Templates

### In Content Editor

1. Navigate to `/content/new` to create new content
2. Click the **"Use Template"** button in the Page Content section
3. Select a template from the modal dialog
4. The template blocks will be loaded into the PageBuilder
5. Customize each block as needed:
   - Edit text content
   - Replace images with your own
   - Update CTAs and links
   - Modify colors and styling
   - Add or remove blocks

### In Templates Preview

1. Navigate to `/templates` to preview all available templates
2. Use the navigation tabs to switch between templates
3. View live preview of how the template renders
4. See the block structure and composition
5. Click **"Use This Template"** to start creating content

---

## Template Features

### Image Sources

All template images use Unsplash placeholder images. Replace these with your own images for production use.

### Responsive Design

All blocks are built with Bootstrap 5.3 and are fully responsive:

- Mobile-first design
- Adaptive column layouts (e.g., 4 columns → stacks on mobile)
- Flexible image sizing
- Readable typography at all screen sizes

### Customization

Every aspect of the templates can be customized:

- **Text**: All headings, paragraphs, and descriptions
- **Images**: Upload or link to custom images
- **Colors**: Background and text colors for CTA and rich text blocks
- **Layout**: Column counts, alignment, and spacing
- **Links**: All CTAs and card links can be updated
- **Order**: Drag and drop to reorder blocks

### Block Types Used

1. **Hero Block**: Large banner sections with title, subtitle, background image, and CTA
2. **Rich Text Block**: HTML content with full formatting control
3. **CTA Block**: Call-to-action sections with colored backgrounds
4. **Cards Block**: Multi-column card layouts (2, 3, or 4 columns)
5. **Image Gallery Block**: Photo galleries with grid, masonry, or carousel layouts

---

## Best Practices

### When Using Landing Page Template:

- Update the hero image to match your brand
- Customize feature descriptions to your actual features
- Replace testimonials with real customer quotes
- Update stats to reflect your metrics
- Ensure all CTAs point to correct URLs
- Test conversion tracking on CTA buttons

### When Using About Us Template:

- Replace company story with your actual history
- Update team member photos and bios
- Add your company's core values
- Include authentic office/team photos in gallery
- Link careers CTA to your jobs page
- Keep content authentic and relatable

### General Tips:

- Maintain consistent brand colors throughout
- Use high-quality, optimized images
- Keep text concise and scannable
- Test all links before publishing
- Preview on multiple devices
- Run accessibility checks

---

## Adding More Templates

To create additional templates:

1. Open `/src/data/pageTemplates.ts`
2. Create a new template object:

```typescript
export const yourTemplate: PageTemplate = {
  id: "your-template-id",
  name: "Your Template Name",
  description: "Brief description of the template",
  category: "marketing" | "corporate" | "content" | "other",
  blocks: [
    // Add your blocks here
  ],
};
```

3. Add to `PAGE_TEMPLATES` array:

```typescript
export const PAGE_TEMPLATES: PageTemplate[] = [
  landingPageTemplate,
  aboutUsTemplate,
  yourTemplate, // Add here
];
```

4. The template will automatically appear in the Template Selector

---

## Technical Implementation

### Files Created:

- `/src/data/pageTemplates.ts` - Template definitions
- `/src/components/TemplateSelector/TemplateSelector.tsx` - Modal component
- `/src/components/TemplateSelector/index.ts` - Exports
- `/src/pages/TemplatesPreview.tsx` - Preview page
- Updated `/src/pages/ContentEditor.tsx` - Added template button
- Updated `/src/App.tsx` - Added templates route
- Updated `/src/components/Navigation.tsx` - Added templates link

### Template Structure:

Each template is a `PageTemplate` object containing:

- `id`: Unique identifier
- `name`: Display name
- `description`: Template description
- `category`: Template category for filtering
- `thumbnail` (optional): Preview image
- `blocks`: Array of page blocks (without id and order)

### Conversion Process:

1. Template blocks are stored without `id` and `order`
2. When applied, each block receives:
   - Unique `id`: Timestamp-based + index
   - Sequential `order`: Array index
3. Blocks are cast to `PageBlock` type for PageBuilder compatibility

---

## Future Enhancements

Potential improvements for the template system:

1. **More Templates**:
   - Blog post template
   - Product showcase template
   - Event/conference template
   - FAQ page template
   - Contact us template

2. **Template Categories**:
   - Add filtering by category in template selector
   - Category-based organization
   - Custom categories

3. **Template Thumbnails**:
   - Generate screenshot previews
   - Show thumbnail in selector
   - Visual template browsing

4. **Template Variations**:
   - Color scheme variants
   - Layout variations
   - Industry-specific versions

5. **User Templates**:
   - Save custom templates
   - Share templates between users
   - Template marketplace

6. **Template Analytics**:
   - Track template usage
   - Measure conversion rates
   - Popular template insights

---

## Support

For questions or issues with templates:

- Check the PageBuilder block documentation
- Review the template source code
- Test in Templates Preview page before publishing
- Consult the Bootstrap 5.3 documentation for styling

---

**Last Updated**: February 17, 2026
**Version**: 1.0.0
