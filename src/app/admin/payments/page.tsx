
'use client'

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle, Smartphone, MessageCircle, User, ShoppingBag } from "lucide-react";
import type { Order } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";

export default function AdminPaymentsPage() {
  const db = useFirestore();
  const { toast } = useToast();

  // On utilise une requête simple sur la collection pour éviter le besoin d'index composite
  const allOrdersQuery = useMemo(() => {
    return query(
      collection(db, 'orders'), 
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: allOrders, loading: isLoading } = useCollection<Order>(allOrdersQuery);

  // Filtrage côté client pour une robustesse maximale
  const orders = useMemo(() => {
    return allOrders?.filter(order => order.status === 'payment_pending') || [];
  }, [allOrders]);

  const handleValidate = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      
      // Calcul du nouveau reste à payer
      const currentRemaining = order.remainingAmount ?? order.totalPrice;
      const amountPaid = order.amount || 0;
      const newRemaining = Math.max(0, currentRemaining - amountPaid);
      const isFinished = newRemaining <= 0;

      // Nouvelle entrée d'historique
      const newHistoryEntry = {
        amount: amountPaid,
        date: new Date(), // Utilise une date JS pour l'insertion dans l'array
        transferId: order.transferId || 'N/A',
        status: 'validated'
      };

      // Mise à jour atomique
      await updateDoc(orderRef, {
        status: isFinished ? 'completed' : 'validated',
        remainingAmount: newRemaining,
        paymentValidatedAt: serverTimestamp(),
        lastPaymentValidatedAt: serverTimestamp(),
        // Utilisation de arrayUnion pour garantir qu'on ne perd aucune donnée
        paymentHistory: arrayUnion(newHistoryEntry),
        // On vide le transferId pour permettre le prochain versement
        transferId: "", 
      });
      
      toast({ 
        title: "Paiement validé", 
        description: `Transfert de ${order.userName} confirmé. Reste : ${newRemaining.toLocaleString('fr-FR')} F` 
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast({ title: "Erreur", description: "Échec de la validation.", variant: "destructive" });
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm("Rejeter ce paiement ? Le client recevra une notification pour recommencer.")) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'rejected',
        transferId: "" // On vide pour qu'il puisse corriger
      });
      toast({ title: "Paiement rejeté", description: "Le client a été notifié de l'échec." });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de l'opération.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Validation des Paiements</h2>
            <p className="text-muted-foreground">Vérifiez les transferts Tmoney reçus sur le 92 39 20 62.</p>
        </div>
        <div className="h-12 px-6 rounded-xl bg-white border flex items-center gap-3 shadow-sm">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="font-black text-lg">{orders.length}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">En attente</span>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Demandes de confirmation Tmoney
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60"><LogoSpinner className="h-10 w-10 text-primary" /></div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Article</TableHead>
                  <TableHead className="font-bold">ID Transfert</TableHead>
                  <TableHead className="font-bold text-right">Montant Versement</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const whatsappUrl = order.userPhone ? `https://wa.me/${order.userPhone.replace(/\s+/g, '')}` : null;
                  
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold flex items-center gap-1">
                            <User className="h-3 w-3" /> {order.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{order.userPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 rounded-md overflow-hidden border bg-muted shrink-0">
                            {order.productImage && <Image src={order.productImage} alt="" fill className="object-cover" sizes="32px" />}
                          </div>
                          <span className="font-medium text-xs max-w-[150px] truncate">{order.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                          {order.transferId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black text-primary">
                        {order.amount.toLocaleString('fr-FR')} F
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {whatsappUrl && (
                            <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-full text-green-600 hover:bg-green-50">
                              <Link href={whatsappUrl} target="_blank">
                                <MessageCircle className="h-5 w-5" />
                              </Link>
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleValidate(order)}
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white font-black h-9 px-4 rounded-lg"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Confirmer
                          </Button>
                          <Button 
                            onClick={() => handleReject(order.id)}
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-red-500 hover:bg-red-50"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-24">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500/20 mb-4" />
              <p className="text-muted-foreground font-medium">Tous les paiements sont à jour !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
