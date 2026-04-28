import type { PostingCategory, PostingSubcategory } from "~/types";

const postingCategories: PostingCategory[] = [
  {
    id: "tech",
    title: "Tech",
    icon: "i-fa-solid:code",
    subcategories: [
      {
        id: "react",
        title: "React",
        icon: "i-fa-brands:react",
        posts: [
          {
            id: "react-hooks-guide",
            title: "React Hooks 완벽 가이드",
            file: "posting/tech/react/react-hooks-guide.md",
            icon: "i-fa-brands:react",
            excerpt: "React Hooks의 동작 원리와 활용법을 상세히 알아봅니다.",
            category: "tech",
            slug: "react-hooks-guide"
          },
          {
            id: "context-api",
            title: "React Context API 활용하기",
            file: "posting/tech/react/context-api.md",
            icon: "i-fa-brands:react",
            excerpt: "React Context API를 사용한 전역 상태 관리 패턴과 최적화 방법.",
            category: "tech",
            slug: "context-api"
          }
        ]
      },
      {
        id: "typescript",
        title: "TypeScript",
        icon: "i-simple-icons:typescript",
        posts: [
          {
            id: "typescript-advanced",
            title: "TypeScript 고급 기법",
            file: "posting/tech/typescript/typescript-advanced.md",
            icon: "i-simple-icons:typescript",
            excerpt: "TypeScript의 고급 타입과 패턴을 활용한 타입 안전성 향상 방법.",
            category: "tech",
            slug: "typescript-advanced"
          },
          {
            id: "generics-guide",
            title: "TypeScript Generics 완벽 가이드",
            file: "posting/tech/typescript/generics-guide.md",
            icon: "i-simple-icons:typescript",
            excerpt:
              "TypeScript의 제네릭을 활용한 타입 안전한 재사용 가능한 코드 작성법.",
            category: "tech",
            slug: "generics-guide"
          }
        ]
      },
      {
        id: "rust",
        title: "Rust",
        icon: "i-simple-icons:rust",
        posts: [
          {
            id: "ownership-guide",
            title: "Rust Ownership 시스템 이해하기",
            file: "posting/tech/rust/ownership-guide.md",
            icon: "i-simple-icons:rust",
            excerpt:
              "Rust의 핵심 개념인 Ownership, Borrowing, Lifetime을 깊이 있게 알아봅니다.",
            category: "tech",
            slug: "ownership-guide"
          },
          {
            id: "async-await",
            title: "Rust Async/Await 비동기 프로그래밍",
            file: "posting/tech/rust/async-await.md",
            icon: "i-simple-icons:rust",
            excerpt: "Rust의 async/await를 사용한 효율적인 비동기 프로그래밍 패턴.",
            category: "tech",
            slug: "async-await"
          }
        ]
      }
    ]
  },
  {
    id: "life",
    title: "Life",
    icon: "i-fa-solid:heart",
    posts: [
      {
        id: "how_to_prevent_burnout",
        title: "번아웃을 방지하는 방법",
        file: "posting/life/how_to_prevent_burnout.md",
        icon: "i-fa-solid:lightbulb",
        excerpt: "번아웃을 방지하는 방법에 대한 고찰",
        category: "life",
        slug: "how_to_prevent_burnout"
      },
      {
        id: "short_form_society",
        title: "見賢思齊(견현사제)를 위배하는 숏폼 사회",
        file: "posting/life/short_form_society.md",
        icon: "i-fa-solid:lightbulb",
        excerpt: "숏폼 컨텐츠가 즐비한 현대 사회 문제에 대한 고찰",
        category: "life",
        slug: "short_form_society"
      }
    ]
  },
  {
    id: "review",
    title: "Review",
    icon: "i-fa-solid:book",
    posts: [
      {
        id: "clean-code-review",
        title: "클린 코드 독후감",
        file: "posting/review/clean-code-review.md",
        icon: "i-fa-solid:book-open",
        excerpt: "로버트 C. 마틴의 클린 코드를 읽고 느낀 점.",
        category: "review",
        slug: "clean-code-review"
      }
    ]
  }
];

export default postingCategories;

// Helper function to get all posts
export const getAllPosts = () => {
  return postingCategories.flatMap((category) => {
    if (category.subcategories) {
      return category.subcategories.flatMap((sub) => sub.posts);
    }
    return category.posts || [];
  });
};

// Helper function to get posts by category
export const getPostsByCategory = (categoryId: string) => {
  const category = postingCategories.find((cat) => cat.id === categoryId);
  return category?.posts || [];
};

// Helper function to get posts by subcategory
export const getPostsBySubcategory = (categoryId: string, subcategoryId: string) => {
  const category = postingCategories.find((cat) => cat.id === categoryId);
  if (!category?.subcategories) return [];

  const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId);
  return subcategory?.posts || [];
};

// Helper function to get a single post
export const getPostBySlug = (categoryId: string, slug: string) => {
  const category = postingCategories.find((cat) => cat.id === categoryId);

  if (category?.subcategories) {
    // Search in all subcategories
    for (const subcategory of category.subcategories) {
      const post = subcategory.posts.find((p) => p.slug === slug);
      if (post) return post;
    }
    return undefined;
  }

  const posts = category?.posts || [];
  return posts.find((post) => post.slug === slug);
};

// Helper function to get subcategories
export const getSubcategories = (categoryId: string) => {
  const category = postingCategories.find((cat) => cat.id === categoryId);
  return category?.subcategories || [];
};
