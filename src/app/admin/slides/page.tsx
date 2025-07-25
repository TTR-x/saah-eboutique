
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

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
          <p className="text-muted-foreground">Aucun slide à afficher pour le moment.</p>
           <p className="text-muted-foreground mt-2">Cliquez sur "Ajouter un slide" pour commencer.</p>
        </CardContent>
      </Card>
    </div>
  );
}
