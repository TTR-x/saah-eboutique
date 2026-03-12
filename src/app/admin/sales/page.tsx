
'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, CheckCircle2, XCircle, User as UserIcon } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders-service";
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

export default function AdminSalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast({ title: "Mise à jour réussie", description: `La vente est maintenant marquée comme ${status}.` });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Ventes en Attente</h2>
            <p className="text-muted-foreground">Suivez et validez les intentions d'achat de vos clients (connectés ou visiteurs).</p>
        </div>
        <div className="h-12 px-6 rounded-xl bg-white border flex items-center gap-3 shadow-sm">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="font-black text-lg">{orders.filter(o => o.status === 'pending').length}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">À Traiter</span>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Historique des intentions d'achat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3">
              <LogoSpinner className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Chargement des ventes...</p>
            </div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Article</TableHead>
                  <TableHead className="font-bold">Client / Contact</TableHead>
                  <TableHead className="font-bold text-center">Mode</TableHead>
                  <TableHead className="font-bold text-center">Statut</TableHead>
                  <TableHead className="font-bold text-right">Montant</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border bg-muted shrink-0">
                            {order.productImage ? (
                                <Image src={order.productImage} alt="" fill className="object-cover" />
                            ) : <ShoppingBag className="h-4 w-4 m-auto mt-3 opacity-20"/>}
                        </div>
                        <span className="font-bold text-sm max-w-[150px] truncate">{order.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm flex items-center gap-1">
                            <UserIcon className="h-3 w-3 opacity-50"/> {order.userName}
                            {order.userId === 'guest' && <Badge variant="outline" className="text-[8px] h-3 px-1 leading-none uppercase ml-1">Visiteur</Badge>}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{order.userEmail}</span>
                        {(order as any).userPhone && <span className="text-[10px] font-bold text-green-600">WhatsApp: {(order as any).userPhone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={order.paymentMode === 'installments' ? "text-blue-600 border-blue-200 bg-blue-50" : "text-gray-600"}>
                        {order.paymentMode === 'cash' ? 'Cash' : 'Tranches'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={
                        order.status === 'completed' ? 'bg-green-500' : 
                        order.status === 'validated' ? 'bg-blue-500' : 
                        order.status === 'cancelled' ? 'bg-red-500' :
                        'bg-orange-100 text-orange-700 border-none'
                      }>
                        {order.status === 'pending' ? 'En attente' : 
                         order.status === 'validated' ? 'Validé' : 
                         order.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {order.amount.toLocaleString('fr-FR')} F
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {order.status === 'pending' && (
                            <>
                                <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 rounded-lg"
                                    onClick={() => handleStatusUpdate(order.id, 'validated')}
                                >
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Valider
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold h-8 rounded-lg"
                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                >
                                    <XCircle className="h-3 w-3 mr-1" /> Annuler
                                </Button>
                            </>
                        )}
                        {order.status === 'validated' && (
                             <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 rounded-lg"
                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Terminer
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20 bg-white">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground opacity-10 mb-4" />
              <p className="text-muted-foreground font-medium italic">Aucune vente en attente pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
