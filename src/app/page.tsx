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
  User,
  LayoutGrid,
  ChevronRight,
  Zap
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products-service';
import { getTestimonials, addTestimonial } from '@/lib/testimonials-service';
import { getSlides } from '@/lib/slides-service';
import type { Product, Testimonial, Slide } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

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
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', comment: '', rating: 0 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { handleLinkClick } = useNavigation();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = user?.email === "saahbusiness2026@gmail.com";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedTestimonials, fetchedSlides] = await Promise.all([
          getProducts(),
          getTestimonials(),
          getSlides()
        ]);
        setProducts(fetchedProducts);
        setTestimonials(fetchedTestimonials);
        setSlides(fetchedSlides);
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

  const newArrivals = products.slice(0, 4);
  const trendingProducts = products.filter(p => p.reviews > 0).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-12">
      {/* Hero Section with Carousel */}
      <section className="bg-white mb-8 border-b">
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block space-y-1">
                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground px-3 mb-4">Navigation</h3>
                    <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-black text-sm">
                        <Home className="h-5 w-5" /> Accueil
                    </Link>
                    <Link href="/products" onClick={handleLinkClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all">
                        <Package className="h-5 w-5" /> Boutique
                    </Link>
                    <Link href="/import" onClick={handleLinkClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all">
                        <Ship className="h-5 w-5" /> Import Chine
                    </Link>
                    <Link href="/support" onClick={handleLinkClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all">
                        <LifeBuoy className="h-5 w-5" /> Centre d'Aide
                    </Link>
                    <div className="pt-4 mt-4 border-t border-dashed">
                        {user ? (
                            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-600 font-black text-sm">
                                <LayoutGrid className="h-5 w-5" /> Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-black text-sm">
                                <User className="h-5 w-5" /> Se connecter
                            </Link>
                        )}
                    </div>
                </aside>

                {/* Carousel and Hero content */}
                <div className="lg:col-span-3 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="relative group max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            type="search" 
                            placeholder="Rechercher un article, une marque..." 
                            className="pl-12 h-14 rounded-2xl border-2 border-primary/20 focus:border-primary shadow-sm bg-white font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" className="absolute right-2 top-2 h-10 rounded-xl bg-primary text-black font-black hover:bg-primary/90">
                            Trouver
                        </Button>
                    </form>

                    {slides.length > 0 ? (
                        <Carousel 
                            className="w-full rounded-[2rem] overflow-hidden shadow-2xl border-none"
                            plugins={[Autoplay({ delay: 5000 })]}
                        >
                            <CarouselContent>
                                {slides.map((slide) => (
                                    <CarouselItem key={slide.id}>
                                        <div className="relative aspect-[21/9] w-full bg-muted">
                                            <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-16 text-white">
                                                <h2 className="text-3xl md:text-5xl font-black mb-4 max-w-xl leading-tight">{slide.title}</h2>
                                                <p className="text-lg md:text-xl font-medium mb-8 max-w-md opacity-90">{slide.subtitle}</p>
                                                <Button asChild size="lg" className="w-fit h-14 px-8 rounded-2xl bg-primary text-black font-black text-lg hover:bg-primary/90 shadow-xl shadow-primary/20">
                                                    <Link href="/products">Découvrir l'offre</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                            <CarouselNext className="right-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                        </Carousel>
                    ) : (
                        <div className="w-full aspect-[21/9] rounded-[2rem] bg-gray-100 animate-pulse flex items-center justify-center">
                            <LogoSpinner className="h-10 w-10 text-primary" />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Flux */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* Section: Ventes Flash / Nouveautés */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white"><Zap className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-black">Nouveautés</h2>
                </div>
                <Link href="/products" className="text-primary font-black text-sm hover:underline flex items-center gap-1">Tout voir <ChevronRight className="h-4 w-4" /></Link>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-12"><LogoSpinner /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
          </section>

          {/* Banner: Tontine (Mobile Only Version) */}
          <section className="lg:hidden relative rounded-[2.5rem] overflow-hidden bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="relative h-48 w-48 shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Image src="/cadeaux.png" alt="Tontine" fill className="object-contain relative z-10" />
            </div>
            <div className="text-center md:text-left space-y-4">
                <Badge className="bg-primary text-black font-black border-none px-4 py-1">ÉPARGNE COLLABORATIVE</Badge>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Le Plan Tontine SAAH</h2>
                <p className="text-gray-400 font-medium max-w-xl text-lg">Acquérez vos articles préférés en douceur grâce à notre système d'épargne en groupe. Pas de stress, juste de la croissance.</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                    <Button asChild size="lg" className="rounded-2xl h-14 bg-white text-black font-black hover:bg-gray-100">
                        <Link href="/products">Voir les articles éligibles</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 border-white/20 text-white font-black hover:bg-white/10">
                        <Link href="/support">Comment ça marche ?</Link>
                    </Button>
                </div>
            </div>
          </section>

          {/* Section: Tendances */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white"><TrendingUp className="h-5 w-5" /></div>
                    <h2 className="text-2xl font-black">Articles Tendances</h2>
                </div>
                <Link href="/products" className="text-primary font-black text-sm hover:underline flex items-center gap-1">Découvrir <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12"><LogoSpinner /></div>
                ) : trendingProducts.length > 0 ? (
                    trendingProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    products.slice(4, 8).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
          </section>
        </div>

        {/* Right Sidebar Widgets (Desktop Only) */}
        <aside className="hidden lg:block space-y-8 sticky top-24">
          <section className="relative rounded-[2.5rem] overflow-hidden bg-black text-white p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
            <div className="relative h-40 w-40 shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Image src="/cadeaux.png" alt="Tontine" fill className="object-contain relative z-10" />
            </div>
            <div className="space-y-4">
                <Badge className="bg-primary text-black font-black border-none px-4 py-1">ÉPARGNE COLLABORATIVE</Badge>
                <h2 className="text-2xl font-black tracking-tight leading-tight">Le Plan Tontine SAAH Business</h2>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  Acquérez vos articles préférés en douceur grâce à notre système d'épargne en groupe.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                    <Button asChild size="lg" className="rounded-2xl h-12 bg-white text-black font-black hover:bg-gray-100 w-full">
                        <Link href="/products">Voir les articles</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-2xl h-12 border-white/20 text-white font-black hover:bg-white/10 w-full">
                        <Link href="/support">En savoir plus</Link>
                    </Button>
                </div>
            </div>
          </section>

          <div className="px-4 py-6 bg-gray-100 rounded-3xl text-center space-y-2">
            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Suivez SAAH Business</p>
            <div className="flex justify-center gap-4 text-gray-400">
                <Link href="#" className="hover:text-primary transition-colors"><LayoutGrid className="h-5 w-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Users className="h-5 w-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Star className="h-5 w-5" /></Link>
            </div>
            <p className="text-[10px] text-gray-400 pt-2">© {new Date().getFullYear()} SAAH. Tous droits réservés.</p>
          </div>
        </aside>

      </div>
    </div>
  );
}
