/** Menu item as returned by the API. */
export type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
};
