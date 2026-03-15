'use client'

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle, Smartphone, MessageCircle, Store, Search, User, ArrowRight, Wallet, BookmarkCheck } from "lucide-react";
import type { Order, UserProfile } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, arrayUnion, Timestamp, addDoc, getDocs, where } from "firebase/firestore";
import { getUsers } from "@/lib/users-service";
import { cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const db = useFirestore();
  const { toast } = useToast();

  // État pour les paiements en attente (Tmoney)
  const allOrdersQuery = useMemo(() => {
    return query(
      collection(db, 'orders'), 
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: allOrders, loading: isLoading } = useCollection<Order>(allOrdersQuery);

  const pendingOrders = useMemo(() => {
    return allOrders?.filter(order => order.status === 'payment_pending') || [];
  }, [allOrders]);

  // États pour le paiement Boutique
  const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [boutiqueAmount, setBoutiqueAmount] = useState<number>(0);
  const [isProcessing, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isBoutiqueOpen) {
        getUsers().then(setAllUsers);
    }
  }, [isBoutiqueOpen]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return allUsers.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [allUsers, searchQuery]);

  const handleSelectUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setSearchQuery('');
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
        .filter(o => o.status !== 'cancelled' && o.status !== 'completed');
    
    // Trier pour mettre les "Enregistrés pour boutique" en haut
    const sorted = orders.sort((a, b) => (b.isStoreRegistered ? 1 : 0) - (a.isStoreRegistered ? 1 : 0));
    setUserOrders(sorted);
  };

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setBoutiqueAmount(order.amount);
  };

  const processBoutiquePayment = async () => {
    if (!selectedOrder || boutiqueAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      
      const totalPrice = Number(selectedOrder.totalPrice || selectedOrder.amount || 0);
      const currentRemaining = Number(selectedOrder.remainingAmount ?? totalPrice);
      const amountPaid = Number(boutiqueAmount);
      
      const newRemaining = Math.max(0, currentRemaining - amountPaid);
      const isFinished = newRemaining <= 0;

      // 1. Créer la COPIE certifiée Boutique
      const paymentCopy = {
        orderId: selectedOrder.id,
        userId: selectedOrder.userId,
        amount: amountPaid,
        date: serverTimestamp(),
        productName: selectedOrder.productName,
        productImage: selectedOrder.productImage || '',
        paymentMode: selectedOrder.paymentMode,
        transferId: 'BOUTIQUE',
        remainingAmountAfter: newRemaining,
        status: 'validated'
      };

      await addDoc(collection(db, 'users', selectedOrder.userId, 'payments'), paymentCopy);

      // 2. Mettre à jour l'article principal
      await updateDoc(orderRef, {
        status: isFinished ? 'completed' : 'validated',
        remainingAmount: newRemaining,
        totalPrice: totalPrice,
        isStoreRegistered: false, // On reset le flag après paiement
        paymentValidatedAt: serverTimestamp(),
        lastPaymentValidatedAt: serverTimestamp(),
        paymentHistory: arrayUnion({
            amount: amountPaid,
            date: Timestamp.now(),
            transferId: 'BOUTIQUE'
        }),
        transferId: "", 
      });
      
      toast({ title: "Paiement Boutique validé", description: "Historique client mis à jour." });
      setIsBoutiqueOpen(false);
      resetBoutique();
    } catch (error) {
      toast({ title: "Erreur", description: "Échec du paiement boutique.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBoutique = () => {
    setSelectedUser(null);
    setSelectedOrder(null);
    setUserOrders([]);
    setBoutiqueAmount(0);
    setSearchQuery('');
  };

  const handleValidate = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      const totalPrice = Number(order.totalPrice || order.amount || 0);
      const currentRemaining = Number(order.remainingAmount ?? totalPrice);
      const amountPaid = Number(order.amount || 0);
      const newRemaining = Math.max(0, currentRemaining - amountPaid);
      const isFinished = newRemaining <= 0;

      const paymentCopy = {
        orderId: order.id,
        userId: order.userId,
        amount: amountPaid,
        date: serverTimestamp(),
        productName: order.productName,
        productImage: order.productImage || '',
        paymentMode: order.paymentMode,
        transferId: order.transferId || 'MOBILE',
        remainingAmountAfter: newRemaining,
        status: 'validated'
      };

      await addDoc(collection(db, 'users', order.userId, 'payments'), paymentCopy);

      await updateDoc(orderRef, {
        status: isFinished ? 'completed' : 'validated',
        remainingAmount: newRemaining,
        totalPrice: totalPrice,
        paymentValidatedAt: serverTimestamp(),
        lastPaymentValidatedAt: serverTimestamp(),
        paymentHistory: arrayUnion({
            amount: amountPaid,
            date: Timestamp.now(),
            transferId: order.transferId || 'N/A'
        }),
        transferId: "", 
      });
      
      toast({ title: "Paiement validé", description: `Reste : ${newRemaining.toLocaleString('fr-FR')} F` });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de la validation.", variant: "destructive" });
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm("Rejeter ce paiement ?")) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'rejected', transferId: "" });
      toast({ title: "Paiement rejeté" });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestion des Paiements</h2>
            <p className="text-muted-foreground">Vérifiez les transferts Tmoney ou enregistrez un paiement en boutique.</p>
        </div>
        <Button onClick={() => setIsBoutiqueOpen(true)} className="bg-black text-white font-black h-12 px-6 rounded-xl shadow-lg hover:bg-gray-800">
            <Store className="mr-2 h-5 w-5" /> Paiement Client (Boutique)
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Vérifications Mobile (Tmoney)
            </CardTitle>
            <Badge variant="outline" className="bg-orange-50 text-orange-600 font-bold border-none">
                {pendingOrders.length} En attente
            </Badge>
            </CardHeader>
            <CardContent className="p-0">
            {isLoading ? (
                <div className="flex justify-center items-center h-60"><LogoSpinner className="h-10 w-10 text-primary" /></div>
            ) : pendingOrders.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Client</TableHead>
                    <TableHead className="font-bold">Article</TableHead>
                    <TableHead className="font-bold">ID Transaction</TableHead>
                    <TableHead className="font-bold text-right">Montant</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/20">
                        <TableCell className="py-4">
                            <div className="flex flex-col">
                                <span className="font-bold">{order.userName}</span>
                                <span className="text-[10px] text-muted-foreground">{order.userPhone}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-medium text-xs truncate max-w-[150px] inline-block">{order.productName}</span>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700">{order.transferId}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-primary">
                            {order.amount.toLocaleString('fr-FR')} F
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Button onClick={() => handleValidate(order)} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg h-8">
                                    Confirmer
                                </Button>
                                <Button onClick={() => handleReject(order.id)} size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center py-20 opacity-30">
                    <Smartphone className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-medium">Aucune vérification mobile en attente.</p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>

      {/* DIALOG PAIEMENT BOUTIQUE */}
      <Dialog open={isBoutiqueOpen} onOpenChange={(open) => {
          setIsBoutiqueOpen(open);
          if(!open) resetBoutique();
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-black text-white">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
                <Store className="h-6 w-6 text-primary" /> Encaisser en Boutique
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {!selectedUser ? (
                <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">Rechercher le client</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Nom ou Email du client..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    {filteredUsers.length > 0 && (
                        <div className="divide-y border rounded-xl overflow-hidden shadow-sm">
                            {filteredUsers.map(u => (
                                <button 
                                    key={u.uid} 
                                    onClick={() => handleSelectUser(u)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-4 w-4"/></div>
                                        <div>
                                            <p className="font-bold text-sm leading-none">{u.displayName}</p>
                                            <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-black font-black">{selectedUser.displayName?.[0]}</div>
                            <div>
                                <p className="font-bold text-sm">{selectedUser.displayName}</p>
                                <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-[10px] font-bold uppercase">Changer</Button>
                    </div>

                    {!selectedOrder ? (
                        <div className="space-y-3">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">Choisir l'article à payer</Label>
                            {userOrders.length > 0 ? (
                                <div className="space-y-2">
                                    {userOrders.map(o => (
                                        <button 
                                            key={o.id} 
                                            onClick={() => handleSelectOrder(o)}
                                            className={cn(
                                                "w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all text-left group",
                                                o.isStoreRegistered ? "border-primary bg-primary/5" : "border-gray-100 hover:border-primary"
                                            )}
                                        >
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border shrink-0 bg-white">
                                                <Image src={o.productImage} alt="" fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-sm truncate">{o.productName}</p>
                                                    {o.isStoreRegistered && (
                                                        <Badge className="h-4 px-1.5 text-[8px] font-black bg-primary text-black border-none animate-pulse">À ENCAISSER</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                    <span className={cn(o.isStoreRegistered ? "text-primary" : "text-gray-400", "uppercase")}>{o.paymentMode}</span>
                                                    <span>•</span>
                                                    <span>Reste: {o.remainingAmount?.toLocaleString('fr-FR')} F</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
                                    <p className="text-sm font-medium text-muted-foreground">Aucune commande active pour ce client.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-4 p-4 border rounded-xl bg-primary/5">
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border shrink-0 bg-white">
                                    <Image src={selectedOrder.productImage} alt="" fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{selectedOrder.productName}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">Reste à payer : <span className="text-primary">{selectedOrder.remainingAmount?.toLocaleString('fr-FR')} F</span></p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="h-8 w-8 rounded-full p-0"><XCircle className="h-4 w-4"/></Button>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-bold text-xs uppercase text-muted-foreground">Somme versée (FCFA)</Label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        value={boutiqueAmount}
                                        onChange={(e) => setBoutiqueAmount(Number(e.target.value))}
                                        className="pl-12 h-16 rounded-xl text-2xl font-black bg-muted/30 border-none focus:ring-primary"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium text-center">Le client recevra une copie certifiée "Boutique" sur son compte.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50">
            <Button variant="ghost" onClick={() => setIsBoutiqueOpen(false)} disabled={isProcessing}>Annuler</Button>
            <Button 
                onClick={processBoutiquePayment} 
                disabled={!selectedOrder || boutiqueAmount <= 0 || isProcessing}
                className="bg-black text-white font-black px-8 h-12 rounded-xl"
            >
                {isProcessing ? <LogoSpinner /> : "Valider le versement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
