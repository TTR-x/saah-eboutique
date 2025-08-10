
'use client'

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogoSpinner } from "@/components/logo-spinner";
import { useAuth } from "@/hooks/use-auth";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Shield } from "lucide-react";

export default function AdminSecurityPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast({ title: "Erreur", description: "Utilisateur non authentifié.", variant: "destructive" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas.", variant: "destructive" });
            return;
        }

        if (newPassword.length < 6) {
            toast({ title: "Erreur", description: "Le nouveau mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            await updatePassword(user, newPassword);

            toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error: any) {
            console.error("Password change error:", error);
            let errorMessage = "Une erreur est survenue lors du changement de mot de passe.";
            
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "Le mot de passe actuel est incorrect.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Le nouveau mot de passe est trop faible.";
            } else if (error.code === 'auth/network-request-failed') {
                 errorMessage = "La requête a échoué. Veuillez vérifier votre connexion internet.";
            }

            toast({
                title: "Échec de la mise à jour",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Sécurité du compte</h2>
            </div>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Changer de mot de passe</CardTitle>
                    <CardDescription>
                        Il est recommandé d'utiliser un mot de passe fort que vous n'utilisez nulle part ailleurs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                            <Input 
                                id="currentPassword" 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required 
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input 
                                id="newPassword" 
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                            <Input 
                                id="confirmPassword" 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                                autoComplete="new-password"
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <LogoSpinner className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                            Mettre à jour le mot de passe
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
