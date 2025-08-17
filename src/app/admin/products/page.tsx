
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
import { deleteImageAction } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const productCategories = ['high-tech', 'beauté', 'maison', 'artisanat', 'mode', 'divers'];

type ImagePreview = {
  file: File;
  previewUrl: string;
};

type ProductFormData = {
  name: string;
  description: string;
  price: number | '';
  category: Product['category'];
  brand?: string;
  tags?: string[];
  existingImages: string[];
  existingPublicIds: string[];
  newImages: ImagePreview[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: '',
    category: "divers",
    brand: "",
    tags: [],
    existingImages: [],
    existingPublicIds: [],
    newImages: [],
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
       let errorMessage = "Impossible de charger les produits.";
       if (error instanceof Error && (error.message.includes('offline') || error.message.includes('network'))) {
           errorMessage = "Veuillez vérifier votre connexion internet.";
       }
       toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    } finally {
       setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    if (editingProduct) {
        setProductForm({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            category: editingProduct.category,
            brand: editingProduct.brand || "",
            tags: editingProduct.tags || [],
            existingImages: editingProduct.images,
            existingPublicIds: editingProduct.imagePublicIds || [],
            newImages: [],
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
    setProductForm((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
  };
  
  const handleCategoryChange = (value: Product['category']) => {
    setProductForm((prev) => ({ ...prev, category: value }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImagePreviews = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setProductForm(prev => ({ ...prev, newImages: [...prev.newImages, ...newImagePreviews] }));
    }
  };
  
  const removeNewImage = (index: number) => {
    const imageToRemove = productForm.newImages[index];
    URL.revokeObjectURL(imageToRemove.previewUrl);
    setProductForm(prev => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };
  
  const removeExistingImage = (index: number) => {
    const publicIdToDelete = productForm.existingPublicIds[index];
    if (publicIdToDelete) {
        setImagesToDelete(prev => [...prev, publicIdToDelete]);
    }
    setProductForm(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        existingPublicIds: prev.existingPublicIds.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    productForm.newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setProductForm({
      name: "",
      description: "",
      price: '',
      category: "divers",
      brand: "",
      tags: [],
      existingImages: [],
      existingPublicIds: [],
      newImages: [],
    });
    setEditingProduct(null);
    setImagesToDelete([]);
    setSubmissionStatus('');
  }

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
  }

  const uploadImageUnsigned = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    
    const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      throw new Error(`Échec du téléchargement sur Cloudinary: ${errorData.error.message}`);
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Erreur de configuration", description: "Les variables d'environnement Cloudinary ne sont pas définies.", variant: "destructive" });
      return;
    }

    const totalImages = productForm.existingImages.length + productForm.newImages.length;
    if (!productForm.name || productForm.price === '' || Number(productForm.price) <= 0 || totalImages === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Prix, Images).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('Démarrage...');
    try {
        // Handle image deletions from Cloudinary
        if (imagesToDelete.length > 0) {
            setSubmissionStatus("Suppression d'anciennes images...");
            await deleteImageAction(imagesToDelete);
        }

        const uploadedImages: { secure_url: string, public_id: string }[] = [];
        for (let i = 0; i < productForm.newImages.length; i++) {
            const imagePreview = productForm.newImages[i];
            setSubmissionStatus(`Téléchargement image ${i + 1}/${productForm.newImages.length}...`);
            const uploadResult = await uploadImageUnsigned(imagePreview.file);
            uploadedImages.push({
                secure_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            });
        }
        
        setSubmissionStatus("Finalisation...");
        const finalImageUrls = [...productForm.existingImages, ...uploadedImages.map(img => img.secure_url)];
        const finalPublicIds = [...productForm.existingPublicIds, ...uploadedImages.map(img => img.public_id)];
        
        const productData = {
            name: productForm.name,
            description: productForm.description,
            price: Number(productForm.price),
            category: productForm.category,
            images: finalImageUrls,
            imagePublicIds: finalPublicIds,
            brand: productForm.brand || '',
            tags: productForm.tags || [],
            createdAt: serverTimestamp(),
            rating: editingProduct?.rating || 0,
            reviews: editingProduct?.reviews || 0,
            stock: editingProduct?.stock || 100,
        };

        if (editingProduct) {
            const productRef = doc(db, "products", editingProduct.id);
            const { createdAt, ...updateData } = productData;
            await updateDoc(productRef, updateData);
            toast({ title: "Succès", description: "Le produit a été mis à jour." });
        } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: "Succès", description: "Le produit a été ajouté." });
        }
      
        handleCloseDialog();
        fetchProducts();
    } catch (error) {
      console.error("Product submission error:", error);
      let errorMessage = "Une erreur est survenue lors de l'enregistrement du produit.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('offline') || error.message.includes('network')) {
            errorMessage = "La connexion au serveur a échoué. Veuillez vérifier votre connexion internet.";
        } else if (error.message) {
            errorMessage = error.message;
        }
      }
      toast({
        title: "Erreur d'enregistrement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
        try {
            if (product.imagePublicIds && product.imagePublicIds.length > 0) {
                await deleteImageAction(product.imagePublicIds);
            }
            await deleteDoc(doc(db, "products", product.id));

            toast({ title: "Succès", description: "Le produit a été supprimé." });
            fetchProducts();
        } catch (error) {
            let errorMessage = "Une erreur est survenue lors de la suppression.";
            if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('offline') || error.message.includes('network'))) {
                errorMessage = "Échec de la suppression. Vérifiez votre connexion internet.";
            }
            toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
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
                      <p className="text-sm text-muted-foreground">{product.price.toLocaleString('fr-FR')} FCFA</p>
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

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setIsDialogOpen(isOpen)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-1">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nom</Label><Input id="name" name="name" value={productForm.name} onChange={handleInputChange} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Textarea id="description" name="description" value={productForm.description} onChange={handleInputChange} className="col-span-3" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="price">Prix (FCFA)</Label><Input id="price" name="price" type="number" value={productForm.price} onChange={handleNumberInputChange} placeholder="Ex: 15000" required /></div>
                <div className="grid gap-2"><Label htmlFor="category">Catégorie</Label>
                    <Select value={productForm.category} onValueChange={handleCategoryChange}><SelectTrigger id="category"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                        <SelectContent>{productCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2"><Label htmlFor="brand">Marque (facultatif)</Label><Input id="brand" name="brand" value={productForm.brand} onChange={handleInputChange} placeholder="Ex: Samsung" /></div>
                 <div className="grid gap-2"><Label htmlFor="tags">Tags (facultatif)</Label><Input id="tags" name="tags" value={productForm.tags?.join(', ') || ''} onChange={(e) => setProductForm(prev => ({...prev, tags: e.target.value.split(',').map(t => t.trim())}))} placeholder="Ex: Nouveautés, Offres flash" /></div>
               </div>
              <div className="grid gap-2"><Label htmlFor="images">Images</Label>
                <Input id="images" name="images" type="file" onChange={handleFileChange} className="col-span-4" accept="image/*" multiple />
                <div className="col-span-4 flex flex-wrap gap-2 mt-2">
                  {productForm.existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <Image 
                        src={image} 
                        alt={`Image existante ${index+1}`} 
                        width={80} 
                        height={80} 
                        className="rounded-md object-cover" 
                      />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeExistingImage(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {productForm.newImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative">
                      <Image 
                        src={image.previewUrl} 
                        alt={`Aperçu ${index+1}`} 
                        width={80} 
                        height={80} 
                        className="rounded-md object-cover" 
                      />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeNewImage(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}
                {isSubmitting ? submissionStatus : (editingProduct ? 'Enregistrer' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
