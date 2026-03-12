
'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Mail, Calendar, ShieldCheck } from "lucide-react";
import { getUsers } from "@/lib/users-service";
import type { UserProfile } from "@/lib/types";
import { LogoSpinner } from "@/components/logo-spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminClientsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestion des Clients</h2>
            <p className="text-muted-foreground">Liste de tous les utilisateurs enregistrés sur la plateforme.</p>
        </div>
        <div className="h-12 px-6 rounded-xl bg-white border flex items-center gap-3 shadow-sm">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-black text-lg">{users.length}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">Inscrits</span>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Répertoire Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3">
              <LogoSpinner className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Chargement de la base clients...</p>
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Nom / Pseudo</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold text-center">Rôle</TableHead>
                  <TableHead className="font-bold text-right">Inscrit le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold py-4">
                      {u.displayName || "Sans nom"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={u.role === 'admin' ? "default" : "outline"} className={u.role === 'admin' ? "bg-primary text-black" : "text-muted-foreground"}>
                        {u.role === 'admin' ? (
                            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Admin</span>
                        ) : "Client"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Date inconnue"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucun client trouvé.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
