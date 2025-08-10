
export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  images: string[];
  imagePublicIds: string[];
  price: number;
  originalPrice?: number;
  category: 'high-tech' | 'beauté' | 'maison' | 'artisanat' | 'mode' | 'divers';
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  tags?: ('Nouveautés' | 'Offres flash' | 'Produits tendance')[];
  attributes?: { [key: string]: string };
  createdAt: any;
};

export type ProductInput = Omit<Product, 'id' | 'images' | 'imagePublicIds' | 'createdAt' | 'rating' | 'reviews'> & {
  images: File[];
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  createdAt: any;
};

export type TestimonialInput = Omit<Testimonial, 'id' | 'createdAt'>;


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

export type Review = {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: any;
  productName: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'userId' | 'userAvatar'>;

export type ContactMessage = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: any;
    isRead: boolean;
}

export type ContactMessageInput = Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>;

export type ImportOrder = {
    id: string;
    productName: string;
    quantity: string;
    budget?: string;
    description: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: any;
    isRead: boolean;
}

export type ImportOrderInput = Omit<ImportOrder, 'id' | 'createdAt' | 'isRead'>;
