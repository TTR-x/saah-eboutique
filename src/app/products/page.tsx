
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getProducts } from '@/lib/products-service';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  
  const allCategories = useMemo(() => ['tous', ...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => ['tous', ...new Set(products.map(p => p.brand))], [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

  const [filters, setFilters] = useState({
    category: 'tous',
    brand: 'tous',
    priceRange: [0, 100000],
    sort: searchParams.get('sort') || 'rating-desc',
  });
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      const newMaxPrice = Math.max(...fetchedProducts.map(p => p.price), 0)
      setFilters(prev => ({
        ...prev,
        priceRange: [0, newMaxPrice > 0 ? newMaxPrice : 100000]
      }));
      setIsLoading(false);
    }
    fetchProducts();
  }, []);
  
  useEffect(() => {
     if (maxPrice > 0) {
        setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
     }
  }, [maxPrice])

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const handleBrandChange = (value: string) => {
    setFilters(prev => ({ ...prev, brand: value }));
  };
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'tous',
      brand: 'tous',
      priceRange: [0, maxPrice > 0 ? maxPrice : 100000],
      sort: 'rating-desc',
    });
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (isLoading) return [];
    
    let filtered = products.filter(product => {
      const categoryMatch = filters.category === 'tous' || product.category === filters.category;
      const brandMatch = filters.brand === 'tous' || product.brand === filters.brand;
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return categoryMatch && brandMatch && priceMatch;
    });

    return filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating-desc': return b.rating - a.rating;
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'trending': return b.reviews - a.reviews;
        default: return 0;
      }
    });
  }, [filters, products, isLoading]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Notre Catalogue</h1>
        <p className="mt-4 text-lg text-muted-foreground">Trouvez le produit parfait pour vous.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-8">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Filtres</h3>
            {isLoading ? (
               <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="category-select" className="text-base">Catégorie</Label>
                  <Select value={filters.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category-select" className="w-full mt-2">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Marque</Label>
                  <RadioGroup value={filters.brand} onValueChange={handleBrandChange} className="mt-2 space-y-1">
                    {allBrands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <RadioGroupItem value={brand} id={`brand-${brand}`} />
                        <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base">Gamme de Prix</Label>
                  <Slider
                    min={0}
                    max={maxPrice > 0 ? maxPrice : 100000}
                    step={1000}
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                    className="mt-4"
                    disabled={maxPrice === 0}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.priceRange[0].toLocaleString('fr-FR')} FCFA</span>
                    <span>{filters.priceRange[1].toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
                <Button onClick={resetFilters} variant="ghost" className="w-full mt-6">Réinitialiser les filtres</Button>
              </div>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">{filteredAndSortedProducts.length} produits trouvés</p>
            <Select value={filters.sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Meilleures notes</SelectItem>
                <SelectItem value="price-asc">Prix: croissant</SelectItem>
                <SelectItem value="price-desc">Prix: décroissant</SelectItem>
                <SelectItem value="newest">Nouveautés</SelectItem>
                <SelectItem value="trending">Tendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
           {isLoading ? (
             <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
            </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p className="text-muted-foreground col-span-full text-center">Aucun produit ne correspond à vos critères de recherche.</p>
                )}
            </div>
           )}
        </main>
      </div>
    </div>
  );
}
