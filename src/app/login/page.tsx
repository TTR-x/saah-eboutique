
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
  const { user, loading: authLoading } = useAuth();

  const handleSuccess = (userCredential: UserCredential) => {
    toast({ title: "Connexion réussie!" });
    if (userCredential.user?.email === ADMIN_EMAIL) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSuccess(userCredential);
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez votre email et votre mot de passe.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleSuccess(userCredential);
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
  
  useEffect(() => {
    // This effect handles the case where a user is ALREADY logged in
    // and navigates to the login page.
    if (!authLoading && user) {
        if (user.email === ADMIN_EMAIL) {
            // Already logged in as admin, should be on admin page
            router.replace('/admin');
        } else {
            // Logged in as regular user, should be on home page
            router.replace('/');
        }
    }
  }, [user, authLoading, router]);


  // While loading auth state, or if user is already logged in, show a spinner.
  // The useEffect above will handle the redirection.
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <LogoSpinner className="h-16 w-16" />
      </div>
    );
  }

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
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading && <LogoSpinner className="mr-2 h-4 w-4" />}
              Se connecter
            </Button>
          </form>
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
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
