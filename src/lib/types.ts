
export type Product = {
  id: string;
  sku?: string;
  name: string;
  description: string;
  images: string[];
  imagePublicIds: string[];
  price: number;
  category: 'high-tech' | 'beauté' | 'maison' | 'artisanat' | 'mode' | 'divers';
  brand?: string;
  status: 'active' | 'inactive';
  allowDelivery: boolean;
  deliveryFees?: number;
  rating: number;
  reviews: number;
  tags?: string[];
  attributes?: { [key: string]: string };
  createdAt: any;
  // Nouvelles options de paiement
  allowInstallments?: boolean;
  installmentPrice?: number;
  installmentMonths?: number;
  isTontine?: boolean;
  tontineDuration?: string; // ex: "6 mois", "1 an"
  tontineDailyRate?: number; // Somme par jour
};

export type PaymentHistoryEntry = {
  amount: number;
  date: any;
  transferId?: string;
  status: string;
};

export type Order = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  productId: string;
  productSku?: string;
  productName: string;
  productImage: string;
  amount: number; // Somme du versement actuel/prochain
  paymentMode: 'cash' | 'installments' | 'tontine';
  status: 'pending' | 'validated' | 'completed' | 'cancelled' | 'payment_pending' | 'rejected';
  transferId?: string;
  paymentValidatedAt?: any;
  lastPaymentValidatedAt?: any;
  createdAt: any;
  isDelivery?: boolean;
  address?: string;
  neighborhood?: string;
  totalPrice: number; // Prix total de l'article au moment de l'achat
  remainingAmount: number; // Ce qu'il reste à payer
  paymentHistory?: PaymentHistoryEntry[];
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'client' | 'admin';
  createdAt: any;
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

export type ContactMessage = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: any;
    isRead: boolean;
}

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
