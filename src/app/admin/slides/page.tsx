
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

// Données fictives en attendant la base de données
const slides = [
  {
    id: "1",
    image: "https://placehold.co/1600x800.png",
    hint: "tech gadget",
    title: "Technologie de Pointe",
    subtitle: "Découvrez nos derniers arrivages high-tech",
  },
];

export default function AdminSlidesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestion des Slides</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un slide
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des slides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slides.length > 0 ? (
              slides.map((slide) => (
                <div key={slide.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={120}
                      height={60}
                      className="rounded-md object-cover"
                      data-ai-hint={slide.hint}
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
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <>
                <p className="text-muted-foreground">Aucun slide à afficher pour le moment.</p>
                <p className="text-muted-foreground mt-2">Cliquez sur "Ajouter un slide" pour commencer.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
