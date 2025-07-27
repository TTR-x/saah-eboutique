
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';

const ADMIN_EMAIL = "sabbataka02@gmail.com";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Connexion réussie !",
        description: `Bienvenue, ${user.email}`,
      });
      
      // Redirection directe et inconditionnelle après le succès
      if (user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      let description = "Vérifiez vos identifiants ou réessayez.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "L'adresse e-mail ou le mot de passe est incorrect.";
      }
      toast({
        title: "Erreur de connexion",
        description: description,
        variant: "destructive",
      });
      setIsSubmitting(false); // Arrêter le chargement en cas d'erreur
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion Administrateur</CardTitle>
          <CardDescription>
            Veuillez entrer vos identifiants pour accéder au tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LogoSpinner /> : 'Se connecter'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Retour au site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
