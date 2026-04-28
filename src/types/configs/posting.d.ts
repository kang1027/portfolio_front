export interface PostingFrontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  tags?: string[];
  author?: string;
  image?: string;
}

export interface PostingMdData {
  id: string;
  title: string;
  file: string;
  icon: string;
  excerpt: string;
  category: string;
  slug: string;
  frontmatter?: PostingFrontmatter;
}

export interface PostingSubcategory {
  id: string;
  title: string;
  icon: string;
  posts: PostingMdData[];
}

export interface PostingCategory {
  id: string;
  title: string;
  icon: string;
  posts?: PostingMdData[]; // Optional for categories with subcategories
  subcategories?: PostingSubcategory[]; // Optional subcategories
}
