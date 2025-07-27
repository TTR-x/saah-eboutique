
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSlides } from "@/lib/slides-service";
import type { Slide } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import { addImageUploadAction, deleteImageAction } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

type SlideFormData = {
  title: string;
  subtitle: string;
  imageFile: File | null;
  currentImageUrl?: string;
};

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  
  const [slideForm, setSlideForm] = useState<SlideFormData>({
    title: "",
    subtitle: "",
    imageFile: null,
  });

  const { toast } = useToast();

  const fetchSlides = async () => {
    setIsLoading(true);
    const fetchedSlides = await getSlides();
    setSlides(fetchedSlides);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);
  
  useEffect(() => {
    if (editingSlide) {
      setSlideForm({
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        imageFile: null,
        currentImageUrl: editingSlide.imageUrl,
      });
    } else {
      resetForm();
    }
  }, [editingSlide]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSlideForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSlideForm((prev) => ({ ...prev, imageFile: e.target.files![0] }));
    }
  };

  const resetForm = () => {
    setSlideForm({ title: "", subtitle: "", imageFile: null, currentImageUrl: undefined });
    setEditingSlide(null);
  };
  
  const handleOpenDialog = (slide: Slide | null = null) => {
    setEditingSlide(slide);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slideForm.title || !slideForm.subtitle) {
      toast({
        title: "Erreur",
        description: "Le titre et le sous-titre sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    if (!editingSlide && !slideForm.imageFile) {
        toast({
            title: "Erreur",
            description: "Une image est obligatoire pour un nouveau slide.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    try {
        let imageUrl = editingSlide?.imageUrl;
        let publicId = editingSlide?.publicId;

        // Si une nouvelle image est fournie
        if (slideForm.imageFile) {
            // 1. Supprimer l'ancienne image de Cloudinary si elle existe
            if (editingSlide && editingSlide.publicId) {
                await deleteImageAction([editingSlide.publicId]);
            }
            
            // 2. Uploader la nouvelle image
            const imageFormData = new FormData();
            imageFormData.append('images', slideForm.imageFile);
            const [uploadedImage] = await addImageUploadAction(imageFormData, 'slides');
            
            imageUrl = uploadedImage.secure_url;
            publicId = uploadedImage.public_id;
        }

        const finalSlideData = {
            title: slideForm.title,
            subtitle: slideForm.subtitle,
            imageUrl,
            publicId,
        };

        if (editingSlide) {
            const slideRef = doc(db, "slides", editingSlide.id);
            await updateDoc(slideRef, finalSlideData);
            toast({ title: "Succès", description: "Le slide a été mis à jour." });
        } else {
            await addDoc(collection(db, 'slides'), { 
                ...finalSlideData, 
                createdAt: serverTimestamp() 
            });
            toast({ title: "Succès", description: "Le slide a été ajouté." });
        }
      
        handleCloseDialog();
        fetchSlides();
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

  const handleDelete = async (slide: Slide) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce slide ?")) {
        try {
            await deleteImageAction([slide.publicId]);
            await deleteDoc(doc(db, "slides", slide.id));
            toast({
                title: "Succès",
                description: "Le slide a été supprimé.",
            });
            fetchSlides();
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
        <h2 className="text-3xl font-bold">Gestion des Slides</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un slide
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des slides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <LogoSpinner className="h-8 w-8" />
                </div>
            ) : slides.length > 0 ? (
              slides.map((slide) => (
                <div key={slide.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      width={120}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{slide.title}</h3>
                      <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
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
                      <DropdownMenuItem onClick={() => handleOpenDialog(slide)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(slide)} className="text-destructive hover:text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Aucun slide à afficher pour le moment.</p>
                <p className="text-muted-foreground mt-2">Cliquez sur "Ajouter un slide" pour commencer.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSlide ? 'Modifier le slide' : 'Ajouter un nouveau slide'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={slideForm.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subtitle" className="text-right">
                  Sous-titre
                </Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={slideForm.subtitle}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={handleFileChange}
                  className="col-span-3"
                  accept="image/*"
                  required={!editingSlide}
                />
              </div>
              {(slideForm.imageFile || slideForm.currentImageUrl) && (
                <div className="col-span-4 col-start-2">
                    <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
                    <Image
                        src={slideForm.imageFile ? URL.createObjectURL(slideForm.imageFile) : slideForm.currentImageUrl!}
                        alt="Aperçu du slide"
                        width={200}
                        height={100}
                        className="rounded-md object-cover"
                    />
                </div>
              )}
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleCloseDialog}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}
                {editingSlide ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
