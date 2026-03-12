
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  PlusCircle, 
  Send, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Home, 
  Ship, 
  LifeBuoy, 
  Package,
  Search,
  ShoppingCart as CartIcon,
  User
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products-service';
import { getTestimonials, addTestimonial } from '@/lib/testimonials-service';
import type { Product, Testimonial } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

function ReviewStars({ rating, onRatingChange, readOnly = false }: { rating: number, onRatingChange?: (rating: number) => void, readOnly?: boolean }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverRating || rating);
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${isFilled ? 'text-primary fill-primary' : 'text-gray-300'} ${!readOnly ? 'cursor-pointer' : ''}`}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
          />
        )
      })}
    </div>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', comment: '', rating: 0 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { handleLinkClick } = useNavigation();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedTestimonials] = await Promise.all([
          getProducts(),
          getTestimonials()
        ]);
        setProducts(fetchedProducts);
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment || newReview.rating === 0) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive'});
      return;
    }
    setIsSubmittingReview(true);

    try {
       await addTestimonial(newReview);
       toast({ title: 'Avis ajouté !', description: 'Merci pour votre retour.' });
       const updatedTestimonials = await getTestimonials();
       setTestimonials(updatedTestimonials);
       setIsReviewDialogOpen(false);
       setNewReview({ name: '', role: '', comment: '', rating: 0 });
    } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'avis.', variant: 'destructive'});
    } finally {
        setIsSubmittingReview(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-4">
      {/* Bouton Cadeau Flottant (Petit comme WhatsApp) */}
      <div className="fixed top-20 right-4 z-40 md:right-8">
        <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden shadow-lg border-2 border-primary bg-white animate-bounce hover:animate-none transition-transform cursor-pointer">
          <Image 
            src="/cadeaux.png" 
            alt="Offres Spéciales" 
            fill 
            className="object-contain p-1.5" 
          />
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Barre latérale gauche - Navigation Rapide */}
        <aside className="hidden lg:flex flex-col space-y-2 sticky top-20 self-start h-[calc(100vh-100px)]">
          <div className="flex-1 space-y-2">
            <Link href="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Home className="h-5 w-5" />
              </div>
              Accueil
            </Link>
            <Link href="/products" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
              <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                <Package className="h-5 w-5" />
              </div>
              Catalogue Articles
            </Link>
            <Link href="/import" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
              <div className="bg-green-500/10 p-2 rounded-full text-green-500">
                <Ship className="h-5 w-5" />
              </div>
              Service Import
            </Link>
            <Link href="/support" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
              <div className="bg-yellow-500/10 p-2 rounded-full text-yellow-500">
                <LifeBuoy className="h-5 w-5" />
              </div>
              Centre d'Aide
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="px-2 mb-2 font-bold text-gray-500 text-xs uppercase tracking-wider">Raccourcis</h3>
              <Link href="/cart" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
                <div className="bg-red-500/10 p-1.5 rounded-full">
                  <CartIcon className="h-4 w-4 text-red-500" />
                </div>
                Mon Panier
              </Link>
            </div>
          </div>

          {/* Profil tout en bas */}
          <div className="pt-4 mt-auto border-t border-gray-200">
            <Link href="/login" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all font-bold text-sm text-gray-800">
              <div className="bg-blue-500/10 p-1.5 rounded-full">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              Mon Profil
            </Link>
            <div className="px-2 mt-2 text-[10px] text-gray-400">
              SAAH Business © {new Date().getFullYear()}
            </div>
          </div>
        </aside>

        {/* Flux principal - Articles */}
        <main className="lg:col-span-2 space-y-4">
          
          {/* Barre de recherche compacte (Style Alibaba) */}
          <form onSubmit={handleSearchSubmit} className="relative group mb-6 max-w-md mx-auto">
            <div className="relative flex items-center bg-white rounded-full border-2 border-primary overflow-hidden shadow-sm transition-all focus-within:shadow-md">
              <Search className="absolute left-4 h-4 w-4 text-gray-400" />
              <Input 
                type="search" 
                placeholder="Je cherche un produit..." 
                className="pl-10 pr-24 h-10 border-none bg-transparent focus-visible:ring-0 text-sm" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-0 h-10 px-6 rounded-l-none rounded-r-full bg-primary text-black font-black hover:bg-primary/90 text-xs"
              >
                Rechercher
              </Button>
            </div>
          </form>

          {/* Bannière de confiance / Badges rapides */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
            <Badge variant="outline" className="bg-white border-none shadow-sm h-10 px-4 rounded-full font-bold flex items-center gap-2 shrink-0">
              <ShieldCheck className="h-4 w-4 text-green-500" /> Sécurisé
            </Badge>
            <Badge variant="outline" className="bg-white border-none shadow-sm h-10 px-4 rounded-full font-bold flex items-center gap-2 shrink-0">
              <Users className="h-4 w-4 text-blue-500" /> Collectif
            </Badge>
            <Badge variant="outline" className="bg-white border-none shadow-sm h-10 px-4 rounded-full font-bold flex items-center gap-2 shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" /> Croissance
            </Badge>
          </div>

          {/* Grille d'articles Style Alibaba */}
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <LogoSpinner className="h-10 w-10 text-primary" />
              <p className="text-gray-500 font-bold">Mise à jour des offres...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4 opacity-20" />
                  <p className="text-gray-500 font-bold">Aucun article disponible.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Barre latérale droite - Widgets & Témoignages */}
        <aside className="hidden lg:block space-y-6 sticky top-20 self-start">
          
          {/* Widget Importation */}
          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-500 text-[11px] mb-3 uppercase tracking-widest">Service Source Directe</h3>
              <div className="group cursor-pointer">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-gray-50">
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Ship className="h-12 w-12 text-primary opacity-50" />
                  </div>
                </div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Importation Chine Express</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">Trouvez vos produits au meilleur prix directement à la source.</p>
                <Button asChild variant="secondary" size="sm" className="w-full mt-3 rounded-lg font-bold bg-gray-100 hover:bg-primary hover:text-black transition-all">
                  <Link href="/import">Faire une demande</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Témoignages */}
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-gray-500 text-[11px] uppercase tracking-widest">Avis Clients</h3>
              <Button variant="ghost" size="sm" className="h-7 text-primary font-bold text-xs hover:bg-primary/5" asChild>
                <Link href="/#testimonials">Tous</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="flex gap-3 px-2">
                  <Avatar className="h-10 w-10 shrink-0 border border-gray-100">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-gray-800 truncate">{testimonial.name}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 italic">"{testimonial.comment}"</p>
                    <div className="mt-1">
                      <ReviewStars rating={testimonial.rating || 5} readOnly />
                    </div>
                  </div>
                </div>
              ))}
              
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-lg border-gray-200 text-gray-800 font-bold text-sm h-10 mt-2 bg-white hover:bg-gray-50 shadow-sm transition-all">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un avis
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Votre expérience compte</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="review-name" className="text-sm font-bold">Nom complet</Label>
                            <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Jean Dupont" className="rounded-lg" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Note</Label>
                          <div className="mt-1">
                            <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-comment" className="text-sm font-bold">Message</Label>
                            <Textarea id="review-comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Dites-nous ce que vous en pensez..." className="rounded-lg min-h-[100px]" required />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full bg-primary font-bold rounded-lg text-black" disabled={isSubmittingReview}>
                                {isSubmittingReview ? <LogoSpinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                Publier l'avis
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="px-2 pt-4 text-[10px] text-gray-400 space-x-2 leading-relaxed uppercase tracking-tighter">
            <Link href="/" className="hover:underline">Confidentialité</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Conditions</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Publicité</Link>
            <div className="mt-1">SAAH Business © {new Date().getFullYear()}</div>
          </div>
        </aside>

      </div>
    </div>
  );
}
