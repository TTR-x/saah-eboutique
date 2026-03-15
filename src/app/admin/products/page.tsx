
'use client'

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, X, Copy, Tag as TagIcon, LayoutGrid, Package, CreditCard, Users, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getProducts } from "@/lib/products-service";
import type { Product } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogoSpinner } from "@/components/logo-spinner";
import { deleteImageAction } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  brand: string;
  tags: string;
  status: 'active' | 'inactive';
  allowDelivery: boolean;
  deliveryFees: number | '';
  existingImages: string[];
  existingPublicIds: string[];
  newImages: ImagePreview[];
  allowInstallments: boolean;
  installmentPrice: number | '';
  installmentMonths: number | '';
  isTontine: boolean;
  tontineDuration: string;
  tontineDailyRate: number | '';
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
    tags: "",
    status: 'active',
    allowDelivery: true,
    deliveryFees: '',
    existingImages: [],
    existingPublicIds: [],
    newImages: [],
    allowInstallments: false,
    installmentPrice: '',
    installmentMonths: '',
    isTontine: false,
    tontineDuration: "",
    tontineDailyRate: '',
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
            tags: editingProduct.tags?.join(', ') || "",
            status: editingProduct.status || 'active',
            allowDelivery: editingProduct.allowDelivery ?? true,
            deliveryFees: editingProduct.deliveryFees || '',
            existingImages: editingProduct.images,
            existingPublicIds: editingProduct.imagePublicIds || [],
            newImages: [],
            allowInstallments: editingProduct.allowInstallments || false,
            installmentPrice: editingProduct.installmentPrice || '',
            installmentMonths: editingProduct.installmentMonths || '',
            isTontine: editingProduct.isTontine || false,
            tontineDuration: editingProduct.tontineDuration || "",
            tontineDailyRate: editingProduct.tontineDailyRate || '',
        });
    } else if (!isDialogOpen) {
        resetForm();
    }
  }, [editingProduct, isDialogOpen]);

  // Handle Ctrl+V Paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isDialogOpen) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      addFilesToForm(files);
    }
  }, [isDialogOpen, productForm.existingImages.length, productForm.newImages.length]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const addFilesToForm = (selectedFiles: File[]) => {
    const currentTotal = productForm.existingImages.length + productForm.newImages.length;
    const remainingSlots = 3 - currentTotal;
    
    if (remainingSlots <= 0) {
      toast({ title: "Limite atteinte", description: "Vous ne pouvez pas ajouter plus de 3 images.", variant: "destructive" });
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    
    if (selectedFiles.length > remainingSlots) {
      toast({ 
        title: "Limite atteinte", 
        description: `Seules les ${remainingSlots} premières images ont été ajoutées (Max 3).`,
        variant: "destructive" 
      });
    }

    const newImagePreviews = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setProductForm(prev => ({ ...prev, newImages: [...prev.newImages, ...newImagePreviews] }));
  };

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
      addFilesToForm(Array.from(e.target.files));
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
      tags: "",
      status: 'active',
      allowDelivery: true,
      deliveryFees: '',
      existingImages: [],
      existingPublicIds: [],
      newImages: [],
      allowInstallments: false,
      installmentPrice: '',
      installmentMonths: '',
      isTontine: false,
      tontineDuration: "",
      tontineDailyRate: '',
    });
    setImagesToDelete([]);
    setSubmissionStatus('');
  }

  const handleOpenNew = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  const handleDuplicate = (product: Product) => {
    const duplicated = {
        ...product,
        id: "", 
        name: `${product.name} (Copie)`,
    };
    setEditingProduct(duplicated as any);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    if (!isSubmitting) {
        setIsDialogOpen(false);
        setEditingProduct(null);
    }
  };

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
      toast({ title: "Erreur", description: "Veuillez remplir le nom, le prix et ajouter au moins une image.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('Envoi des données...');
    try {
        if (imagesToDelete.length > 0) {
            await deleteImageAction(imagesToDelete);
        }

        const uploadedImages: { secure_url: string, public_id: string }[] = [];
        for (const img of productForm.newImages) {
            setSubmissionStatus(`Upload image ${uploadedImages.length + 1}/${productForm.newImages.length}...`);
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
            tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(t => t !== "") : [],
            status: productForm.status,
            allowDelivery: productForm.allowDelivery,
            deliveryFees: productForm.deliveryFees === '' ? 0 : Number(productForm.deliveryFees),
            createdAt: serverTimestamp(),
            rating: editingProduct?.rating || 5,
            reviews: editingProduct?.reviews || 0,
            allowInstallments: productForm.allowInstallments,
            installmentPrice: productForm.installmentPrice ? Number(productForm.installmentPrice) : 0,
            installmentMonths: productForm.installmentMonths ? Number(productForm.installmentMonths) : 0,
            isTontine: productForm.isTontine,
            tontineDuration: productForm.tontineDuration || "",
            tontineDailyRate: productForm.tontineDailyRate ? Number(productForm.tontineDailyRate) : 0,
        };

        if (editingProduct && editingProduct.id) {
            const productRef = doc(db, "products", editingProduct.id);
            const { createdAt, ...updateData } = productData;
            await updateDoc(productRef, updateData);
            toast({ title: "Succès", description: "Produit mis à jour." });
        } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: "Succès", description: "Article publié." });
        }
      
        handleCloseDialog();
        fetchProducts();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Échec de l'enregistrement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus('');
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
        try {
            if (product.imagePublicIds && product.imagePublicIds.length > 0) {
                await deleteImageAction(product.imagePublicIds);
            }
            await deleteDoc(doc(db, "products", product.id));
            toast({ title: "Succès", description: "Article supprimé." });
            fetchProducts();
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" });
        }
    }
  };

  const currentTotalImages = productForm.existingImages.length + productForm.newImages.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Catalogue Articles</h2>
            <p className="text-muted-foreground">Gérez vos produits et options de paiement.</p>
        </div>
        <Button onClick={handleOpenNew} className="shadow-lg h-12 px-6 rounded-xl font-bold bg-primary text-black hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Nouvel Article
        </Button>
      </div>

      <Card className="rounded-xl overflow-hidden border-none shadow-sm">
        <CardHeader className="bg-white border-b">
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    Articles en vente ({products.length})
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-60 gap-3">
                    <LogoSpinner className="h-10 w-10 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Chargement du catalogue...</p>
                </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-muted/50">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base">{product.name}</h3>
                        <Badge variant={product.status === 'active' ? 'default' : 'outline'} className={product.status === 'active' ? 'bg-green-500 hover:bg-green-600 border-none' : 'text-muted-foreground'}>
                            {product.status === 'active' ? 'Actif' : 'Masqué'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-1">
                        <span className="text-primary font-bold">{product.price.toLocaleString('fr-FR')} FCFA</span>
                        <span>•</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-none p-2">
                            <DropdownMenuItem onClick={() => handleOpenEdit(product)} className="rounded-md">
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(product)} className="rounded-md">
                                <Copy className="mr-2 h-4 w-4" /> Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-md">
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white">
                <Package className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground font-medium">Votre catalogue est vide.</p>
                <Button variant="link" onClick={handleOpenNew} className="mt-2 text-primary font-bold">Ajouter votre premier produit</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setIsDialogOpen(isOpen)}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-xl shadow-2xl">
          <DialogHeader className="p-6 border-b bg-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {editingProduct?.id ? <Pencil className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
                </div>
                {editingProduct?.id ? 'Modifier l\'article' : 'Publier un nouvel article'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-background">
            <div className="p-6 space-y-8 pb-24">
              
              {/* SECTION 1: INFOS GENERALES */}
              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" /> Informations générales
                </h3>
                <Card className="p-6 border shadow-sm rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-bold">Nom de l'article *</Label>
                            <Input id="name" name="name" value={productForm.name} onChange={handleInputChange} placeholder="Ex: iPhone 15 Pro Max" className="h-12 rounded-md" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-bold">Catégorie *</Label>
                            <Select value={productForm.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="h-12 rounded-md"><SelectValue placeholder="Choisir" /></SelectTrigger>
                                <SelectContent className="rounded-lg border-none shadow-xl">
                                    {productCategories.map(cat => (<SelectItem key={cat} value={cat} className="rounded-md">{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold">Description détaillée *</Label>
                        <Textarea id="description" name="description" value={productForm.description} onChange={handleInputChange} placeholder="Détaillez les caractéristiques, tailles, couleurs..." className="min-h-[120px] rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="font-bold">Marque / Fabricant</Label>
                            <Input id="brand" name="brand" value={productForm.brand} onChange={handleInputChange} placeholder="Ex: Apple, Samsung..." className="h-12 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="font-bold flex items-center gap-2"><TagIcon className="h-3 w-3" /> Tags (séparés par des virgules)</Label>
                            <Input id="tags" name="tags" value={productForm.tags} onChange={handleInputChange} placeholder="Ex: homme, mode, premium" className="h-12 rounded-md" />
                        </div>
                    </div>
                </Card>
              </div>

              {/* SECTION 2: PRIX ET STATUT */}
              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" /> Prix & Visibilité
                </h3>
                <Card className="p-6 border shadow-sm rounded-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="font-bold text-primary">Prix Cash (FCFA) *</Label>
                            <Input id="price" name="price" type="number" value={productForm.price} onChange={handleNumberInputChange} className="h-12 rounded-md bg-primary/5 border-primary/20 font-black text-lg text-primary" required />
                        </div>
                        <div className="flex flex-col justify-end">
                            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 h-12">
                                <Label className="font-bold text-xs">Statut Visible sur le site</Label>
                                <Switch checked={productForm.status === 'active'} onCheckedChange={(val) => setProductForm(p => ({...p, status: val ? 'active' : 'inactive'}))} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-dashed">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="font-black text-base">Autoriser la livraison</Label>
                                <p className="text-xs text-muted-foreground">Permet au client de demander une expédition.</p>
                            </div>
                            <Switch checked={productForm.allowDelivery} onCheckedChange={(val) => setProductForm(p => ({...p, allowDelivery: val}))} />
                        </div>
                        
                        {productForm.allowDelivery && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-4 border-primary animate-in slide-in-from-left duration-300">
                                <div className="space-y-2">
                                    <Label className="font-bold text-sm">Frais de livraison (FCFA)</Label>
                                    <Input name="deliveryFees" type="number" value={productForm.deliveryFees} onChange={handleNumberInputChange} placeholder="Ex: 1500" className="h-10 rounded-md" />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
              </div>

              {/* SECTION 3: OPTIONS DE PAIEMENT AVANCÉES */}
              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Modes d'acquisition avancés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paiement par tranches */}
                    <Card className="p-6 border shadow-sm rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="font-black text-base text-blue-600 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Paiement par tranches
                                </Label>
                                <p className="text-xs text-muted-foreground">Vente échelonnée sur plusieurs mois.</p>
                            </div>
                            <Switch checked={productForm.allowInstallments} onCheckedChange={(val) => setProductForm(p => ({...p, allowInstallments: val}))} />
                        </div>

                        {productForm.allowInstallments && (
                            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-500 animate-in zoom-in-95 duration-200">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Mensualité (FCFA)</Label>
                                    <Input name="installmentPrice" type="number" value={productForm.installmentPrice} onChange={handleNumberInputChange} className="h-10 rounded-md font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Nb de mois</Label>
                                    <Input name="installmentMonths" type="number" value={productForm.installmentMonths} onChange={handleNumberInputChange} className="h-10 rounded-md font-bold" />
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Plan Tontine */}
                    <Card className="p-6 border shadow-sm rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="font-black text-base text-green-600 flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Plan de Tontine
                                </Label>
                                <p className="text-xs text-muted-foreground">Inclure dans un cycle d'épargne collective.</p>
                            </div>
                            <Switch checked={productForm.isTontine} onCheckedChange={(val) => setProductForm(p => ({...p, isTontine: val}))} />
                        </div>

                        {productForm.isTontine && (
                            <div className="space-y-4 pl-4 border-l-2 border-green-500 animate-in zoom-in-95 duration-200">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Durée du cycle (ex: 10 mois)</Label>
                                    <Input name="tontineDuration" value={productForm.tontineDuration} onChange={handleInputChange} placeholder="Ex: 6 mois" className="h-10 rounded-md font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Somme par jour (FCFA)</Label>
                                    <Input name="tontineDailyRate" type="number" value={productForm.tontineDailyRate} onChange={handleNumberInputChange} placeholder="Ex: 500" className="h-10 rounded-md font-bold" />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
              </div>

              {/* SECTION 4: IMAGES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Galerie Photos *
                    </h3>
                    <Badge variant="outline" className={cn("font-bold text-[10px]", currentTotalImages >= 3 ? "text-red-500 border-red-200 bg-red-50" : "text-primary border-primary/20 bg-primary/5")}>
                        {currentTotalImages} / 3 images
                    </Badge>
                </div>
                <Card className="p-4 border shadow-sm rounded-lg bg-muted/10">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide min-h-[120px]">
                        {/* BOUTON AJOUTER (TOUJOURS À GAUCHE) */}
                        {currentTotalImages < 3 && (
                            <div className="flex-shrink-0 w-28 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:bg-primary/5 hover:border-primary transition-all cursor-pointer relative group overflow-hidden bg-white">
                                <Input id="images" name="images" type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" multiple />
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                                    <PlusCircle className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Ajouter</span>
                            </div>
                        )}
                        
                        {/* LISTE DES IMAGES (À LA SUITE DU BOUTON) */}
                        <div className="flex gap-4">
                            {productForm.existingImages.map((image, index) => (
                                <div key={`existing-${index}`} className="flex-shrink-0 relative w-28 h-28 rounded-xl overflow-hidden border shadow-sm group bg-white">
                                    <Image src={image} alt="" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button type="button" size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => removeExistingImage(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="absolute top-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-full uppercase font-bold">Existant</span>
                                </div>
                            ))}
                            {productForm.newImages.map((image, index) => (
                                <div key={`new-${index}`} className="flex-shrink-0 relative w-28 h-28 rounded-xl overflow-hidden border-2 border-primary shadow-sm group bg-white">
                                    <Image src={image.previewUrl} alt="" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button type="button" size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => removeNewImage(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="absolute top-1 left-1 bg-primary text-[8px] text-black px-1.5 py-0.5 rounded-full uppercase font-bold">Nouveau</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 border-t border-dashed pt-3 flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-medium italic flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> Astuce : Collez une image directement avec <strong>Ctrl + V</strong>
                        </p>
                        {currentTotalImages >= 3 && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Limite atteinte (3/3)</p>
                        )}
                    </div>
                </Card>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-white sticky bottom-0 z-20 flex flex-row gap-3">
              <Button type="button" variant="ghost" onClick={handleCloseDialog} disabled={isSubmitting} className="flex-1 rounded-lg font-bold h-14">Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-[2] rounded-lg h-14 font-black text-lg shadow-xl bg-primary text-black hover:bg-primary/90">
                {isSubmitting ? <><LogoSpinner className="mr-2 h-5 w-5" /> {submissionStatus}</> : (editingProduct?.id ? 'Enregistrer les modifications' : 'Publier l\'article')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
