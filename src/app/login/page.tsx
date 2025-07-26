
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';
import { useAuth } from '@/hooks/use-auth';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // Affiche un spinner tant que l'état d'authentification n'est pas connu
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setIsCheckingAuth(false);
      // Si l'utilisateur est déjà connecté
      if (user) {
        // S'il est admin, rediriger vers le tableau de bord
        if (user.email === ADMIN_EMAIL) {
            router.push('/admin');
        } else {
            // Sinon (client normal), rediriger vers l'accueil
            router.push('/');
        }
      }
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Redirection gérée par le useEffect ci-dessus
      toast({ title: "Connexion réussie!" });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirection gérée par le useEffect ci-dessus
      toast({ title: "Connexion avec Google réussie!" });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Affiche un spinner pendant la vérification initiale
  if (isCheckingAuth) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LogoSpinner className="h-16 w-16" />
        </div>
    );
  }
  
  // Si un utilisateur est déjà connecté après la vérification, ne rien afficher en attendant la redirection
  if (user) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <LogoSpinner className="h-16 w-16" />
        </div>
    );
  }

  // Si pas d'utilisateur, afficher le formulaire de connexion
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LogoSpinner className="mr-2 h-4 w-4" />}
              Se connecter
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
            {isGoogleLoading && <LogoSpinner className="mr-2 h-4 w-4" />}
            Se connecter avec Google
          </Button>
        </CardContent>
        <div className="mt-4 text-center text-sm p-6 pt-0">
          Vous n'avez pas de compte?{' '}
          <Link href="#" className="underline">
            S'inscrire
          </Link>
        </div>
      </Card>
    </div>
  );
}
