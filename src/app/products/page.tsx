
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
  allCategories,
  allBrands,
  maxPrice,
  handleCategoryChange,
  handleBrandChange,
  handlePriceChange,
  resetFilters,
}: {
  filters: any;
  allCategories: string[];
  allBrands: string[];
  maxPrice: number;
  handleCategoryChange: (value: string) => void;
  handleBrandChange: (value: string) => void;
  handlePriceChange: (value: number[]) => void;
  resetFilters: () => void;
  isLoading: boolean;
}) => (
  <div className="space-y-6">
    <div>
      <Label htmlFor="category-select" className="text-base font-bold">Catégorie</Label>
      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger id="category-select" className="w-full mt-2 h-11 rounded-md">
          <SelectValue placeholder="Choisir une catégorie" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-none shadow-xl">
          {allCategories.map(cat => (
            <SelectItem key={cat} value={cat} className="rounded-sm">{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <Label className="text-base font-bold">Marque</Label>
      <RadioGroup value={filters.brand} onValueChange={handleBrandChange} className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
         {allBrands.map(brand => (
          <div key={brand} className="flex items-center space-x-2">
              <RadioGroupItem value={brand!} id={`brand-desktop-${brand}`} />
              <Label htmlFor={`brand-desktop-${brand}`} className="font-medium cursor-pointer">{brand}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>

    <div>
      <Label className="text-base font-bold">Budget (FCFA)</Label>
      <Slider
        min={0}
        max={maxPrice > 0 ? maxPrice : 100000}
        step={5000}
        value={filters.priceRange}
        onValueChange={handlePriceChange}
        className="mt-6"
        disabled={maxPrice === 0}
      />
      <div className="flex justify-between text-[10px] font-black text-primary mt-3 uppercase tracking-widest">
        <span>{filters.priceRange[0].toLocaleString('fr-FR')} F</span>
        <span>{filters.priceRange[1].toLocaleString('fr-FR')} F</span>
      </div>
    </div>
    <Button onClick={resetFilters} variant="ghost" className="w-full mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Réinitialiser</Button>
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
    priceRange: [0, 1000000],
    sort: searchParams.get('sort') || 'newest',
  });
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        const newMaxPrice = Math.max(...fetchedProducts.map(p => p.price), 0);
        setFilters(prev => ({
          ...prev,
          priceRange: [0, newMaxPrice > 0 ? newMaxPrice : 1000000]
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
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
      priceRange: [0, maxPrice > 0 ? maxPrice : 1000000],
      sort: 'newest',
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
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl uppercase">Catalogue Articles</h1>
        <p className="mt-4 text-lg text-muted-foreground font-medium">Explorez notre sélection premium et trouvez votre bonheur.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS DESKTOP */}
        <aside className="hidden lg:block lg:col-span-1">
            <div className="p-8 border border-gray-100 dark:border-zinc-800 rounded-md bg-card sticky top-24 shadow-sm">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" /> Filtres
                </h3>
                {isLoading ? (
                    <div className="flex justify-center py-10"><LogoSpinner className="h-8 w-8 text-primary" /></div>
                ) : (
                    <FiltersSidebar
                        filters={filters}
                        allCategories={allCategories}
                        allBrands={allBrands}
                        maxPrice={maxPrice}
                        handleCategoryChange={handleCategoryChange}
                        handleBrandChange={handleBrandChange}
                        handlePriceChange={handlePriceChange}
                        resetFilters={resetFilters}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-3 space-y-8">
          {/* SEARCH BAR (Like Home Page) */}
          <section className="bg-card dark:bg-zinc-900 p-1 rounded-md shadow-sm border border-gray-100 dark:border-zinc-800">
            <form onSubmit={(e) => e.preventDefault()} className="relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                    type="search" 
                    placeholder="Rechercher par nom ou référence (ex: SAAH-...)" 
                    className="pl-12 h-14 w-full rounded-md border-none focus:ring-0 shadow-none bg-transparent font-medium text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="button" className="absolute right-2 top-2 h-10 rounded-sm bg-primary text-black font-black hover:bg-primary/90 hidden sm:block">
                    Trouver
                </Button>
            </form>
          </section>

          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-2">
                {filteredAndSortedProducts.length} articles disponibles
            </p>
            
            <div className="flex items-center gap-2">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden rounded-md font-bold">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrer
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-0 border-none rounded-r-md overflow-hidden">
                        <SheetHeader className="p-6 border-b">
                            <SheetTitle className="text-left font-black uppercase">Filtrer les articles</SheetTitle>
                        </SheetHeader>
                        <div className="p-6 overflow-y-auto">
                            <FiltersSidebar
                                filters={filters}
                                allCategories={allCategories}
                                allBrands={allBrands}
                                maxPrice={maxPrice}
                                handleCategoryChange={handleCategoryChange}
                                handleBrandChange={handleBrandChange}
                                handlePriceChange={handlePriceChange}
                                resetFilters={resetFilters}
                                isLoading={isLoading}
                            />
                        </div>
                        <SheetFooter className="p-6 border-t mt-auto">
                            <Button onClick={() => setIsSheetOpen(false)} className="w-full h-12 rounded-md font-black bg-primary text-black">
                                Appliquer
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <Select value={filters.sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[160px] h-9 rounded-md font-bold border-none bg-background shadow-sm text-xs">
                        <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-none shadow-xl">
                        <SelectItem value="newest" className="text-xs font-medium">Nouveautés</SelectItem>
                        <SelectItem value="rating-desc" className="text-xs font-medium">Mieux notés</SelectItem>
                        <SelectItem value="price-asc" className="text-xs font-medium">Prix croissant</SelectItem>
                        <SelectItem value="price-desc" className="text-xs font-medium">Prix décroissant</SelectItem>
                        <SelectItem value="trending" className="text-xs font-medium">Tendances</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

           {isLoading ? (
             <div className="flex flex-col justify-center items-center h-96 gap-4">
                <LogoSpinner className="h-12 w-12 text-primary"/>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Chargement du catalogue...</p>
            </div>
           ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4 bg-muted/10 rounded-md border-2 border-dashed border-gray-100 dark:border-zinc-800">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-black uppercase">Aucun résultat</p>
                            <p className="text-muted-foreground text-sm">Réessayez avec d'autres mots-clés ou modifiez vos filtres.</p>
                        </div>
                        <Button onClick={resetFilters} variant="link" className="text-primary font-black uppercase tracking-widest text-xs">Tout afficher</Button>
                    </div>
                )}
            </div>
           )}
        </main>
      </div>
    </div>
  );
}
