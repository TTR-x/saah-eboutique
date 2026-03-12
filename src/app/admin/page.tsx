
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Package, ShoppingBag, Users, BadgeEuro, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/products-service";
import { getMessages } from "@/lib/messages-service";
import { getImportOrders } from "@/lib/import-orders-service";
import { getAllOrders } from "@/lib/orders-service";
import type { Product, ContactMessage, ImportOrder, Order } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatCard({ title, value, icon, isLoading, subtext, colorClass = "text-primary" }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean, subtext?: string, colorClass?: string }) {
    return (
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center ${colorClass}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LogoSpinner className="h-6 w-6" /> : <div className="text-2xl font-black">{value}</div>}
                {subtext && <p className="text-[10px] font-bold text-muted-foreground mt-1">{subtext}</p>}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [importOrders, setImportOrders] = useState<ImportOrder[]>([]);
    const [sales, setSales] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [productsData, messagesData, importsData, salesData] = await Promise.all([
                    getProducts(),
                    getMessages(),
                    getImportOrders(),
                    getAllOrders()
                ]);
                setProducts(productsData);
                setMessages(messagesData);
                setImportOrders(importsData);
                setSales(salesData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const recentMessages = messages.slice(0, 3);
    const recentSales = sales.slice(0, 3);
    const pendingSalesCount = sales.filter(s => s.status === 'pending').length;
    const totalPotentialRevenue = sales.reduce((acc, sale) => acc + (sale.status !== 'cancelled' ? sale.amount : 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Tableau de Bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité de SAAH Business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Ventes Totales" value={sales.length} icon={<BadgeEuro className="h-4 w-4" />} isLoading={isLoading} subtext="Total historique" />
        <StatCard title="En Attente" value={pendingSalesCount} icon={<Clock className="h-4 w-4" />} isLoading={isLoading} subtext="À traiter" colorClass="text-orange-500" />
        <StatCard title="Revenu Potentiel" value={`${totalPotentialRevenue.toLocaleString('fr-FR')} F`} icon={<TrendingUp className="h-4 w-4" />} isLoading={isLoading} subtext="Engagé (Hors annulé)" colorClass="text-green-500" />
        <StatCard title="Demandes Import" value={importOrders.length} icon={<Package className="h-4 w-4" />} isLoading={isLoading} subtext="Projets Chine" colorClass="text-blue-500" />
        <StatCard title="Messages" value={messages.length} icon={<MessageSquare className="h-4 w-4" />} isLoading={isLoading} subtext="Support" colorClass="text-purple-500" />
      </div>
      
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BadgeEuro className="h-4 w-4 text-primary" /> Dernières Ventes
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold">
                <Link href="/admin/sales">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="p-10 flex justify-center"><LogoSpinner /></div> : recentSales.length > 0 ? (
                <div className="divide-y">
                    {recentSales.map(sale => (
                        <div key={sale.id} className="flex justify-between items-center p-4 hover:bg-muted/30">
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm truncate">{sale.productName}</span>
                                <span className="text-[10px] text-muted-foreground">{sale.userName}</span>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-black text-xs text-primary">{sale.amount.toLocaleString('fr-FR')} F</p>
                                <Badge variant="outline" className={`text-[8px] h-4 mt-1 ${sale.status === 'pending' ? 'border-orange-200 text-orange-600 bg-orange-50' : ''}`}>
                                    {sale.status === 'pending' ? 'Attente' : sale.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="p-10 text-center text-muted-foreground italic text-sm">Aucune vente récente.</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Support Client
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold">
                <Link href="/admin/messages">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="p-10 flex justify-center"><LogoSpinner /></div> : recentMessages.length > 0 ? (
                <div className="divide-y">
                    {recentMessages.map(msg => (
                        <div key={msg.id} className="flex justify-between items-center p-4 hover:bg-muted/30">
                            <div className="min-w-0">
                                <span className="font-bold text-sm">{msg.name}</span>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{msg.message}</p>
                            </div>
                            {!msg.isRead && <Badge className="bg-red-500 h-2 w-2 p-0 rounded-full shrink-0" />}
                        </div>
                    ))}
                </div>
            ) : <p className="p-10 text-center text-muted-foreground italic text-sm">Aucun message récent.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
