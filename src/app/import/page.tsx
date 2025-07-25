import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
      <Upload className="mx-auto h-16 w-16 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Importer des produits
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Cette fonctionnalité est en cours de développement.
      </p>
      <Button size="lg" className="mt-8" disabled>
        Sélectionner un fichier
      </Button>
    </div>
  );
}
