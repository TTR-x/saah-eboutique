
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { testimonials } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';
import { getSlides } from '@/lib/slides-service';
import { getProducts } from '@/lib/products-service';
import type { Slide, Product } from '@/lib/types';


export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedSlides, fetchedProducts] = await Promise.all([
          getSlides(),
          getProducts()
        ]);
        setSlides(fetchedSlides);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const newArrivals = products
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
    
  const flashSales = products.filter(p => p.tags?.includes('Offres flash')).slice(0, 4);
  const trendingProducts = products.sort((a,b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
          >
            <CarouselContent>
              {isLoading && slides.length === 0 ? (
                <CarouselItem>
                  <div className="relative h-[60vh] md:h-[80vh] bg-muted flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                  </div>
                </CarouselItem>
              ) : (
                slides.map((slide, index) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative h-[60vh] md:h-[80vh]">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white p-4">
                          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{slide.title}</h1>
                          <p className="mt-4 text-lg md:text-xl max-w-2xl">{slide.subtitle}</p>
                          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={"/products"}>{slide.buttonText || "Explorer"}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          </Carousel>
        </section>
        
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 space-y-16">
          {isLoading ? (
            <div className="flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>
          ) : (
            <>
              <ProductSection title="Nouveautés" products={newArrivals} href="/products?sort=newest" />
              <ProductSection title="Offres Flash" products={flashSales} href="/products?tag=Offres+flash" />
              <ProductSection title="Produits Tendance" products={trendingProducts} href="/products?sort=trending" />
            </>
          )}

          <section>
            <h2 className="text-3xl font-bold text-center mb-10">Ce que nos clients disent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person" />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                        ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const ProductSection = ({ title, products: productList, href }: { title: string; products: any[]; href: string }) => {
  if (!productList || productList.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button asChild variant="link" className="text-accent">
          <Link href={href}>
            Voir plus <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
