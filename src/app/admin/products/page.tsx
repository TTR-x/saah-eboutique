
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  allowInstallments: boolean;
  installmentPrice: number | '';
  installmentMonths: number | '';
  isTontine: boolean;
  tontineDuration: string;
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
    allowInstallments: false,
    installmentPrice: '',
    installmentMonths: '',
    isTontine: false,
    tontineDuration: "",
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
       toast({ title: "Erreur", description: "Impossible de charger les produits.", variant: "destructive" });
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
            allowInstallments: editingProduct.allowInstallments || false,
            installmentPrice: editingProduct.installmentPrice || '',
            installmentMonths: editingProduct.installmentMonths || '',
            isTontine: editingProduct.isTontine || false,
            tontineDuration: editingProduct.tontineDuration || "",
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
      allowInstallments: false,
      installmentPrice: '',
      installmentMonths: '',
      isTontine: false,
      tontineDuration: "",
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
      throw new Error(`Échec du téléchargement sur Cloudinary`);
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      toast({ title: "Erreur", description: "Config Cloudinary manquante.", variant: "destructive" });
      return;
    }

    const totalImages = productForm.existingImages.length + productForm.newImages.length;
    if (!productForm.name || productForm.price === '' || totalImages === 0) {
      toast({ title: "Erreur", description: "Remplissez les champs obligatoires.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('Envoi...');
    try {
        if (imagesToDelete.length > 0) {
            await deleteImageAction(imagesToDelete);
        }

        const uploadedImages: { secure_url: string, public_id: string }[] = [];
        for (const img of productForm.newImages) {
            const uploadResult = await uploadImageUnsigned(img.file);
            uploadedImages.push({
                secure_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            });
        }
        
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
            allowInstallments: productForm.allowInstallments,
            installmentPrice: productForm.installmentPrice ? Number(productForm.installmentPrice) : 0,
            installmentMonths: productForm.installmentMonths ? Number(productForm.installmentMonths) : 0,
            isTontine: productForm.isTontine,
            tontineDuration: productForm.tontineDuration || "",
        };

        if (editingProduct) {
            const productRef = doc(db, "products", editingProduct.id);
            const { createdAt, ...updateData } = productData;
            await updateDoc(productRef, updateData);
            toast({ title: "Succès", description: "Produit mis à jour." });
        } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: "Succès", description: "Produit ajouté." });
        }
      
        handleCloseDialog();
        fetchProducts();
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur d'enregistrement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Supprimer ce produit ?")) {
        try {
            if (product.imagePublicIds && product.imagePublicIds.length > 0) {
                await deleteImageAction(product.imagePublicIds);
            }
            await deleteDoc(doc(db, "products", product.id));
            toast({ title: "Succès", description: "Produit supprimé." });
            fetchProducts();
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" });
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
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(product)}><Pencil className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-10"><p className="text-muted-foreground">Aucun produit.</p></div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setIsDialogOpen(isOpen)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1">
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name">Nom</Label><Input id="name" name="name" value={productForm.name} onChange={handleInputChange} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={productForm.description} onChange={handleInputChange} className="col-span-3" required /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="price">Prix Cash (FCFA)</Label><Input id="price" name="price" type="number" value={productForm.price} onChange={handleNumberInputChange} required /></div>
                <div className="grid gap-2"><Label htmlFor="category">Catégorie</Label>
                    <Select value={productForm.category} onValueChange={handleCategoryChange}><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>{productCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-bold text-lg">Options de paiement avancées</h3>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Autoriser le paiement par tranches</Label>
                        <p className="text-xs text-muted-foreground">Permet aux clients de payer en plusieurs fois.</p>
                    </div>
                    <Switch checked={productForm.allowInstallments} onCheckedChange={(val) => setProductForm(p => ({...p, allowInstallments: val}))} />
                </div>

                {productForm.allowInstallments && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary">
                        <div className="grid gap-2"><Label>Prix de la tranche (FCFA)</Label><Input name="installmentPrice" type="number" value={productForm.installmentPrice} onChange={handleNumberInputChange} /></div>
                        <div className="grid gap-2"><Label>Nombre de mois</Label><Input name="installmentMonths" type="number" value={productForm.installmentMonths} onChange={handleNumberInputChange} /></div>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                        <Label>Proposer comme Plan de Tontine</Label>
                        <p className="text-xs text-muted-foreground">Affiche le produit comme un cycle d'épargne.</p>
                    </div>
                    <Switch checked={productForm.isTontine} onCheckedChange={(val) => setProductForm(p => ({...p, isTontine: val}))} />
                </div>

                {productForm.isTontine && (
                    <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-primary">
                        <div className="grid gap-2"><Label>Durée du cycle (ex: 6 mois, 12 mois)</Label><Input name="tontineDuration" value={productForm.tontineDuration} onChange={handleInputChange} /></div>
                    </div>
                )}
              </div>

              <div className="grid gap-2"><Label>Images</Label>
                <Input id="images" name="images" type="file" onChange={handleFileChange} className="col-span-4" accept="image/*" multiple />
                <div className="col-span-4 flex flex-wrap gap-2 mt-2">
                  {productForm.existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <Image src={image} alt="" width={80} height={80} className="rounded-md object-cover" />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeExistingImage(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {productForm.newImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative">
                      <Image src={image.previewUrl} alt="" width={80} height={80} className="rounded-md object-cover" />
                      <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeNewImage(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? submissionStatus : (editingProduct ? 'Enregistrer' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
