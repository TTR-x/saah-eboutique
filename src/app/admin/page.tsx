
'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, ShoppingBag, Users, BadgeEuro, TrendingUp, Clock, MessageCircle, CreditCard, CalendarDays, Wallet } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/lib/products-service";
import { getMessages } from "@/lib/messages-service";
import { getImportOrders } from "@/lib/import-orders-service";
import type { Product, ContactMessage, ImportOrder, Order } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subHours, subDays, subMonths, isAfter } from "date-fns";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

function StatCard({ title, value, icon, isLoading, subtext, colorClass = "text-primary" }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean, subtext?: string, colorClass?: string }) {
    return (
        <Card className="border-none shadow-sm rounded-md overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className={`h-8 w-8 rounded-md bg-muted flex items-center justify-center ${colorClass}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? <LogoSpinner className="h-6 w-6" /> : <div className="text-2xl font-black">{value}</div>}
                {subtext && <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">{subtext}</p>}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboardPage() {
    const db = useFirestore();
    const [products, setProducts] = useState<Product[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [importOrders, setImportOrders] = useState<ImportOrder[]>([]);
    
    // Requête en temps réel pour les commandes
    const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
    const { data: salesData, loading: salesLoading } = useCollection<Order>(ordersQuery);
    
    const [isLoadingStatic, setIsLoadingStatic] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingStatic(true);
            try {
                const [productsData, messagesData, importsData] = await Promise.all([
                    getProducts(),
                    getMessages(),
                    getImportOrders()
                ]);
                setProducts(productsData);
                setMessages(messagesData);
                setImportOrders(importsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoadingStatic(false);
            }
        };
        fetchData();
    }, []);

    const sales = salesData || [];
    const isLoading = isLoadingStatic || salesLoading;

    const filteredSales = useMemo(() => {
        if (timeFilter === 'all') return sales;
        
        const now = new Date();
        let cutoff: Date;

        switch (timeFilter) {
            case '24h':
                cutoff = subHours(now, 24);
                break;
            case 'week':
                cutoff = subDays(now, 7);
                break;
            case 'month':
                cutoff = subMonths(now, 1);
                break;
            default:
                return sales;
        }

        return sales.filter(sale => {
            const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
            return isAfter(saleDate, cutoff);
        });
    }, [sales, timeFilter]);

    const recentMessages = messages.slice(0, 5);
    const recentSales = filteredSales.slice(0, 5);
    
    // Calcul des compteurs
    const totalPotentialRevenue = filteredSales.reduce((acc, sale) => acc + (sale.status !== 'cancelled' ? sale.amount : 0), 0);
    const validatedTranchesCount = filteredSales.filter(s => s.paymentMode === 'installments' && (s.status === 'validated' || s.status === 'completed')).length;
    const validatedTontinesCount = filteredSales.filter(s => s.paymentMode === 'tontine' && (s.status === 'validated' || s.status === 'completed')).length;

    // En attente (statistiques pour la carte divisée)
    const pendingTranchesCount = filteredSales.filter(s => s.status === 'pending' && s.paymentMode === 'installments').length;
    const pendingTontinesCount = filteredSales.filter(s => s.status === 'pending' && s.paymentMode === 'tontine').length;

    // Calcul pour la zone détaillée
    const pendingCashCount = filteredSales.filter(s => s.status === 'pending' && s.paymentMode === 'cash').length;
    const pendingOthersTotalCount = pendingTranchesCount + pendingTontinesCount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-black tracking-tight">Tableau de Bord</h2>
            <p className="text-muted-foreground">Vue d'ensemble de l'activité de SAAH Business.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-md border shadow-sm">
            <div className="pl-3 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 font-bold h-9">
                    <SelectValue placeholder="Filtrer par période" />
                </SelectTrigger>
                <SelectContent className="border-none shadow-xl rounded-md">
                    <SelectItem value="all" className="font-medium">Tout l'historique</SelectItem>
                    <SelectItem value="24h" className="font-medium">Dernières 24h</SelectItem>
                    <SelectItem value="week" className="font-medium">Cette semaine</SelectItem>
                    <SelectItem value="month" className="font-medium">Ce mois</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
            title="Ventes Totales" 
            value={filteredSales.length} 
            icon={<BadgeEuro className="h-4 w-4" />} 
            isLoading={isLoading} 
            subtext={timeFilter === 'all' ? "Historique" : "Sur la période"} 
        />

        {/* CARTE EN ATTENTE DIVISÉE (Tranches et Tontines) */}
        <Card className="border-none shadow-sm rounded-md overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">En Attente</CardTitle>
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-orange-500">
                    <Clock className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 flex justify-center"><LogoSpinner className="h-6 w-6" /></div>
                ) : (
                    <div className="divide-y divide-dashed">
                        <div className="px-6 py-2">
                            <div className="text-xl font-black text-blue-600">{pendingTranchesCount}</div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Tranches à traiter</p>
                        </div>
                        <div className="px-6 py-2">
                            <div className="text-xl font-black text-purple-600">{pendingTontinesCount}</div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">Tontines à traiter</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        <StatCard title="Revenu Potentiel" value={`${totalPotentialRevenue.toLocaleString('fr-FR')} F`} icon={<TrendingUp className="h-4 w-4" />} isLoading={isLoading} subtext="Engagé" colorClass="text-green-500" />
        
        <StatCard title="Par tranche validé" value={validatedTranchesCount} icon={<CreditCard className="h-4 w-4" />} isLoading={isLoading} subtext="Tranches" colorClass="text-blue-500" />
        <StatCard title="Tontine validé" value={validatedTontinesCount} icon={<Users className="h-4 w-4" />} isLoading={isLoading} subtext="Tontines" colorClass="text-purple-500" />
      </div>

      {/* ZONE VENTES EN ATTENTE TEMPS RÉEL (DETAILLÉE) */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/30 rounded-md p-5 flex items-center gap-4 transition-all hover:shadow-sm">
            <div className="h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 dark:shadow-none">
                <Wallet className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest leading-none mb-1">Ventes Cash en attente</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-orange-700 dark:text-orange-300">{pendingCashCount}</span>
                    <span className="text-xs font-bold text-orange-600/70 uppercase">Commandes</span>
                </div>
            </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-md p-5 flex items-center gap-4 transition-all hover:shadow-sm">
            <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none">
                <CreditCard className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest leading-none mb-1">Ventes Tranche / Tontine en attente</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-700 dark:text-blue-300">{pendingOthersTotalCount}</span>
                    <span className="text-xs font-bold text-blue-600/70 uppercase">Commandes</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm rounded-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BadgeEuro className="h-4 w-4 text-primary" /> Dernières Ventes {timeFilter !== 'all' && <span className="text-[10px] text-primary lowercase">(filtrées)</span>}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold">
                <Link href="/admin/sales">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
                <div className="p-10 flex justify-center"><LogoSpinner /></div>
            ) : recentSales.length > 0 ? (
                <div className="divide-y">
                    {recentSales.map(sale => {
                        const userPhone = sale.userPhone;
                        const whatsappUrl = userPhone ? `https://wa.me/${userPhone.replace(/\s+/g, '')}` : null;
                        
                        return (
                            <div key={sale.id} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative h-10 w-10 rounded-md overflow-hidden border bg-muted shrink-0">
                                        {sale.productImage && <Image src={sale.productImage} alt="" fill className="object-cover" />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm truncate">{sale.productName}</span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {sale.userName} 
                                            {userPhone && <span className="text-green-600 font-bold">• {userPhone}</span>}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="font-black text-xs text-primary">{sale.amount.toLocaleString('fr-FR')} F</p>
                                        <Badge variant="outline" className={`text-[8px] h-4 mt-1 border-none ${
                                            sale.status === 'pending' ? 'text-orange-600 bg-orange-50' : 
                                            sale.status === 'validated' ? 'text-blue-600 bg-blue-50' :
                                            sale.status === 'cancelled' ? 'text-red-600 bg-red-50' :
                                            'text-green-600 bg-green-50'
                                        }`}>
                                            {sale.status === 'pending' ? 'En attente' : 
                                             sale.status === 'validated' ? 'Validé' : 
                                             sale.status === 'completed' ? 'Terminé' : 'Annulé'}
                                        </Badge>
                                    </div>
                                    {whatsappUrl && (
                                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-full text-green-600">
                                            <Link href={whatsappUrl} target="_blank">
                                                <MessageCircle className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-10 text-center text-muted-foreground italic text-sm">
                    Aucune vente trouvée pour cette période.
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Support Client
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-bold">
                <Link href="/admin/messages">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
                <div className="p-10 flex justify-center"><LogoSpinner /></div>
            ) : recentMessages.length > 0 ? (
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
            ) : (
                <div className="p-10 text-center text-muted-foreground italic text-sm">
                    Aucun message récent.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
