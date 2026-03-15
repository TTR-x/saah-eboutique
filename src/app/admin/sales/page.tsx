
'use client'

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, History, Wallet, CreditCard, MessageCircle } from "lucide-react";
import { updateOrderStatus } from "@/lib/orders-service";
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
import Link from "next/link";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AdminSalesPage() {
  const db = useFirestore();
  const { toast } = useToast();

  // Création de la requête mémoïsée pour le temps réel
  const ordersQuery = useMemo(() => {
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  // Utilisation du hook de collection pour le temps réel
  const { data: orders, loading: isLoading } = useCollection<Order>(ordersQuery);

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({ 
        title: "Statut mis à jour", 
        description: `La vente a été marquée comme : ${status === 'validated' ? 'Validé' : status === 'completed' ? 'Terminé' : status === 'cancelled' ? 'Annulé' : 'En attente'}` 
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
    }
  };

  const safeOrders = orders || [];
  const pendingOrders = safeOrders.filter(o => o.status === 'pending');
  const historyOrders = safeOrders.filter(o => o.status !== 'pending');

  const pendingCash = pendingOrders.filter(o => o.paymentMode === 'cash');
  const pendingInstallments = pendingOrders.filter(o => o.paymentMode === 'installments');

  const historyCash = historyOrders.filter(o => o.paymentMode === 'cash');
  const historyInstallments = historyOrders.filter(o => o.paymentMode === 'installments');

  const SalesTable = ({ data, showActions = false }: { data: Order[], showActions?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold text-[10px] uppercase">Date</TableHead>
            <TableHead className="font-bold text-[10px] uppercase">Article</TableHead>
            <TableHead className="font-bold text-[10px] uppercase">Client</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-right">Montant</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-center">Contact</TableHead>
            <TableHead className="font-bold text-[10px] uppercase text-center">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => {
            const userPhone = order.userPhone;
            const whatsappUrl = userPhone ? `https://wa.me/${userPhone.replace(/\s+/g, '')}` : null;

            return (
              <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {order.createdAt ? new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString('fr-FR') : '...'}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border bg-muted shrink-0">
                        {order.productImage ? (
                            <Image src={order.productImage} alt="" fill className="object-cover" />
                        ) : <ShoppingBag className="h-3 w-3 m-auto mt-2 opacity-20"/>}
                    </div>
                    <span className="font-bold text-xs max-w-[120px] truncate">{order.productName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs flex items-center gap-1">
                        {order.userName}
                        {order.userId === 'guest' && <Badge variant="outline" className="text-[7px] h-3 px-1 leading-none uppercase ml-1">Visiteur</Badge>}
                    </span>
                    {userPhone && <span className="text-[9px] font-bold text-green-600">{userPhone}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-xs text-primary whitespace-nowrap">
                  {order.amount.toLocaleString('fr-FR')} F
                </TableCell>
                <TableCell className="text-center">
                  {whatsappUrl ? (
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700">
                      <Link href={whatsappUrl} target="_blank">
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {showActions ? (
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-7 px-2 text-[10px] rounded-md"
                          onClick={() => handleStatusUpdate(order.id, 'validated')}
                      >
                          Valider
                      </Button>
                      <Button 
                          size="sm" 
                          variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold h-7 px-2 text-[10px] rounded-md"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      >
                          Annuler
                      </Button>
                    </div>
                  ) : (
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusUpdate(order.id, val as Order['status'])}
                    >
                      <SelectTrigger className={cn(
                        "h-7 w-[100px] text-[10px] font-bold border-none rounded-md mx-auto focus:ring-0",
                        order.status === 'completed' ? 'bg-green-500 text-white' : 
                        order.status === 'validated' ? 'bg-blue-500 text-white' : 
                        'bg-red-500 text-white'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-none shadow-xl rounded-md min-w-[120px]">
                        <SelectItem value="pending" className="text-[10px] font-bold">En attente</SelectItem>
                        <SelectItem value="validated" className="text-[10px] font-bold">Validé</SelectItem>
                        <SelectItem value="completed" className="text-[10px] font-bold">Terminé</SelectItem>
                        <SelectItem value="cancelled" className="text-[10px] font-bold text-red-500">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-10 opacity-40">
      <ShoppingBag className="mx-auto h-8 w-8 mb-2" />
      <p className="text-xs font-medium italic">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Ventes en Attente</h2>
            <p className="text-muted-foreground">Gérez les intentions d'achat et l'historique des décisions en temps réel.</p>
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

        <TabsContent value="pending" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-white border-b py-4">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-700">
                  <div className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <Wallet className="h-4 w-4" />
                  </div>
                  VENTES CASH ({pendingCash.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40"><LogoSpinner /></div>
                ) : pendingCash.length > 0 ? (
                  <SalesTable data={pendingCash} showActions />
                ) : (
                  <EmptyState message="Aucune vente cash en attente." />
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-white border-b py-4">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-700">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  PAIEMENTS PAR TRANCHES ({pendingInstallments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40"><LogoSpinner /></div>
                ) : pendingInstallments.length > 0 ? (
                  <SalesTable data={pendingInstallments} showActions />
                ) : (
                  <EmptyState message="Aucun paiement par tranches en attente." />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white opacity-90">
              <CardHeader className="bg-gray-50 border-b py-4">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-500">
                  <Wallet className="h-4 w-4" />
                  HISTORIQUE CASH ({historyCash.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {historyCash.length > 0 ? (
                  <SalesTable data={historyCash} />
                ) : (
                  <EmptyState message="Historique cash vide." />
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white opacity-90">
              <CardHeader className="bg-gray-50 border-b py-4">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  HISTORIQUE TRANCHES ({historyInstallments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {historyInstallments.length > 0 ? (
                  <SalesTable data={historyInstallments} />
                ) : (
                  <EmptyState message="Historique tranches vide." />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
