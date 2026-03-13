
'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gift, User, Mail, Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { getGiftRequests, sendGift } from "@/lib/gifts-service";
import { LogoSpinner } from "@/components/logo-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminGiftsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [giftForm, setGiftForm] = useState({ title: '', description: '' });
  const { toast } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getGiftRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenSend = (request: any) => {
    setSelectedRequest(request);
    // Pré-remplir avec le choix du client pour aider l'admin
    setGiftForm({ 
        title: request.chosenGift || '', 
        description: `Bonjour ${request.userName}, voici le cadeau que vous avez choisi !` 
    });
    setIsDialogOpen(true);
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftForm.title || !giftForm.description || !selectedRequest) return;

    setIsSubmitting(true);
    try {
      await sendGift(
        selectedRequest.userId, 
        giftForm.title, 
        giftForm.description, 
        selectedRequest.id
      );
      toast({ title: "Cadeau envoyé !", description: `Le client ${selectedRequest.userName} a reçu son cadeau.` });
      setIsDialogOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Échec de l'envoi du cadeau.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestion des Cadeaux</h2>
            <p className="text-muted-foreground">Validez les choix des clients et envoyez leurs récompenses.</p>
        </div>
        <div className="h-12 px-6 rounded-xl bg-white border flex items-center gap-3 shadow-sm">
            <Gift className="h-5 w-5 text-primary" />
            <span className="font-black text-lg">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">À traiter</span>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Demandes de Cadeaux (Choix Clients)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3">
              <LogoSpinner className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Chargement des demandes...</p>
            </div>
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Cadeau Choisi</TableHead>
                  <TableHead className="font-bold">Date Demande</TableHead>
                  <TableHead className="font-bold text-center">Statut</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold py-4">
                        <div className="flex flex-col">
                            <span>{r.userName}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-2 w-2" /> {r.userEmail}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold">
                            <Sparkles className="h-3 w-3 mr-1" /> {r.chosenGift || "Cadeau Surprise"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        {r.createdAt ? new Date(r.createdAt.toDate ? r.createdAt.toDate() : r.createdAt).toLocaleDateString('fr-FR') : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.status === 'pending' ? "default" : "outline"} className={r.status === 'pending' ? "bg-orange-500 text-white border-none" : "bg-green-50 text-green-600 border-none"}>
                        {r.status === 'pending' ? "En attente" : "Validé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === 'pending' ? (
                        <Button onClick={() => handleOpenSend(r)} size="sm" className="bg-primary text-black font-bold h-8 rounded-lg">
                          <Send className="h-3 w-3 mr-1" /> Valider
                        </Button>
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucune demande pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Valider le Cadeau</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendGift} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Titre du cadeau (Confirmation) *</Label>
              <Input 
                placeholder="Ex: Bon de réduction 10%" 
                value={giftForm.title} 
                onChange={e => setGiftForm({...giftForm, title: e.target.value})}
                className="h-12 rounded-xl bg-muted/30 border-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Message pour le client *</Label>
              <Textarea 
                placeholder="Expliquez comment utiliser le cadeau ou donnez un code..." 
                value={giftForm.description} 
                onChange={e => setGiftForm({...giftForm, description: e.target.value})}
                className="min-h-[100px] rounded-xl bg-muted/30 border-none"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-black font-black px-8 rounded-xl h-12">
                {isSubmitting ? <LogoSpinner /> : "Confirmer l'envoi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
