'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, CheckCircle2, XCircle, User as UserIcon, History } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      toast({ 
        title: status === 'validated' ? "Vente Validée" : "Vente Annulée", 
        description: `La vente a été déplacée vers l'historique.` 
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const historyOrders = orders.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestion des Ventes</h2>
            <p className="text-muted-foreground">Suivez vos ventes directes et l'historique des transactions.</p>
        </div>
        <div className="h-12 px-6 rounded-xl bg-white border flex items-center gap-3 shadow-sm">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="font-black text-lg">{pendingOrders.length}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">À Traiter</span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 bg-white border h-12 rounded-xl p-1 shadow-sm">
          <TabsTrigger value="pending" className="rounded-lg font-bold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
            <Clock className="h-4 w-4" /> En attente ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
            <History className="h-4 w-4" /> Historique ({historyOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Ventes à valider
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-60 gap-3">
                  <LogoSpinner className="h-10 w-10 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Chargement des ventes...</p>
                </div>
              ) : pendingOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Article</TableHead>
                        <TableHead className="font-bold">Client</TableHead>
                        <TableHead className="font-bold text-center">Mode</TableHead>
                        <TableHead className="font-bold text-right">Montant</TableHead>
                        <TableHead className="font-bold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
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
                          <TableCell className="text-right font-black text-primary">
                            {order.amount.toLocaleString('fr-FR')} F
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-20 bg-white">
                  <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground opacity-10 mb-4" />
                  <p className="text-muted-foreground font-medium italic">Aucune vente en attente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                Historique des décisions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historyOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Article</TableHead>
                        <TableHead className="font-bold">Client</TableHead>
                        <TableHead className="font-bold text-center">Statut</TableHead>
                        <TableHead className="font-bold text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/20 transition-colors opacity-80">
                          <TableCell className="text-xs text-muted-foreground">
                              {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-8 w-8 rounded-lg overflow-hidden border bg-muted shrink-0 grayscale">
                                  {order.productImage ? (
                                      <Image src={order.productImage} alt="" fill className="object-cover" />
                                  ) : <ShoppingBag className="h-4 w-4 m-auto mt-2 opacity-20"/>}
                              </div>
                              <span className="font-bold text-xs max-w-[150px] truncate">{order.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{order.userName}</span>
                              <span className="text-[10px] text-muted-foreground">{order.userEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-500 text-white' : 
                              order.status === 'validated' ? 'bg-blue-500 text-white' : 
                              'bg-red-500 text-white'
                            }>
                              {order.status === 'validated' ? 'Validé' : 
                               order.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs">
                            {order.amount.toLocaleString('fr-FR')} F
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-20 bg-white">
                  <History className="mx-auto h-16 w-16 text-muted-foreground opacity-10 mb-4" />
                  <p className="text-muted-foreground font-medium italic">Historique vide.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
