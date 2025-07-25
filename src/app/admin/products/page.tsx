
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { addProduct, getProducts, deleteProduct } from "@/lib/products-service";
import type { Product } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const productCategories = ['high-tech', 'beauté', 'maison', 'artisanat', 'mode', 'divers'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    longDescription: "",
    price: 0,
    originalPrice: 0,
    category: "divers" as Product['category'],
    brand: "",
    stock: 0,
    images: [] as File[],
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleCategoryChange = (value: Product['category']) => {
    setNewProduct((prev) => ({ ...prev, category: value }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewProduct((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      longDescription: "",
      price: 0,
      originalPrice: 0,
      category: "divers",
      brand: "",
      stock: 0,
      images: [],
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.brand || newProduct.price <= 0 || newProduct.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Marque, Prix, Images).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addProduct({
        ...newProduct,
        originalPrice: newProduct.originalPrice > 0 ? newProduct.originalPrice : undefined,
      });
      toast({
        title: "Succès",
        description: "Le produit a été ajouté avec succès.",
      });
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
        try {
            await deleteProduct(id);
            toast({
                title: "Succès",
                description: "Le produit a été supprimé.",
            });
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la suppression.",
                variant: "destructive",
            });
        }
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestion des Produits</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.price.toLocaleString('fr-FR')} FCFA - Stock: {product.stock}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive hover:text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Aucun produit à afficher pour le moment.</p>
                <p className="text-muted-foreground mt-2">Cliquez sur "Ajouter un produit" pour commencer.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-1">
            <div className="grid gap-4 py-4">
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} className="col-span-3" required />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description courte</Label>
                <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longDescription" className="text-right">Description longue</Label>
                <Textarea id="longDescription" name="longDescription" value={newProduct.longDescription} onChange={handleInputChange} className="col-span-3" rows={5} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="price">Prix (FCFA)</Label>
                    <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleNumberInputChange} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="originalPrice">Prix d'origine (FCFA)</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" value={newProduct.originalPrice} onChange={handleNumberInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={newProduct.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            {productCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="brand">Marque</Label>
                     <Input id="brand" name="brand" value={newProduct.brand} onChange={handleInputChange} required />
                  </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" value={newProduct.stock} onChange={handleNumberInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="images">Images</Label>
                <Input id="images" name="images" type="file" onChange={handleFileChange} className="col-span-3" accept="image/*" required multiple />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={resetForm}>Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
