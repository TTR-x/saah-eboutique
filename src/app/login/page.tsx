'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogoSpinner } from '@/components/logo-spinner';

const ADMIN_EMAIL = "saahbusiness2026@gmail.com";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

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
      
      if (user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      let description = "Une erreur de connexion est survenue. Veuillez réessayer.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "L'adresse e-mail ou le mot de passe est incorrect.";
      } else if (error.code === 'auth/network-request-failed') {
        description = "La requête a échoué. Veuillez vérifier votre connexion internet.";
      }
      
      toast({
        title: "Erreur de connexion",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="h-12 rounded-lg"
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
          className="h-12 rounded-lg"
        />
      </div>
      <Button type="submit" className="w-full h-12 rounded-lg font-bold bg-primary text-black hover:bg-primary/90" disabled={isSubmitting}>
        {isSubmitting ? <LogoSpinner /> : 'Se connecter'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-background">
      <Card className="w-full max-w-sm shadow-xl border-none rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Se connecter</CardTitle>
          <CardDescription>
            Accédez à votre espace personnel SAAH Business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="flex justify-center p-8"><LogoSpinner /></div>}>
            <LoginForm />
          </Suspense>
          <div className="mt-6 text-center text-sm space-y-4">
            <p className="text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                S'inscrire
              </Link>
            </p>
            <Link href="/" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
              Retour au site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
