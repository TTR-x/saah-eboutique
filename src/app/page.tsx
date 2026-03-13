
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Search,
  ChevronRight,
  Zap
} from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products-service';
import { getSlides } from '@/lib/slides-service';
import type { Product, Slide } from '@/lib/types';
import { LogoSpinner } from '@/components/logo-spinner';
import { useNavigation } from '@/hooks/use-navigation';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import placeholders from '@/app/lib/placeholder-images.json';
import { requestGift } from '@/lib/gifts-service';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const { handleLinkClick } = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedSlides] = await Promise.all([
          getProducts(),
          getSlides()
        ]);
        setProducts(fetchedProducts);
        setSlides(fetchedSlides);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleClaimGift = async () => {
    if (user) {
      try {
        await requestGift(user.uid, user.displayName || 'Client', user.email || '');
        toast({
          title: "Demande envoyée !",
          description: "L'administrateur a été notifié. Vérifiez votre page cadeaux bientôt.",
        });
        router.push('/dashboard/gifts');
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer la demande.",
          variant: "destructive"
        });
      }
    } else {
      router.push('/signup?redirect=/dashboard/gifts');
    }
  };

  const newArrivals = products.slice(0, 4);
  const trendingProducts = products.filter(p => p.reviews > 0).slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section */}
      <section className="bg-card dark:bg-zinc-950 mb-8 border-b">
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative group w-full mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        type="search" 
                        placeholder="Rechercher un article, une marque..." 
                        className="pl-12 h-14 w-full rounded-xl border-2 border-primary/20 focus:border-primary shadow-sm bg-background font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" className="absolute right-2 top-2 h-10 rounded-lg bg-primary text-black font-black hover:bg-primary/90">
                        Trouver
                    </Button>
                </form>

                {/* Carousel */}
                {slides.length > 0 ? (
                    <Carousel 
                        className="w-full rounded-xl overflow-hidden shadow-2xl border-none"
                        plugins={[Autoplay({ delay: 5000 })]}
                    >
                        <CarouselContent>
                            {slides.map((slide) => (
                                <CarouselItem key={slide.id}>
                                    <div className="relative aspect-[21/9] w-full bg-muted">
                                        <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12 text-white">
                                            <h2 className="text-3xl md:text-5xl font-black mb-1 max-w-xl leading-tight uppercase">{slide.title}</h2>
                                            <p className="text-lg md:text-xl font-medium max-w-md opacity-90">{slide.subtitle}</p>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                        <CarouselNext className="right-4 bg-white/20 text-white border-none hover:bg-white hover:text-black" />
                    </Carousel>
                ) : (
                    <div className="w-full aspect-[21/9] rounded-xl bg-muted animate-pulse flex items-center justify-center">
                        <LogoSpinner className="h-10 w-10 text-primary" />
                    </div>
                )}
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Flux */}
        <div className="lg:col-span-3 space-y-12">
          
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

          {/* Banner: Surprise Mobile */}
          <section className="lg:hidden relative rounded-xl overflow-hidden bg-black text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="relative h-48 w-48 shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Image 
                  src={placeholders.tontine_gift.url} 
                  data-ai-hint={placeholders.tontine_gift.hint} 
                  alt="Cadeau" 
                  width={placeholders.tontine_gift.width} 
                  height={placeholders.tontine_gift.height} 
                  className="object-contain relative z-10" 
                />
            </div>
            <div className="text-center md:text-left space-y-4">
                <Badge className="bg-primary text-black font-black border-none px-4 py-1">OFFRE EXCLUSIVE</Badge>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Gagnez un cadeau incroyable !</h2>
                <p className="text-gray-400 font-medium max-w-xl text-lg">Cliquez ci-dessous pour découvrir votre surprise et la réclamer dès maintenant.</p>
                <div className="flex wrap gap-4 justify-center md:justify-start pt-4">
                    <Button onClick={handleClaimGift} size="lg" className="rounded-xl h-14 bg-white text-black font-black hover:bg-gray-100">
                        Réclamer mon cadeau
                    </Button>
                </div>
            </div>
          </section>

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

        {/* Right Sidebar Sticky (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-1 relative">
          <div className="sticky top-24 space-y-8 h-fit">
            <section className="relative rounded-xl overflow-hidden bg-black text-white p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
                <div className="relative h-40 w-40 shrink-0">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <Image 
                      src={placeholders.tontine_gift.url} 
                      data-ai-hint={placeholders.tontine_gift.hint} 
                      alt="Cadeau" 
                      width={placeholders.tontine_gift.width} 
                      height={placeholders.tontine_gift.height} 
                      className="object-contain relative z-10" 
                    />
                </div>
                <div className="space-y-4">
                    <Badge className="bg-primary text-black font-black border-none px-4 py-1">OFFRE EXCLUSIVE</Badge>
                    <h2 className="text-2xl font-black tracking-tight leading-tight">Gagnez un Cadeau Incroyable !</h2>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed">
                    C'est votre jour de chance. Cliquez ici pour obtenir votre récompense spéciale SAAH Business.
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Button onClick={handleClaimGift} size="lg" className="rounded-xl h-12 bg-white text-black font-black hover:bg-gray-100 w-full">
                            Réclamer mon cadeau
                        </Button>
                    </div>
                </div>
            </section>

            <div className="px-4 py-6 text-center space-y-2 opacity-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} SAAH Business</p>
                <p className="text-[10px] text-muted-foreground">Votre partenaire de confiance.</p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
