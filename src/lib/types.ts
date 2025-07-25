
export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  images: string[];
  price: number;
  originalPrice?: number;
  category: 'high-tech' | 'beauté' | 'maison' | 'artisanat' | 'mode' | 'divers';
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  tags?: ('Nouveautés' | 'Offres flash' | 'Produits tendance')[];
  attributes?: { [key: string]: string };
};

export type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  comment: string;
};

export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  publicId: string;
  buttonText?: string;
  href?: string;
  createdAt: any;
};

export type SlideInput = {
    title: string;
    subtitle: string;
    image: File;
}
