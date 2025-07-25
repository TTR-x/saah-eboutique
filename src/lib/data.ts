import type { Product, Testimonial } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Casque Audio Pro-X',
    description: 'Son immersif et annulation de bruit active.',
    longDescription: 'Le Casque Audio Pro-X offre une expérience sonore inégalée avec sa technologie d\'annulation de bruit active de pointe. Conçu pour le confort, il est parfait pour les longues sessions d\'écoute. Autonomie de 40 heures.',
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    price: 249.99,
    category: 'high-tech',
    brand: 'TechBrand',
    stock: 15,
    rating: 5,
    reviews: 120,
    tags: ['Nouveautés', 'Produits tendance'],
    attributes: { 'Couleur': 'Noir sidéral', 'Connectivité': 'Bluetooth 5.2' }
  },
  {
    id: '2',
    name: 'Sérum Éclat Vitalité',
    description: 'Hydratation intense pour une peau radieuse.',
    longDescription: 'Notre Sérum Éclat Vitalité est enrichi en vitamine C et acide hyaluronique pour combattre les signes de fatigue et redonner de l\'éclat à votre peau. Convient à tous les types de peau.',
    images: ['https://placehold.co/600x600.png'],
    price: 45.50,
    category: 'beauté',
    brand: 'BeautyEssence',
    stock: 50,
    rating: 4,
    reviews: 88,
    tags: ['Produits tendance']
  },
  {
    id: '3',
    name: 'Lampe de Bureau LED "Archi"',
    description: 'Design moderne et éclairage ajustable.',
    longDescription: 'La lampe Archi allie esthétique minimaliste et fonctionnalité. Avec ses multiples niveaux d\'intensité et températures de couleur, elle s\'adapte à tous vos besoins, que ce soit pour travailler ou vous détendre.',
    images: ['https://placehold.co/600x600.png'],
    price: 89.90,
    originalPrice: 119.90,
    category: 'maison',
    brand: 'HomeStyle',
    stock: 32,
    rating: 5,
    reviews: 45,
    tags: ['Offres flash']
  },
  {
    id: '4',
    name: 'Vase en Céramique Fait Main',
    description: 'Pièce unique pour une décoration authentique.',
    longDescription: 'Chaque vase est tourné et peint à la main par nos artisans partenaires. Ses motifs uniques apporteront une touche d\'originalité et de chaleur à votre intérieur.',
    images: ['https://placehold.co/600x600.png'],
    price: 65.00,
    category: 'artisanat',
    brand: 'Artisans du Monde',
    stock: 10,
    rating: 5,
    reviews: 32
  },
  {
    id: '5',
    name: 'T-shirt "Urban Explorer"',
    description: '100% coton bio, doux et résistant.',
    longDescription: 'Le t-shirt parfait pour vos aventures urbaines. Fabriqué en coton biologique certifié, il offre un confort exceptionnel et une coupe moderne qui s\'adapte à tous les styles.',
    images: ['https://placehold.co/600x600.png'],
    price: 35.00,
    category: 'mode',
    brand: 'UrbanWear',
    stock: 120,
    rating: 4,
    reviews: 210,
    tags: ['Produits tendance'],
    attributes: { 'Taille': 'S, M, L, XL', 'Couleur': 'Blanc, Noir, Kaki' }
  },
  {
    id: '6',
    name: 'Montre Connectée "Chrono-Fit"',
    description: 'Suivi d\'activité, GPS et notifications.',
    longDescription: 'La Chrono-Fit est votre alliée santé et performance. Elle suit votre fréquence cardiaque, vos pas, votre sommeil et bien plus. Son écran AMOLED est lisible même en plein soleil.',
    images: ['https://placehold.co/600x600.png'],
    price: 189.99,
    category: 'high-tech',
    brand: 'TechBrand',
    stock: 25,
    rating: 4,
    reviews: 95,
    tags: ['Nouveautés']
  },
  {
    id: '7',
    name: 'Robe d\'Été "Riviera"',
    description: 'Légère et fluide, parfaite pour la saison.',
    longDescription: 'Adoptez un look chic et décontracté avec notre robe Riviera. Son tissu en viscose est incroyablement doux et aéré, idéal pour les journées ensoleillées.',
    images: ['https://placehold.co/600x600.png'],
    price: 79.99,
    originalPrice: 99.99,
    category: 'mode',
    brand: 'ChicCouture',
    stock: 40,
    rating: 5,
    reviews: 65,
    tags: ['Offres flash', 'Produits tendance']
  },
  {
    id: '8',
    name: 'Ensemble de Couteaux de Chef',
    description: 'Acier damassé pour une coupe parfaite.',
    longDescription: 'Élevez votre art culinaire avec cet ensemble de couteaux professionnels. La lame en acier damassé 67 couches garantit un tranchant exceptionnel et une durabilité à toute épreuve.',
    images: ['https://placehold.co/600x600.png'],
    price: 199.00,
    category: 'maison',
    brand: 'KitchenPro',
    stock: 22,
    rating: 5,
    reviews: 78
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Alice Dubois',
    role: 'Cliente Vérifiée',
    avatar: 'https://placehold.co/100x100.png',
    comment: 'Une expérience d\'achat incroyable ! Le site est magnifique, la navigation fluide et mon produit est arrivé en 48h. Je recommande vivement SAAH Business.'
  },
  {
    name: 'Marc Petit',
    role: 'Passionné de Tech',
    avatar: 'https://placehold.co/100x100.png',
    comment: 'Enfin une plateforme qui propose des produits high-tech de qualité avec des descriptions claires. Le casque que j\'ai acheté est une pure merveille.'
  },
  {
    name: 'Sophie Martin',
    role: 'Décoratrice d\'intérieur',
    avatar: 'https://placehold.co/100x100.png',
    comment: 'J\'ai trouvé des pièces artisanales uniques pour mes projets. La qualité est au rendez-vous et le service client est très réactif. Une excellente découverte !'
  },
];

export const faqContent = `
Q: Quels sont les délais de livraison ?
R: Nos délais de livraison standard sont de 2 à 5 jours ouvrés pour la France métropolitaine. Une option de livraison express en 24h est également disponible.

Q: Quelle est votre politique de retour ?
R: Vous disposez de 30 jours à compter de la réception de votre commande pour nous retourner un article s'il ne vous convient pas. L'article doit être dans son état d'origine.

Q: Comment puis-je suivre ma commande ?
R: Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pourrez suivre votre colis en temps réel sur le site du transporteur.

Q: Les paiements sont-ils sécurisés ?
R: Absolument. Toutes les transactions sont cryptées via le protocole SSL. Nous ne stockons aucune information bancaire.

Q: Proposez-vous des cartes cadeaux ?
R: Oui, nous proposons des cartes cadeaux électroniques de différents montants, valables un an sur tout le site.
`;
