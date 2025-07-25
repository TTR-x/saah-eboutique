
import type { Product, Testimonial } from './types';

// This file now only contains static data for testimonials and FAQ.
// Products are fetched from Firestore.

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
