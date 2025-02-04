export interface Product {
  name: string;
  details: string;
  inventory: number;
  category: "Jewelry Box" | "Leather Box" | "Cardboard Box" | "Paper Box" | "Paper Bag";
  size: string;
  thickness: string;
  color: string;
  minOrderQuantity: number;
  price: number;
  gstPercentage: number;
  images: string[]; // Array of image URLs
}
