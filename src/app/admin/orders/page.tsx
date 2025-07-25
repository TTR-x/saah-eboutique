
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gestion des Commandes</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aucune commande à afficher pour le moment.</p>
            <p className="text-muted-foreground mt-2">Les nouvelles commandes apparaîtront ici.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
