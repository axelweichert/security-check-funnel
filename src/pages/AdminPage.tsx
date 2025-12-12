import { useState, useMemo, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
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
import { Shield, AlertTriangle, CheckCircle, Search, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
const COLORS = { low: '#ef4444', medium: '#f59e0b', high: '#4264E3' };
/**
 * Determines the maturity level based on the average score.
 * @param avgScore The average score from the lead's funnel results.
 * @returns 'high', 'medium', or 'low' maturity level.
 */
const getMaturityLevel = (avgScore: number): 'high' | 'medium' | 'low' => {
  if (avgScore >= 4.5) return 'high';
  if (avgScore >= 2.5) return 'medium';
  return 'low';
};
/**
 * Maps maturity levels to display text and badge variants for the UI.
 */
const maturityLabels: Record<'high' | 'medium' | 'low', { text: string, variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> = {
    high: { text: 'Solide', variant: 'default' },
    medium: { text: 'Mittel', variant: 'secondary' },
    low: { text: 'Hoch', variant: 'destructive' },
};
/**
 * A simple login component for the admin dashboard.
 * Uses localStorage for mock authentication. In a real-world scenario,
 * this would be replaced with a proper authentication service (e.g., OAuth, JWT).
 */
const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials for demonstration purposes.
        if (username === 'admin' && password === 'wmG7V6BNifmGjv7rEkh2') {
            localStorage.setItem('admin_auth', JSON.stringify({ user: username, pass: password }));
            onLoginSuccess();
        } else {
            setError('Falscher Benutzername oder Passwort.');
        }
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12 flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input type="text" placeholder="Benutzername" value={username} onChange={e => setUsername(e.target.value)} required />
                            <Input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full">Anmelden</Button>
                            <Button type="button" variant="link" className="w-full" onClick={() => navigate('/')}>Zurück zur Startseite</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
/**
 * The main page for the Admin Dashboard.
 * It fetches and displays leads from the `/api/leads` endpoint,
 * provides filtering capabilities, and visualizes data with a pie chart.
 */
export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  // On component mount, check for authentication credentials in localStorage.
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('admin_auth') || 'null');
      if (auth && auth.user === 'admin' && auth.pass === 'wmG7V6BNifmGjv7rEkh2') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  }, []);
  /**
   * Fetches leads from the API using React Query's `useInfiniteQuery` for pagination.
   * - `queryKey`: Uniquely identifies this query for caching.
   * - `queryFn`: The function that fetches the data. It receives a `pageParam` which is the cursor for the next page.
   * - `getNextPageParam`: Extracts the cursor from the last fetched page to be used as `pageParam` for the next fetch.
   * - `initialPageParam`: The initial cursor value (null for the first page).
   */
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<{ items: Lead[]; next: string | null }>({
    queryKey: ['leads'],
    queryFn: ({ pageParam = null }) => api(`/api/leads?limit=10&cursor=${pageParam || ''}`),
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: null,
  });
  // Display an error toast if fetching fails.
  useEffect(() => {
    if (isError && error) {
      toast.error(`Fehler beim Laden der Leads: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }, [isError, error]);
  // Flattens the paginated data from React Query into a single array of leads.
  const allLeads = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);
  // Filters the leads based on the user's input in the search field.
  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead =>
      lead.company.toLowerCase().includes(filter.toLowerCase()) ||
      lead.contact.toLowerCase().includes(filter.toLowerCase())
    );
  }, [allLeads, filter]);
  /**
   * Aggregates lead data for the pie chart.
   * It counts the number of leads in each maturity level (low, medium, high).
   * `useMemo` ensures this computation only runs when the list of leads changes.
   */
  const chartData = useMemo(() => {
    if (allLeads.length === 0) return [];
    const counts = { low: 0, medium: 0, high: 0 };
    allLeads.forEach(lead => {
      const level = getMaturityLevel(lead.scoreSummary.average);
      counts[level]++;
    });
    return [
      { name: 'Hoher Handlungsbedarf', value: counts.low, color: COLORS.low },
      { name: 'Mittleres Risiko', value: counts.medium, color: COLORS.medium },
      { name: 'Solide aufgestellt', value: counts.high, color: COLORS.high },
    ].filter(d => d.value > 0);
  }, [allLeads]);
  // Logs the user out by clearing localStorage and resetting the auth state.
  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate]);
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Übersicht der Security-Check Leads</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>Zur Startseite</Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Abmelden"><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 lg:auto-rows-fr">
          <Card className="lg:col-span-3 glass">
            <CardHeader>
              <CardTitle>Eingegangene Leads</CardTitle>
              <div className="relative mt-2">
                <label htmlFor="search-leads" className="sr-only">Leads filtern</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-leads" placeholder="Firma oder Ansprechpartner suchen..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" aria-label="Leads nach Firma oder Ansprechpartner filtern" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <TableSkeleton />}
              {error && <ErrorAlert error={error as Error} />}
              {data && (
                <div className="border rounded-md overflow-x-auto">
                  <Table role="grid" aria-label="Tabelle der Leads">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Firma</TableHead>
                        <TableHead>Ansprechpartner</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Mitarbeiter</TableHead>
                        <TableHead>Rolle</TableHead>
                        <TableHead>Notizen</TableHead>
                        <TableHead className="text-right">Risiko</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map(lead => (
                          <TableRow key={lead.id} className="hover:bg-accent transition-colors">
                            <TableCell className="font-medium">{lead.company}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{lead.contact}</span>
                                <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground hover:underline">{lead.email}</a>
                                <span className="text-xs text-muted-foreground">{lead.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(lead.createdAt), 'dd.MM.yyyy', { locale: de })}</TableCell>
                            <TableCell>{lead.employeesRange}</TableCell>
                            <TableCell>{lead.role || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{lead.notes || '-'}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={maturityLabels[getMaturityLevel(lead.scoreSummary.average)].variant}>
                                    {maturityLabels[getMaturityLevel(lead.scoreSummary.average)].text}
                                </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">Keine Leads gefunden.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {hasNextPage && (
                <div className="mt-4 text-center">
                  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Laden...</> : 'Weitere Laden'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 glass">
            <CardHeader><CardTitle>Score Verteilung</CardTitle></CardHeader>
            <CardContent>
              {isLoading && <Skeleton className="h-64 w-full" />}
              {chartData.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} aria-hidden="true">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : !isLoading && (<div className="h-64 flex items-center justify-center text-muted-foreground">Keine Daten für das Diagramm.</div>)}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}
/**
 * A skeleton loader component for the leads table.
 */
const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
  </div>
);
/**
 * An alert component to display data fetching errors.
 */
const ErrorAlert = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Fehler beim Laden der Daten</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);