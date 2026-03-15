
'use client'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, MousePointer2, Clock, ArrowUpRight, Smartphone, Monitor } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { LogoSpinner } from "@/components/logo-spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const visitData = [
  { day: 'Lun', visits: 450 },
  { day: 'Mar', visits: 520 },
  { day: 'Mer', visits: 480 },
  { day: 'Jeu', visits: 610 },
  { day: 'Ven', visits: 750 },
  { day: 'Sam', visits: 890 },
  { day: 'Dim', visits: 920 },
];

const deviceData = [
  { name: 'Mobile', value: 75 },
  { name: 'Ordinateur', value: 25 },
];

const pageData = [
  { name: 'Accueil', views: 2400 },
  { name: 'Catalogue', views: 1800 },
  { name: 'Produit: iPhone 15', views: 950 },
  { name: 'Support', views: 450 },
  { name: 'Panier', views: 320 },
];

const COLORS = ['#FACC15', '#2563EB'];

function StatCard({ title, value, subtext, icon, trend }: { title: string, value: string, subtext: string, icon: React.ReactNode, trend?: string }) {
    return (
        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">{value}</div>
                <div className="flex items-center gap-1 mt-1">
                    {trend && <span className="text-[10px] font-black text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3" /> {trend}</span>}
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminTrafficPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
                <LogoSpinner className="h-12 w-12 text-primary" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Analyse du trafic en cours...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black tracking-tight">Analyse du Trafic</h2>
                <p className="text-muted-foreground">Suivez l'audience et le comportement des visiteurs sur SAAH Business.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Visiteurs Uniques" value="1,284" subtext="ces 7 derniers jours" icon={<Users className="h-4 w-4" />} trend="+12%" />
                <StatCard title="Pages Vues" value="5,920" subtext="Volume total" icon={<BarChart3 className="h-4 w-4" />} trend="+18%" />
                <StatCard title="Clics Totaux" value="842" subtext="Interactions" icon={<MousePointer2 className="h-4 w-4" />} trend="+5%" />
                <StatCard title="Temps Moyen" value="3m 42s" subtext="par session" icon={<Clock className="h-4 w-4" />} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Visites Quotidiennes
                        </CardTitle>
                        <CardDescription>Évolution de l'audience sur la semaine</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={visitData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 'black', color: '#FACC15' }}
                                />
                                <Line type="monotone" dataKey="visits" stroke="#FACC15" strokeWidth={4} dot={{ r: 6, fill: '#FACC15', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" /> Appareils
                        </CardTitle>
                        <CardDescription>Répartition par plateforme</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center">
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-primary" />
                                <span className="text-xs font-bold">Mobile (75%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600" />
                                <span className="text-xs font-bold">Ordi (25%)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-primary" /> Pages les plus visitées
                    </CardTitle>
                    <CardDescription>Classement par nombre de vues</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pageData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Bar dataKey="views" fill="#FACC15" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
