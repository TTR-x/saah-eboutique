'use client';

import Link from 'next/link';
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
  ArrowRight, 
  MessageSquare,
  Package,
  Search
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { LogoIcon } from '@/components/layout/logo-icon';
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
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      if (query.trim()) {
        router.push(`/products?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-4">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Navigation Rapide */}
        <aside className="hidden lg:block space-y-2 sticky top-20 self-start">
          <Link href="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] transition-all font-bold text-sm text-[#1c1e21]">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Home className="h-5 w-5" />
            </div>
            Accueil
          </Link>
          <Link href="/products" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] transition-all font-bold text-sm text-[#1c1e21]">
            <div className="bg-blue-500/10 p-2 rounded-full text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            Plans de Tontine
          </Link>
          <Link href="/import" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] transition-all font-bold text-sm text-[#1c1e21]">
            <div className="bg-green-500/10 p-2 rounded-full text-green-500">
              <Ship className="h-5 w-5" />
            </div>
            Service Import
          </Link>
          <Link href="/support" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] transition-all font-bold text-sm text-[#1c1e21]">
            <div className="bg-yellow-500/10 p-2 rounded-full text-yellow-500">
              <LifeBuoy className="h-5 w-5" />
            </div>
            Centre d'Aide
          </Link>
          <div className="pt-4 mt-4 border-t border-[#dddfe2]">
            <h3 className="px-2 mb-2 font-bold text-[#65676b] text-sm uppercase tracking-wider">Raccourcis</h3>
            <Link href="/cart" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] transition-all font-bold text-sm text-[#1c1e21]">
              🛒 Mon Panier
            </Link>
          </div>
        </aside>

        {/* Center Main Feed - Flux de Publications */}
        <main className="lg:col-span-2 space-y-4">
          
          {/* Box de Recherche / Création Style Facebook */}
          <Card className="border border-[#dddfe2] shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#65676b] group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Besoin d'un plan d'épargne ? Recherchez ici..." 
                    className="pl-12 h-11 bg-[#f0f2f5] border-none rounded-full text-[15px] focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                    onKeyDown={handleSearch}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 border-t border-[#f0f2f5] pt-2">
                <Button variant="ghost" className="flex-1 h-10 gap-2 font-bold text-[#65676b] rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  Sécurisé
                </Button>
                <Button variant="ghost" className="flex-1 h-10 gap-2 font-bold text-[#65676b] rounded-lg" onClick={() => router.push('/products')}>
                  <Users className="h-5 w-5 text-[#1877f2]" />
                  Collectif
                </Button>
                <Button variant="ghost" className="flex-1 h-10 gap-2 font-bold text-[#65676b] rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Croissance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed Content */}
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <LogoSpinner className="h-10 w-10 text-primary" />
              <p className="text-[#65676b] font-bold">Chargement de votre flux...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {products.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-[#dddfe2] shadow-sm">
                  <Package className="mx-auto h-12 w-12 text-[#65676b] mb-4 opacity-20" />
                  <p className="text-[#65676b] font-bold">Aucune actualité pour le moment.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar - Widgets & Témoignages */}
        <aside className="hidden lg:block space-y-6 sticky top-20 self-start">
          
          {/* Widget Sponsorisé / Import */}
          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-4">
              <h3 className="font-bold text-[#65676b] text-sm mb-3">SERVICES SAAH</h3>
              <div className="space-y-4">
                <div className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-[#f0f2f5]">
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <Ship className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </div>
                  <h4 className="font-bold text-sm group-hover:underline">Importation Chine Express</h4>
                  <p className="text-xs text-[#65676b] mt-1 line-clamp-2">Trouvez vos produits au meilleur prix directement à la source.</p>
                  <Button asChild variant="secondary" size="sm" className="w-full mt-3 rounded-lg font-bold bg-[#f2f3f5] hover:bg-primary hover:text-white transition-all">
                    <Link href="/import">En savoir plus</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Témoignages Style "Suggestions" */}
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-[#65676b] text-sm uppercase">Communauté</h3>
              <Button variant="ghost" size="sm" className="h-7 text-primary font-bold text-xs hover:bg-primary/5" asChild>
                <Link href="/#testimonials">Tout voir</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="flex gap-3 px-2 group cursor-default">
                  <Avatar className="h-10 w-10 shrink-0 border border-[#dddfe2]">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-[#1c1e21] truncate">{testimonial.name}</p>
                    <p className="text-xs text-[#65676b] line-clamp-2 italic">"{testimonial.comment}"</p>
                    <div className="mt-1">
                      <ReviewStars rating={testimonial.rating || 5} readOnly />
                    </div>
                  </div>
                </div>
              ))}
              
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full rounded-lg border-[#dddfe2] text-[#1c1e21] font-bold text-sm h-10 mt-2 bg-white hover:bg-[#f2f3f5]">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Témoigner
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Partagez votre expérience</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="review-name" className="text-sm font-bold">Votre nom complet</Label>
                            <Input id="review-name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} placeholder="Jean Dupont" className="rounded-lg" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Votre note</Label>
                          <div className="mt-1">
                            <ReviewStars rating={newReview.rating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-comment" className="text-sm font-bold">Votre témoignage</Label>
                            <Textarea id="review-comment" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Dites-nous ce que vous pensez de nos plans..." className="rounded-lg min-h-[100px]" required />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full bg-primary font-bold rounded-lg" disabled={isSubmittingReview}>
                                {isSubmittingReview ? <LogoSpinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                Publier mon avis
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Footer Side Links */}
          <div className="px-2 pt-4 text-[12px] text-[#65676b] space-x-2 leading-relaxed">
            <Link href="/" className="hover:underline">Confidentialité</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Conditions</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Publicité</Link>
            <span>·</span>
            <span>SAAH Business © {new Date().getFullYear()}</span>
          </div>
        </aside>

      </div>
    </div>
  );
}
