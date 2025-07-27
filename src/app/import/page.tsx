
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addMessage } from '@/lib/messages-service';
import { LogoSpinner } from '@/components/logo-spinner';
import { Upload, Search, Wallet, Ship, Send, PackagePlus } from 'lucide-react';

const steps = [
  {
    icon: <PackagePlus className="h-8 w-8 text-primary" />,
    title: '1. Soumettez votre demande',
    description: 'Remplissez le formulaire ci-dessous avec tous les détails de votre besoin. Plus vous êtes précis, mieux nous pourrons vous aider.',
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: '2. Recherche & Devis',
    description: "Notre équipe recherche les meilleurs fournisseurs en Chine et vous envoie un devis détaillé incluant le coût des produits et du transport.",
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: '3. Validation & Paiement',
    description: "Une fois que vous validez le devis, vous procédez au paiement pour lancer la commande auprès du fournisseur.",
  },
  {
    icon: <Ship className="h-8 w-8 text-primary" />,
    title: '4. Suivi & Réception',
    description: "Nous gérons toute la logistique. Vous pouvez suivre votre commande jusqu'à sa livraison à votre porte.",
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
    // Note: File upload is not implemented in this form submission
    // This is a placeholder for future functionality
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
    
    const messageContent = `
      Nouvelle demande d'importation:
      - Produit: ${formState.productName}
      - Quantité: ${formState.quantity}
      - Budget: ${formState.budget || 'Non spécifié'}
      - Description: ${formState.description}
    `;

    try {
        await addMessage({
            name: formState.name,
            email: formState.email,
            phone: formState.phone,
            message: messageContent,
        });
        toast({
            title: "Demande envoyée !",
            description: "Nous avons bien reçu votre demande et reviendrons vers vous rapidement.",
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
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'envoi de votre demande.",
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
          Besoin d'un produit spécifique en grande quantité ? Nous sommes votre partenaire de confiance pour trouver, négocier et importer vos marchandises en toute sérénité.
        </p>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Comment ça marche ?</h2>
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
                <CardTitle className="text-3xl text-center">Formulaire de Demande d'Importation</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="productName">Nom ou type de produit</Label>
                            <Input id="productName" name="productName" value={formState.productName} onChange={handleInputChange} placeholder="Ex: Coques de téléphone, T-shirts..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantité souhaitée</Label>
                            <Input id="quantity" name="quantity" value={formState.quantity} onChange={handleInputChange} placeholder="Ex: 1000 pièces" required />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="budget">Budget approximatif (FCFA, facultatif)</Label>
                        <Input id="budget" name="budget" value={formState.budget} onChange={handleInputChange} placeholder="Ex: 500 000 FCFA" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description détaillée</Label>
                        <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} placeholder="Décrivez précisément votre besoin : matériaux, couleurs, dimensions, spécificités techniques..." rows={5} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="image-upload">Image de référence (facultatif)</Label>
                        <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                        <p className="text-xs text-muted-foreground">Téléchargez une photo ou un schéma du produit souhaité.</p>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                         <h3 className="text-lg font-semibold">Vos informations de contact</h3>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Votre nom complet</Label>
                                <Input id="name" name="name" value={formState.name} onChange={handleInputChange} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Votre email</Label>
                                <Input id="email" name="email" type="email" value={formState.email} onChange={handleInputChange} required />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Votre numéro de téléphone (facultatif)</Label>
                            <Input id="phone" name="phone" type="tel" value={formState.phone} onChange={handleInputChange} />
                         </div>
                    </div>
                    
                    <div className="text-center pt-4">
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <LogoSpinner className="mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                            Envoyer ma demande
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
