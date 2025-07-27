
'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Package, Inbox } from "lucide-react";
import type { ImportOrder } from "@/lib/types";
import { getImportOrders } from "@/lib/import-orders-service";
import { LogoSpinner } from "@/components/logo-spinner";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ImportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const fetchedOrders = await getImportOrders();
      setOrders(fetchedOrders);
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Demandes d'Importation</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LogoSpinner className="h-8 w-8" />
            </div>
          ) : orders.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-4">
                            {!order.isRead && <Badge>Nouveau</Badge>}
                            <span className="font-semibold">{order.name}</span>
                            <span className="text-sm text-muted-foreground">{order.email}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString('fr-FR')}
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-muted/50 rounded-md space-y-2">
                    <p><strong>Produit:</strong> {order.productName}</p>
                    <p><strong>Quantité:</strong> {order.quantity}</p>
                    {order.budget && <p><strong>Budget:</strong> {order.budget}</p>}
                    {order.phone && <p><strong>Téléphone:</strong> {order.phone}</p>}
                    <p className="border-t pt-2 mt-2"><strong>Description:</strong> {order.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Aucune demande d'importation à afficher pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
