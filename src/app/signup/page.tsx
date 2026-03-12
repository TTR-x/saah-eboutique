'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { LogoSpinner } from '@/components/logo-spinner';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit faire au moins 6 caractères.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Création du compte dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Mise à jour du nom d'affichage dans Auth pour accès immédiat
      await updateProfile(user, { displayName: name });

      // 3. Sauvegarde du profil dans Firestore avec l'UID
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: 'client',
        createdAt: serverTimestamp(),
      });

      toast({ 
        title: 'Bienvenue chez SAAH !', 
        description: 'Votre compte a été créé avec succès.',
      });
      
      // 4. Redirection vers le dashboard
      // On utilise replace pour éviter de pouvoir revenir au formulaire via "Précédent"
      router.replace('/dashboard');
    } catch (error: any) {
      console.error(error);
      let message = 'Impossible de créer le compte.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Cet email est déjà utilisé.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Format d\'email invalide.';
      }
      
      toast({
        title: 'Erreur d\'inscription',
        description: message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-[#f0f2f5]">
      <Card className="w-full max-w-md shadow-xl border-none rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-white pb-8">
          <CardTitle className="text-3xl font-black text-gray-900">Rejoindre SAAH</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Créez votre compte pour gérer vos achats et vos paiements par tranches.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          <form onSubmit={handleSignup} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold text-gray-700 ml-1">Votre nom complet</Label>
              <Input
                id="name"
                placeholder="Ex: Jean Dupont"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-lg bg-white border border-black/30 focus:border-primary focus:ring-primary/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-gray-700 ml-1">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 rounded-lg bg-white border border-black/30 focus:border-primary focus:ring-primary/20 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" title="Mot de passe" className="font-bold text-gray-700 ml-1">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg bg-white border border-black/30 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" title="Confirmer le mot de passe" className="font-bold text-gray-700 ml-1">Confirmer votre mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-lg bg-white border border-black/30 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-lg font-black text-lg bg-primary text-black hover:bg-primary/90 shadow-lg shadow-yellow-100 mt-2" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <LogoSpinner className="mr-2" /> : "S'inscrire gratuitement"}
            </Button>
          </form>
          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Déjà inscrit ? </span>
            <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}