
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Package, ShoppingBag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/products-service";
import { getMessages } from "@/lib/messages-service";
import { getImportOrders } from "@/lib/import-orders-service";
import type { Product, ContactMessage, ImportOrder } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatCard({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {isLoading ? <LogoSpinner className="h-6 w-6" /> : <div className="text-2xl font-bold">{value}</div>}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [orders, setOrders] = useState<ImportOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsData, messagesData, ordersData] = await Promise.all([
                    getProducts(),
                    getMessages(),
                    getImportOrders()
                ]);
                setProducts(productsData);
                setMessages(messagesData);
                setOrders(ordersData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const recentMessages = messages.slice(0, 3);
    const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Tableau de bord</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Produits" value={products.length} icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Messages" value={messages.length} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
        <StatCard title="Demandes Import" value={orders.length} icon={<Package className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
      </div>
      
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Derniers Messages</CardTitle>
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/messages">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? <LogoSpinner /> : recentMessages.length > 0 ? (
                <ul className="space-y-3">
                    {recentMessages.map(msg => (
                        <li key={msg.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                            <div>
                                <span className="font-semibold">{msg.name}</span>
                                <p className="text-muted-foreground truncate max-w-xs">{msg.message}</p>
                            </div>
                            {!msg.isRead && <Badge>Nouveau</Badge>}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-muted-foreground">Aucun message récent.</p>}
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dernières Demandes d'Import</CardTitle>
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/orders">Voir tout</Link>
                </Button>
            </CardHeader>
          <CardContent>
             {isLoading ? <LogoSpinner /> : recentOrders.length > 0 ? (
                <ul className="space-y-3">
                    {recentOrders.map(order => (
                         <li key={order.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                            <div>
                                <span className="font-semibold">{order.name}</span>
                                <p className="text-muted-foreground">Produit: {order.productName}</p>
                            </div>
                            {!order.isRead && <Badge>Nouveau</Badge>}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-muted-foreground">Aucune demande récente.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
