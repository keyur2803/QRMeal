export type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  /** API path e.g. /uploads/menu-items/uuid.jpg */
  imageUrl: string | null;
  price: number;
  prepTime: string;
  calories: string | null;
  dietaryTags: string[];
  customizations: string[];
  isAvailable: boolean;
};
