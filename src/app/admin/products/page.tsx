
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getProducts } from "@/lib/products-service";
import type { Product } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogoSpinner } from "@/components/logo-spinner";
import { addImageUploadAction, deleteImageAction } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const productCategories = ['high-tech', 'beauté', 'maison', 'artisanat', 'mode', 'divers'];

type ProductFormData = {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number;
  category: Product['category'];
  brand: string;
  stock: number;
  images: (File | string)[];
  imagePublicIds: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    longDescription: "",
    price: 0,
    originalPrice: 0,
    category: "divers",
    brand: "",
    stock: 0,
    images: [],
    imagePublicIds: [],
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
  
  useEffect(() => {
    if (editingProduct) {
        setProductForm({
            name: editingProduct.name,
            description: editingProduct.description,
            longDescription: editingProduct.longDescription || "",
            price: editingProduct.price,
            originalPrice: editingProduct.originalPrice || 0,
            category: editingProduct.category,
            brand: editingProduct.brand,
            stock: editingProduct.stock,
            images: editingProduct.images,
            imagePublicIds: editingProduct.imagePublicIds || [],
        });
    } else {
        resetForm();
    }
  }, [editingProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleCategoryChange = (value: Product['category']) => {
    setProductForm((prev) => ({ ...prev, category: value }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProductForm((prev) => ({ ...prev, images: [...prev.images, ...Array.from(e.target.files!)] }));
    }
  };
  
  const removeImage = (imageToRemove: string | File, index: number) => {
    setProductForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        // If it's an existing image (string url), we might need to handle its public_id for deletion
    }));
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      longDescription: "",
      price: 0,
      originalPrice: 0,
      category: "divers",
      brand: "",
      stock: 0,
      images: [],
      imagePublicIds: [],
    });
    setEditingProduct(null);
  }

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand || productForm.price <= 0 || productForm.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Marque, Prix, Images).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
        const newImagesToUpload = productForm.images.filter(img => typeof img !== 'string') as File[];
        const existingImageUrls = productForm.images.filter(img => typeof img === 'string') as string[];
        let uploadedImages: { secure_url: string, public_id: string }[] = [];

        if (newImagesToUpload.length > 0) {
            const imageFormData = new FormData();
            for (const image of newImagesToUpload) {
                imageFormData.append('images', image);
            }
            uploadedImages = await addImageUploadAction(imageFormData, 'products');
        }
        
        const finalImageUrls = [...existingImageUrls, ...uploadedImages.map(img => img.secure_url)];
        const finalPublicIds = [
            ...(editingProduct?.imagePublicIds.filter(id => 
                editingProduct.images.some((url, index) => productForm.images.includes(url) && editingProduct.imagePublicIds[index] === id)
            ) || []),
            ...uploadedImages.map(img => img.public_id)
        ];


        const productData = {
            name: productForm.name,
            description: productForm.description,
            longDescription: productForm.longDescription,
            price: productForm.price,
            originalPrice: productForm.originalPrice > 0 ? productForm.originalPrice : null,
            category: productForm.category,
            brand: productForm.brand,
            stock: productForm.stock,
            images: finalImageUrls,
            imagePublicIds: finalPublicIds,
        };

        if (editingProduct) {
            const productRef = doc(db, "products", editingProduct.id);
            await updateDoc(productRef, productData);
            toast({ title: "Succès", description: "Le produit a été mis à jour." });
        } else {
            await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp(), rating: 0, reviews: 0, });
            toast({ title: "Succès", description: "Le produit a été ajouté." });
        }
      
        handleCloseDialog();
        fetchProducts();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
        try {
            if (product.imagePublicIds) {
                await deleteImageAction(product.imagePublicIds);
            }
            await deleteDoc(doc(db, "products", product.id));

            toast({ title: "Succès", description: "Le produit a été supprimé." });
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Une erreur est survenue lors de la suppression.", variant: "destructive" });
        }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestion des Produits</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des produits</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40"><LogoSpinner className="h-8 w-8" /></div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image src={product.images[0]} alt={product.name} width={80} height={80} className="rounded-md object-cover" />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.price.toLocaleString('fr-FR')} FCFA - Stock: {product.stock}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Ouvrir le menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(product)}><Pencil className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive hover:text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-1">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nom</Label><Input id="name" name="name" value={productForm.name} onChange={handleInputChange} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description courte</Label><Textarea id="description" name="description" value={productForm.description} onChange={handleInputChange} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="longDescription" className="text-right">Description longue</Label><Textarea id="longDescription" name="longDescription" value={productForm.longDescription} onChange={handleInputChange} className="col-span-3" rows={5} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="price">Prix (FCFA)</Label><Input id="price" name="price" type="number" value={productForm.price} onChange={handleNumberInputChange} required /></div>
                <div className="grid gap-2"><Label htmlFor="originalPrice">Prix d'origine (FCFA)</Label><Input id="originalPrice" name="originalPrice" type="number" value={productForm.originalPrice} onChange={handleNumberInputChange} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="category">Catégorie</Label>
                    <Select value={productForm.category} onValueChange={handleCategoryChange}><SelectTrigger id="category"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                        <SelectContent>{productCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label htmlFor="brand">Marque</Label><Input id="brand" name="brand" value={productForm.brand} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" value={productForm.stock} onChange={handleNumberInputChange} required /></div>
              <div className="grid gap-2"><Label htmlFor="images">Images</Label>
                <Input id="images" name="images" type="file" onChange={handleFileChange} className="col-span-3" accept="image/*" multiple />
                <div className="col-span-4 flex flex-wrap gap-2 mt-2">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image 
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                        alt={`Aperçu ${index+1}`} 
                        width={80} 
                        height={80} 
                        className="rounded-md object-cover" 
                        onLoad={img => typeof image !== 'string' && URL.revokeObjectURL(img.currentTarget.src)}
                      />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(image, index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}{editingProduct ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
