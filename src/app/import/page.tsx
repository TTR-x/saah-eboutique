
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addImportOrder } from '@/lib/import-orders-service';
import { LogoSpinner } from '@/components/logo-spinner';
import { Search, Wallet, Ship, Send, PackagePlus } from 'lucide-react';

const steps = [
  {
    icon: <PackagePlus className="h-8 w-8 text-primary" />,
    title: '1. Soumettez votre demande',
    description: 'Remplissez le formulaire ci-dessous avec le maximum de détails. Plus votre description sera précise, plus nous serons efficaces pour trouver le produit parfait.',
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: '2. Recherche & Devis',
    description: "Notre équipe s'appuie sur son réseau en Chine pour trouver les meilleurs fournisseurs. Vous recevrez un devis transparent incluant le coût des produits et du transport.",
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: '3. Validation & Paiement',
    description: "Une fois le devis validé, vous procédez au paiement en toute sécurité. Nous nous occupons alors de passer la commande et de la vérifier auprès du fournisseur.",
  },
  {
    icon: <Ship className="h-8 w-8 text-primary" />,
    title: '4. Suivi & Réception',
    description: "Détendez-vous, nous gérons toute la logistique du transport international. Suivez votre commande en temps réel jusqu'à sa livraison finale.",
  },
];

export default function ImportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    productName: '',
    quantity: '',
    budget: '',
    description: '',
    name: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        toast({ title: "Image sélectionnée", description: "La fonctionnalité d'upload d'image sera bientôt disponible."})
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.productName || !formState.quantity || !formState.name || !formState.email) {
        toast({
            title: "Champs requis",
            description: "Veuillez remplir au moins le nom du produit, la quantité, votre nom et votre email.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        await addImportOrder({
            productName: formState.productName,
            quantity: formState.quantity,
            budget: formState.budget,
            description: formState.description,
            name: formState.name,
            email: formState.email,
            phone: formState.phone,
        });
        toast({
            title: "Demande envoyée !",
            description: "Nous avons bien reçu votre demande et reviendrons vers vous rapidement avec un devis.",
        });
        setFormState({
            productName: '',
            quantity: '',
            budget: '',
            description: '',
            name: '',
            email: '',
            phone: '',
        });
    } catch (error) {
        let errorMessage = "Une erreur est survenue lors de l'envoi de votre demande.";
        if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('offline'))) {
            errorMessage = "La connexion au serveur a échoué. Veuillez vérifier votre connexion internet.";
        }
        toast({
            title: "Erreur",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Importez facilement depuis la Chine</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Besoin d'un produit spécifique en grande quantité ou en détail ? Nous sommes votre partenaire de confiance pour trouver, négocier et importer vos marchandises en toute sérénité.
        </p>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Comment ça marche ? Un service clé en main.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
                <Card key={index} className="text-center">
                    <CardHeader className="items-center">{step.icon}</CardHeader>
                    <CardContent>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <section>
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl text-center">Lancez votre projet d'importation</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="productName">Nom ou type de produit recherché</Label>
                            <Input id="productName" name="productName" value={formState.productName} onChange={handleInputChange} placeholder="Ex: Coques de téléphone, T-shirts..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantité approximative souhaitée</Label>
                            <Input id="quantity" name="quantity" value={formState.quantity} onChange={handleInputChange} placeholder="Ex: 1000 pièces" required />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="budget">Votre budget total approximatif (en FCFA, facultatif)</Label>
                        <Input id="budget" name="budget" value={formState.budget} onChange={handleInputChange} placeholder="Ex: 500 000 FCFA" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description détaillée de votre besoin</Label>
                        <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} placeholder="Soyez précis : matériaux, couleurs, dimensions, spécificités techniques, packaging souhaité, etc." rows={5} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="image-upload">Image de référence (fortement recommandé)</Label>
                        <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                        <p className="text-xs text-muted-foreground">Une photo, un schéma ou un dessin aide énormément à trouver le bon produit.</p>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                         <h3 className="text-lg font-semibold">Vos informations de contact</h3>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Votre nom complet</Label>
                                <Input id="name" name="name" value={formState.name} onChange={handleInputChange} placeholder="Ex: Jean Dupont" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Votre meilleure adresse email</Label>
                                <Input id="email" name="email" type="email" value={formState.email} onChange={handleInputChange} placeholder="Pour recevoir votre devis" required />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Votre numéro de téléphone (WhatsApp, si possible)</Label>
                            <Input id="phone" name="phone" type="tel" value={formState.phone} onChange={handleInputChange} />
                         </div>
                    </div>
                    
                    <div className="text-center pt-4">
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <LogoSpinner className="mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                            Recevoir mon devis gratuit
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
