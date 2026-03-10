
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, X, Copy, Tag as TagIcon, LayoutGrid, Package } from "lucide-react";
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
  stock: number | '';
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
    stock: 100,
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
            stock: editingProduct.stock || 0,
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
      tags: "",
      stock: 100,
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
    });
    setEditingProduct(null);
    setImagesToDelete([]);
    setSubmissionStatus('');
  }

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  const handleDuplicate = (product: Product) => {
    const duplicated = {
        ...product,
        id: "", // Important: empty ID to save as new
        name: `${product.name} (Copie)`,
    };
    setEditingProduct(duplicated as any);
    setIsDialogOpen(true);
  }

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
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
    
    // Validations
    if (!productForm.name || productForm.price === '' || totalImages === 0) {
      toast({ title: "Erreur", description: "Veuillez remplir le nom, le prix et ajouter au moins une image.", variant: "destructive" });
      return;
    }

    if (Number(productForm.price) <= 0) {
        toast({ title: "Erreur", description: "Le prix doit être supérieur à 0.", variant: "destructive" });
        return;
    }

    if (productForm.stock !== '' && Number(productForm.stock) < 0) {
        toast({ title: "Erreur", description: "Le stock ne peut pas être négatif.", variant: "destructive" });
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
            stock: productForm.stock === '' ? 0 : Number(productForm.stock),
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
        };

        if (editingProduct && editingProduct.id) {
            const productRef = doc(db, "products", editingProduct.id);
            const { createdAt, ...updateData } = productData;
            await updateDoc(productRef, updateData);
            toast({ title: "Succès", description: "Produit mis à jour avec succès." });
        } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: "Succès", description: "Nouveau produit ajouté." });
        }
      
        handleCloseDialog();
        fetchProducts();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'enregistrement.", variant: "destructive" });
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
            toast({ title: "Succès", description: "Produit supprimé." });
            fetchProducts();
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" });
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Catalogue Articles</h2>
            <p className="text-muted-foreground">Gérez vos produits, stocks et options de paiement.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg">
          <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Article
        </Button>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Articles en vente ({products.length})
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-40 gap-2">
                    <LogoSpinner className="h-8 w-8 text-primary" />
                    <p className="text-sm text-muted-foreground">Chargement du catalogue...</p>
                </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-muted/30 border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-white">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{product.name}</h3>
                        <Badge variant={product.status === 'active' ? 'default' : 'outline'} className={product.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground'}>
                            {product.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="font-bold text-primary">{product.price.toLocaleString('fr-FR')} FCFA</span>
                        <span>•</span>
                        <span>Stock: {product.stock}</span>
                        <span>•</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                <Copy className="mr-2 h-4 w-4" /> Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">Aucun article dans votre catalogue.</p>
                <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2">Ajouter votre premier produit</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isSubmitting && setIsDialogOpen(isOpen)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl">
          <DialogHeader className="p-6 border-b bg-muted/10">
            <DialogTitle className="text-2xl flex items-center gap-2">
                {editingProduct?.id ? <Pencil className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
                {editingProduct?.id ? 'Modifier l\'article' : 'Nouvel Article'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8 pb-20">
              
              {/* SECTION 1: INFOS GENERALES */}
              <div className="space-y-4">
                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-2"><LayoutGrid className="h-5 w-5" /> Informations de base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'article *</Label>
                        <Input id="name" name="name" value={productForm.name} onChange={handleInputChange} placeholder="Ex: iPhone 15 Pro Max" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select value={productForm.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                            <SelectContent>
                                {productCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée *</Label>
                    <Textarea id="description" name="description" value={productForm.description} onChange={handleInputChange} placeholder="Détaillez les caractéristiques, tailles, couleurs..." className="min-h-[120px]" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marque / Fabricant</Label>
                        <Input id="brand" name="brand" value={productForm.brand} onChange={handleInputChange} placeholder="Ex: Apple, Samsung..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="flex items-center gap-2"><TagIcon className="h-3 w-3" /> Tags (séparés par des virgules)</Label>
                        <Input id="tags" name="tags" value={productForm.tags} onChange={handleInputChange} placeholder="Ex: homme, mode, premium" />
                    </div>
                </div>
              </div>

              {/* SECTION 2: PRIX, STOCK ET STATUT */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-2"><Package className="h-5 w-5" /> Stock & Visibilité</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Prix Cash (FCFA) *</Label>
                        <Input id="price" name="price" type="number" value={productForm.price} onChange={handleNumberInputChange} className="font-bold text-primary" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">Quantité en stock</Label>
                        <Input id="stock" name="stock" type="number" value={productForm.stock} onChange={handleNumberInputChange} />
                    </div>
                    <div className="flex items-end pb-2">
                        <div className="flex items-center justify-between w-full p-2 border rounded-lg bg-muted/20">
                            <div className="space-y-0.5">
                                <Label className="text-xs">Statut de l'article</Label>
                                <p className="text-[10px] text-muted-foreground">{productForm.status === 'active' ? 'Visible sur le site' : 'Masqué'}</p>
                            </div>
                            <Switch checked={productForm.status === 'active'} onCheckedChange={(val) => setProductForm(p => ({...p, status: val ? 'active' : 'inactive'}))} />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-0.5">
                            <Label className="font-bold">Autoriser la livraison</Label>
                            <p className="text-xs text-muted-foreground">Permet au client de choisir la livraison lors de l'achat.</p>
                        </div>
                        <Switch checked={productForm.allowDelivery} onCheckedChange={(val) => setProductForm(p => ({...p, allowDelivery: val}))} />
                    </div>
                    
                    {productForm.allowDelivery && (
                        <div className="grid grid-cols-1 gap-4 pl-6 border-l-4 border-primary animate-in slide-in-from-left-2 duration-300">
                            <div className="space-y-2">
                                <Label>Frais de livraison (FCFA)</Label>
                                <Input name="deliveryFees" type="number" value={productForm.deliveryFees} onChange={handleNumberInputChange} placeholder="Ex: 1500" />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* SECTION 3: OPTIONS DE PAIEMENT */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-2">💳 Options de paiement</h3>
                
                <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="space-y-0.5">
                            <Label className="font-bold">Activer le paiement par tranches</Label>
                            <p className="text-xs text-muted-foreground">Permet de payer en plusieurs mensualités.</p>
                        </div>
                        <Switch checked={productForm.allowInstallments} onCheckedChange={(val) => setProductForm(p => ({...p, allowInstallments: val}))} />
                    </div>

                    {productForm.allowInstallments && (
                        <div className="grid grid-cols-2 gap-4 pl-6 border-l-4 border-blue-500 animate-in slide-in-from-left-2 duration-300">
                            <div className="space-y-2">
                                <Label>Mensualité (FCFA)</Label>
                                <Input name="installmentPrice" type="number" value={productForm.installmentPrice} onChange={handleNumberInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre de mois</Label>
                                <Input name="installmentMonths" type="number" value={productForm.installmentMonths} onChange={handleNumberInputChange} />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="space-y-0.5">
                            <Label className="font-bold">Proposer comme Plan de Tontine</Label>
                            <p className="text-xs text-muted-foreground">Inclut l'article dans un cycle d'épargne collective.</p>
                        </div>
                        <Switch checked={productForm.isTontine} onCheckedChange={(val) => setProductForm(p => ({...p, isTontine: val}))} />
                    </div>

                    {productForm.isTontine && (
                        <div className="grid grid-cols-1 gap-4 pl-6 border-l-4 border-green-500 animate-in slide-in-from-left-2 duration-300">
                            <div className="space-y-2">
                                <Label>Durée du cycle (ex: 6 mois, 12 mois...)</Label>
                                <Input name="tontineDuration" value={productForm.tontineDuration} onChange={handleInputChange} placeholder="Ex: 10 mois" />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* SECTION 4: IMAGES */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-black text-lg border-b pb-2">📸 Images de l'article *</h3>
                <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                        <Input id="images" name="images" type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" multiple />
                        <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                        <p className="text-sm font-bold">Cliquez ou glissez pour ajouter des photos</p>
                        <p className="text-xs text-muted-foreground mt-1">Format JPG, PNG (Max 5 Mo par image)</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                    {productForm.existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                        <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-primary/20">
                            <Image src={image} alt="" fill className="object-cover" />
                        </div>
                        <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg" onClick={() => removeExistingImage(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white text-center py-0.5">Existant</span>
                        </div>
                    ))}
                    {productForm.newImages.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                        <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-dashed border-primary">
                            <Image src={image.previewUrl} alt="" fill className="object-cover" />
                        </div>
                        <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg" onClick={() => removeNewImage(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">Nouveau</span>
                        </div>
                    ))}
                    </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/10 sticky bottom-0 z-10">
              <Button type="button" variant="secondary" onClick={handleCloseDialog} disabled={isSubmitting} className="rounded-xl">Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 font-bold min-w-[150px]">
                {isSubmitting ? <><LogoSpinner className="mr-2 h-4 w-4" /> {submissionStatus}</> : (editingProduct?.id ? 'Mettre à jour' : 'Publier l\'article')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
