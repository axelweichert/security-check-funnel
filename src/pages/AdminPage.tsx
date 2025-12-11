import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Lead } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
const COLORS = { low: '#ef4444', medium: '#f59e0b', high: '#22c55e' };
const getMaturityLevel = (avgScore: number) => {
  if (avgScore >= 4.5) return 'high';
  if (avgScore >= 2.5) return 'medium';
  return 'low';
};
export function AdminPage() {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Simple mock authentication
    const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
    if (!isAuthenticated) {
      const password = prompt('Admin-Passwort eingeben:');
      if (password === 'vonbusch-admin') {
        localStorage.setItem('admin_auth', 'true');
      } else {
        alert('Falsches Passwort.');
        navigate('/');
      }
    }
  }, [navigate]);
  const { data, isLoading, error } = useQuery<{ items: Lead[] }>({
    queryKey: ['leads'],
    queryFn: () => api('/api/leads?limit=100'), // Fetch up to 100 leads for now
    onError: (err) => {
      toast.error(`Fehler beim Laden der Leads: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    }
  });
  const filteredLeads = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(lead =>
      lead.company.toLowerCase().includes(filter.toLowerCase()) ||
      lead.contact.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);
  const chartData = useMemo(() => {
    if (!data?.items) return [];
    const counts = { low: 0, medium: 0, high: 0 };
    data.items.forEach(lead => {
      const level = getMaturityLevel(lead.scoreSummary.average);
      counts[level]++;
    });
    return [
      { name: 'Hoher Handlungsbedarf', value: counts.low, color: COLORS.low },
      { name: 'Mittleres Risiko', value: counts.medium, color: COLORS.medium },
      { name: 'Solide aufgestellt', value: counts.high, color: COLORS.high },
    ].filter(d => d.value > 0);
  }, [data]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-display text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Übersicht der Security-Check Leads</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Zur Startseite</Button>
        </header>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Eingegangene Leads</CardTitle>
              <div className="relative mt-2">
                <label htmlFor="search-leads" className="sr-only">Leads filtern</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-leads"
                  placeholder="Firma oder Ansprechpartner suchen..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-9"
                  aria-label="Leads nach Firma oder Ansprechpartner filtern"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <TableSkeleton />}
              {error && <ErrorAlert error={error as Error} />}
              {data && (
                <div className="border rounded-md">
                  <Table role="grid" aria-label="Tabelle der Leads">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma</TableHead>
                        <TableHead>Ansprechpartner</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map(lead => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.company}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{lead.contact}</span>
                                <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground hover:underline">{lead.email}</a>
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(lead.createdAt), 'dd. MMM yyyy', { locale: de })}</TableCell>
                            <TableCell className="text-right font-mono">{lead.scoreSummary.average.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Keine Leads gefunden.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Score Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && <Skeleton className="h-64 w-full" />}
                {chartData.length > 0 ? (
                  <div aria-hidden="true">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : !isLoading && (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">Keine Daten für das Diagramm.</div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Legende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Hoher Handlungsbedarf (&lt; 2.5)</div>
                <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-amber-500" /> Mittleres Risiko (2.5 - 4.4)</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Solide aufgestellt (&ge; 4.5)</div>
              </CardContent>
            </Card>
          </div>
        </div>
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          Built with ❤️ at Cloudflare
        </footer>
      </div>
    </div>
  );
}
const TableSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);
const ErrorAlert = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Fehler beim Laden der Daten</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);