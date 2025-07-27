
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSlides } from "@/lib/slides-service";
import type { Slide } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import { addImageUploadAction, deleteImageAction } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSlide, setNewSlide] = useState<{ title: string; subtitle: string; image: File | null }>({
    title: "",
    subtitle: "",
    image: null,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSlide((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSlide((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const resetForm = () => {
    setNewSlide({ title: "", subtitle: "", image: null });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.subtitle || !newSlide.image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
        const imageFormData = new FormData();
        imageFormData.append('images', newSlide.image);
        
        const [uploadedImage] = await addImageUploadAction(imageFormData, 'slides');

        const finalSlideData = {
            title: newSlide.title,
            subtitle: newSlide.subtitle,
            imageUrl: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'slides'), finalSlideData);

        toast({
            title: "Succès",
            description: "Le slide a été ajouté avec succès.",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSlides();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du slide.",
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
        <Button onClick={() => setIsDialogOpen(true)}>
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
                      <DropdownMenuItem disabled>
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
            <DialogTitle>Ajouter un nouveau slide</DialogTitle>
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
                  value={newSlide.title}
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
                  value={newSlide.subtitle}
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
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LogoSpinner className="mr-2 h-4 w-4" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

