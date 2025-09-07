
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
import { useSearchParams } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';

const FiltersSidebar = ({
  filters,
  searchQuery,
  allCategories,
  allBrands,
  maxPrice,
  handleCategoryChange,
  handleBrandChange,
  handlePriceChange,
  setSearchQuery,
  resetFilters,
  isLoading,
}: {
  filters: any;
  searchQuery: string;
  allCategories: string[];
  allBrands: string[];
  maxPrice: number;
  handleCategoryChange: (value: string) => void;
  handleBrandChange: (value: string) => void;
  handlePriceChange: (value: number[]) => void;
  setSearchQuery: (value: string) => void;
  resetFilters: () => void;
  isLoading: boolean;
}) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="search-input" className="text-base">Recherche</Label>
      <div className="relative mt-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-input"
          type="search"
          placeholder="Rechercher par mot-clé..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

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
      <RadioGroup value={filters.brand} onValueChange={handleBrandChange} className="mt-2 space-y-1 max-h-40 overflow-y-auto">
         {allBrands.map(brand => (
          <div key={brand} className="flex items-center space-x-2">
              <RadioGroupItem value={brand!} id={`brand-desktop-${brand}`} />
              <Label htmlFor={`brand-desktop-${brand}`} className="font-normal">{brand}</Label>
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
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  
  const allCategories = useMemo(() => ['tous', ...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => ['tous', ...new Set(products.filter(p => p.brand).map(p => p.brand as string))], [products]);
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
  }, [maxPrice]);
  
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

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
    setSearchQuery('');
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (isLoading) return [];
    
    let filtered = products.filter(product => {
      const searchMatch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const categoryMatch = filters.category === 'tous' || product.category === filters.category;
      const brandMatch = filters.brand === 'tous' || product.brand === filters.brand;
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return searchMatch && categoryMatch && brandMatch && priceMatch;
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
  }, [filters, products, isLoading, searchQuery]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Notre Catalogue</h1>
        <p className="mt-4 text-lg text-muted-foreground">Trouvez le produit parfait pour vous.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
            <div className="p-6 border rounded-lg bg-card sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Filtres</h3>
                {isLoading ? (
                <LogoSpinner className="h-6 w-6" />
                ) : (
                <FiltersSidebar
                    filters={filters}
                    searchQuery={searchQuery}
                    allCategories={allCategories}
                    allBrands={allBrands}
                    maxPrice={maxPrice}
                    handleCategoryChange={handleCategoryChange}
                    handleBrandChange={handleBrandChange}
                    handlePriceChange={handlePriceChange}
                    setSearchQuery={setSearchQuery}
                    resetFilters={resetFilters}
                    isLoading={isLoading}
                />
                )}
            </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">{filteredAndSortedProducts.length} produits trouvés</p>
            
            <div className="flex items-center gap-2">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrer
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle>Filtres</SheetTitle>
                        </SheetHeader>
                        <div className="p-4 overflow-y-auto">
                        <FiltersSidebar
                            filters={filters}
                            searchQuery={searchQuery}
                            allCategories={allCategories}
                            allBrands={allBrands}
                            maxPrice={maxPrice}
                            handleCategoryChange={handleCategoryChange}
                            handleBrandChange={handleBrandChange}
                            handlePriceChange={handlePriceChange}
                            setSearchQuery={setSearchQuery}
                            resetFilters={resetFilters}
                            isLoading={isLoading}
                        />
                        </div>
                        <SheetFooter className="p-4 border-t">
                            <Button onClick={() => setIsSheetOpen(false)} className="w-full">
                                Appliquer les filtres
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

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
          </div>
           {isLoading ? (
             <div className="flex justify-center items-center h-96">
                <LogoSpinner className="h-12 w-12"/>
            </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p className="text-muted-foreground col-span-full text-center py-10">Aucun produit ne correspond à vos critères de recherche.</p>
                )}
            </div>
           )}
        </main>
      </div>
    </div>
  );
}
