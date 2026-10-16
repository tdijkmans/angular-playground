export interface FuzzyDemoRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

interface BaseIngredient {
  name: string;
  category: string;
  description: string;
  tags: string[];
}

const BASE_INGREDIENTS: BaseIngredient[] = [
  {
    name: 'Tomato',
    category: 'Vegetable',
    description: 'Juicy everyday tomato for sauces, salads, and sandwiches.',
    tags: ['nightshade', 'fresh'],
  },
  {
    name: 'Tomatoes',
    category: 'Vegetable',
    description: 'Plural listing often used in recipe indexes and pantry labels.',
    tags: ['nightshade', 'plural'],
  },
  {
    name: 'Tomato purée',
    category: 'Preserve',
    description: 'Smooth concentrated tomato base for soups and braises.',
    tags: ['nightshade', 'concentrated'],
  },
  {
    name: 'Basil',
    category: 'Herb',
    description: 'Sweet herb with peppery aroma, ideal for pesto and pasta.',
    tags: ['leafy', 'green'],
  },
  {
    name: 'Mozzarella',
    category: 'Dairy',
    description: 'Soft cheese that melts quickly on pizzas and bakes.',
    tags: ['cheese', 'melting'],
  },
  {
    name: 'Crème fraîche',
    category: 'Dairy',
    description: 'Tangy cultured cream used in soups, dips, and sauces.',
    tags: ['cultured', 'accented'],
  },
  {
    name: 'Jalapeño',
    category: 'Chili',
    description: 'Medium-hot chili pepper with bright grassy flavour.',
    tags: ['pepper', 'accented'],
  },
  {
    name: 'Aubergine',
    category: 'Vegetable',
    description: 'Silky eggplant flesh that roasts into creamy bites.',
    tags: ['eggplant', 'nightshade'],
  },
  {
    name: 'Garlic',
    category: 'Aromatics',
    description: 'Pungent bulb that forms the base of savoury cooking.',
    tags: ['allium', 'base'],
  },
  {
    name: 'Shallot',
    category: 'Aromatics',
    description: 'Mild allium with delicate sweetness for dressings.',
    tags: ['allium', 'mild'],
  },
  {
    name: 'Smoked paprika',
    category: 'Spice',
    description: 'Ground pepper spice with deep smoky warmth.',
    tags: ['powder', 'smoky'],
  },
  {
    name: 'Sweet paprika',
    category: 'Spice',
    description: 'Mild paprika used for colour and gentle sweetness.',
    tags: ['powder', 'sweet'],
  },
  {
    name: 'Black pepper',
    category: 'Spice',
    description: 'Freshly cracked peppercorn with piney bite.',
    tags: ['peppercorn', 'seasoning'],
  },
  {
    name: 'Sea salt flakes',
    category: 'Seasoning',
    description: 'Crisp finishing salt that dissolves quickly.',
    tags: ['salt', 'finishing'],
  },
  {
    name: 'Extra virgin olive oil',
    category: 'Oil',
    description: 'Fruit-forward olive oil for dressings and drizzling.',
    tags: ['fat', 'mediterranean'],
  },
  {
    name: 'Sun-dried tomatoes',
    category: 'Preserve',
    description: 'Intense chewy tomatoes preserved in oil.',
    tags: ['nightshade', 'dried'],
  },
  {
    name: 'Capers',
    category: 'Condiment',
    description: 'Brined flower buds with sharp salty punch.',
    tags: ['briny', 'salty'],
  },
  {
    name: 'Lemon zest',
    category: 'Citrus',
    description: 'Bright aromatic citrus peel used as a finisher.',
    tags: ['citrus', 'fragrant'],
  },
  {
    name: 'Lemon juice',
    category: 'Citrus',
    description: 'Fresh acidity balancing rich ingredients.',
    tags: ['citrus', 'acid'],
  },
  {
    name: 'Parsley',
    category: 'Herb',
    description: 'Clean herb that freshens stews and sauces.',
    tags: ['leafy', 'green'],
  },
  {
    name: 'Coriander',
    category: 'Herb',
    description: 'Leafy herb with citrusy top notes and soft bitterness.',
    tags: ['leafy', 'citrusy'],
  },
  {
    name: 'Scallion',
    category: 'Aromatics',
    description: 'Tender spring onion for garnishes and stir-fries.',
    tags: ['allium', 'fresh'],
  },
  {
    name: 'Gochujang',
    category: 'Ferment',
    description: 'Korean fermented chili paste with sweet heat.',
    tags: ['chili', 'fermented'],
  },
  {
    name: 'Miso paste',
    category: 'Ferment',
    description: 'Savoury fermented soybean paste for umami depth.',
    tags: ['soy', 'fermented'],
  },
  {
    name: 'Coconut milk',
    category: 'Pantry',
    description: 'Rich coconut milk for curries and desserts.',
    tags: ['creamy', 'tropical'],
  },
  {
    name: 'Chickpeas',
    category: 'Legume',
    description: 'Nutty legumes used in stews, salads, and hummus.',
    tags: ['protein', 'pantry'],
  },
  {
    name: 'Cannellini beans',
    category: 'Legume',
    description: 'Creamy white beans that hold shape in soups.',
    tags: ['protein', 'white bean'],
  },
  {
    name: 'Pecorino Romano',
    category: 'Dairy',
    description: 'Sharp aged sheep cheese for pasta finishing.',
    tags: ['cheese', 'aged'],
  },
  {
    name: 'Parmigiano Reggiano',
    category: 'Dairy',
    description: 'Granular aged cheese packed with nutty umami.',
    tags: ['cheese', 'aged'],
  },
  {
    name: 'Crushed tomatoes',
    category: 'Preserve',
    description: 'Chunky tomato base ideal for long simmered sauces.',
    tags: ['nightshade', 'canned'],
  },
];

const USAGE_CONTEXTS = [
  'weeknight pasta sauce',
  'hearty soup base',
  'charred traybake',
  'fresh salad bowl',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createVariantDescription(base: BaseIngredient, usage: string, variant: number): string {
  const prep = ['fresh prep', 'roasted prep', 'slow-cooked prep', 'quick garnish'][variant] ?? 'kitchen prep';

  return `${base.description} This ${prep} entry is tagged for ${usage}.`;
}

export const FUZZY_DEMO_RECORDS: FuzzyDemoRecord[] = BASE_INGREDIENTS.flatMap((baseIngredient, ingredientIndex) =>
  USAGE_CONTEXTS.map((usageContext, usageIndex) => {
    const isBaseVariant = usageIndex === 0;
    const name = isBaseVariant ? baseIngredient.name : `${baseIngredient.name} — ${usageContext}`;

    return {
      id: `${slugify(baseIngredient.name)}-${usageIndex + 1}`,
      name,
      description: createVariantDescription(baseIngredient, usageContext, usageIndex),
      category: baseIngredient.category,
      tags: [...baseIngredient.tags, usageContext, `batch-${ingredientIndex + 1}`],
    };
  }),
);
