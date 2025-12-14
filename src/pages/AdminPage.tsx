import { useState, useMemo, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Lead } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Shield, AlertTriangle, CheckCircle, Search, LogOut, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getQuestions } from '@/lib/funnel';
import { Label } from '@/components/ui/label';
import AdminLogin from '@/components/AdminLogin';
const COLORS = { low: '#ef4444', medium: '#f59e0b', high: '#3765EB' };
const getMaturityLevel = (avgScore: number): 'high' | 'medium' | 'low' => {
  if (avgScore >= 4.5) return 'high';
  if (avgScore >= 2.5) return 'medium';
  return 'low';
};
const getMaturityLabels = (lang: 'de' | 'en'): Record<'high' | 'medium' | 'low', { text: string, variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> => ({
    high: { text: t(lang, 'riskLow'), variant: 'default' },
    medium: { text: t(lang, 'riskMedium'), variant: 'secondary' },
    low: { text: t(lang, 'riskHigh'), variant: 'destructive' },
});
const getAnsweredCount = (answers?: Record<string, string>) => Object.values(answers || {}).filter(Boolean).length;
export function AdminPage() {
  const lang = useCurrentLang();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: '' });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const maturityLabels = getMaturityLabels(lang);
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
  const fetchLeads = useCallback(async ({ pageParam }: { pageParam?: unknown }) => {
    const params = new URLSearchParams({ limit: '10' });
    if (pageParam) {
      params.set('cursor', String(pageParam));
    }
    return api<{ items: Lead[]; next: string | null }>(`/api/leads?${params.toString()}`);
  }, []);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<{ items: Lead[]; next: string | null }, Error>({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    initialPageParam: null,
    enabled: isAuthenticated,
  });
  const { mutate: mutateProcessed } = useMutation({
    mutationFn: async ({ id, processed }: { id: string; processed: boolean }) =>
      api(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ processed }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
    onError: () => toast.error(t(lang, 'deleteError')),
  });
  const { mutate: mutateDelete } = useMutation({
    mutationFn: async (id: string) => api(`/api/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(t(lang, 'deleteSuccess'));
      setDeleteDialog({ open: false, id: '' });
      setDeletePassword('');
    },
    onError: () => toast.error(t(lang, 'deleteError')),
  });
  const handleDeleteConfirm = useCallback(() => {
    try {
      const authStr = localStorage.getItem('admin_auth');
      if (!authStr) {
        toast.error('No authentication found');
        return;
      }
      const auth = JSON.parse(authStr);
      if (deletePassword === auth.pass) {
        mutateDelete(deleteDialog.id);
      } else {
        toast.error('Falsches Passwort');
      }
    } catch (e) {
      toast.error('Authentifizierungsfehler');
    }
  }, [deletePassword, deleteDialog.id, mutateDelete]);
  useEffect(() => {
    if (isError && error) {
      toast.error(`Fehler beim Laden der Leads: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }, [isError, error]);
  const allLeads = useMemo(() => data?.pages.flatMap((page) => page.items ?? []) ?? [], [data]);
  const filteredLeads = useMemo(() => {
    const fromTimestamp = fromDate ? new Date(fromDate).getTime() : 0;
    const toTimestamp = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;
    return allLeads.filter(lead => {
      const leadDate = lead.createdAt;
      const matchesDate = leadDate >= fromTimestamp && leadDate <= toTimestamp;
      const matchesSearch = lead.company.toLowerCase().includes(filter.toLowerCase()) ||
                            lead.contact.toLowerCase().includes(filter.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [allLeads, filter, fromDate, toDate]);
  const chartData = useMemo(() => {
    if (allLeads.length === 0) return [];
    const counts = { low: 0, medium: 0, high: 0 };
    allLeads.forEach(lead => {
      const level = getMaturityLevel(lead.scoreSummary.average);
      counts[level]++;
    });
    return [
      { name: t(lang, 'riskHigh'), value: counts.low, color: COLORS.low },
      { name: t(lang, 'riskMedium'), value: counts.medium, color: COLORS.medium },
      { name: t(lang, 'riskLow'), value: counts.high, color: COLORS.high },
    ].filter(d => d.value > 0);
  }, [allLeads, lang]);
  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate]);
  const handleExport = useCallback(() => {
    if (filteredLeads.length === 0) {
      toast.warning("No leads to export for the selected criteria.");
      return;
    }
    const headers = "Company,Contact,Email,Phone,Employees,Role,Notes,AreaA_Score,AreaB_Score,AreaC_Score,Average_Score,Discount_Consent,Firewall,VPN,AnswersJSON,Processed,Date\n";
    const csvRows = filteredLeads.map(l => {
      const row = [
        l.company, l.contact, l.email, l.phone, l.employeesRange, l.role, l.notes,
        l.scoreSummary.areaA, l.scoreSummary.areaB, l.scoreSummary.areaC, l.scoreSummary.average.toFixed(2),
        l.scoreSummary.rabattConsent ? 'Yes' : 'No',
        l.firewallProvider || '',
        l.vpnProvider || '',
        JSON.stringify(l.scoreSummary.answers || {}),
        l.processed ? 'Yes' : 'No',
        format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm')
      ];
      return row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = headers + csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredLeads.length} leads exported successfully!`);
  }, [filteredLeads]);
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold font-display text-foreground">{t(lang, 'adminTitle')}</h1>
            <p className="text-muted-foreground">{t(lang, 'adminSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>{t(lang, 'backToHome')}</Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t(lang, 'logout')}><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 lg:auto-rows-fr">
          <Card className="lg:col-span-3 glass">
            <CardHeader>
              <CardTitle>{t(lang, 'leadsTitle')}</CardTitle>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-end">
                <div className="relative flex-grow">
                  <label htmlFor="search-leads" className="sr-only">{t(lang, 'searchPlaceholder')}</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search-leads" placeholder={t(lang, 'searchPlaceholder')} value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" />
                </div>
                <Input type="date" aria-label={t(lang, 'fromDate')} value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <Input type="date" aria-label={t(lang, 'toDate')} value={toDate} onChange={e => setToDate(e.target.value)} />
                <Button onClick={handleExport} className="btn-gradient sm:ml-auto">
                  {`${t(lang, 'exportCsv')} (${filteredLeads.length})`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <TableSkeleton />}
              {isError && <ErrorAlert error={error} />}
              {data && (
                <div className="border rounded-md w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t(lang, 'tableCompany')}</TableHead>
                        <TableHead>{t(lang, 'tableContact')}</TableHead>
                        <TableHead>{t(lang, 'tableDate')}</TableHead>
                        <TableHead>{t(lang, 'tableRisk')}</TableHead>
                        <TableHead>{t(lang, 'answeredCol')}</TableHead>
                        <TableHead>{t(lang, 'processed')}</TableHead>
                        <TableHead>{t(lang, 'firewallProvider')}</TableHead>
                        <TableHead>{t(lang, 'vpnProvider')}</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
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
                            <TableCell>{format(new Date(lead.createdAt), 'dd.MM.yyyy', { locale: lang === 'de' ? de : enUS })}</TableCell>
                            <TableCell>
                                <Badge variant={maturityLabels[getMaturityLevel(lead.scoreSummary.average)].variant}>
                                    {maturityLabels[getMaturityLevel(lead.scoreSummary.average)].text}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {getAnsweredCount(lead.scoreSummary.answers)}/{Object.keys(getQuestions(lang)).length}
                                </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Checkbox id={`processed-${lead.id}`} checked={!!lead.processed} aria-label={`Toggle processed for ${lead.company}`} onCheckedChange={(checked) => {mutateProcessed({id: lead.id, processed: !!checked})}} />
                                {lead.processed && <Badge variant="default" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">✓ {t(lang, 'processedBadge')}</Badge>}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="truncate max-w-20">{lead.firewallProvider || '–'}</Badge></TableCell>
                            <TableCell><Badge variant="outline" className="truncate max-w-20">{lead.vpnProvider || '–'}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setDetailsOpen(true);
                                  }}
                                  aria-label={`Details of ${lead.company}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({open: true, id: lead.id})} aria-label={`Delete lead ${lead.company}`}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">{t(lang, 'noLeads')}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              {hasNextPage && (
                <div className="mt-4 text-center">
                  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t(lang, 'loading')}...</> : t(lang, 'loadMore')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 glass">
            <CardHeader><CardTitle>{t(lang, 'chartTitle')}</CardTitle></CardHeader>
            <CardContent>
              {isLoading && <Skeleton className="h-64 w-full" />}
              {chartData.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
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
              ) : !isLoading && (<div className="h-64 flex items-center justify-center text-muted-foreground">{t(lang, 'chartNoData')}</div>)}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
      <Dialog open={deleteDialog.open} onOpenChange={open => !open && setDeleteDialog({open: false, id: ''})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(lang, 'deleteConfirm')} "{filteredLeads.find(l => l.id === deleteDialog.id)?.company || 'Unbekannt'}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="delete-password">{t(lang, 'deletePasswordPrompt')}</Label>
            <Input id="delete-password" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({open: false, id: ''})}>{t(lang, 'cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>{t(lang, 'deleteLead')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={detailsOpen} onOpenChange={open => { setDetailsOpen(open); if (!open) setSelectedLead(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>Details: {selectedLead.company}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <Collapsible>
                  <CollapsibleTrigger className="cursor-pointer text-primary underline">
                    Raw JSON
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-64 font-mono">
                      {JSON.stringify(selectedLead, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                  <CollapsibleTrigger className="cursor-pointer text-primary underline">
                    Answers Map ({getAnsweredCount(selectedLead.scoreSummary.answers)} Antworten)
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 p-2 border rounded-md bg-muted/50 max-h-96 overflow-y-auto">
                    {Object.entries(selectedLead.scoreSummary.answers || {})
                      .filter(([_, a]) => a)
                      .map(([qid, aid]) => {
                        const questions = getQuestions(lang);
                        const q = questions[qid as any];
                        const opt = q?.options?.find(o => o.id === aid);
                        return (
                          <div key={qid} className="flex items-start gap-3 p-3 bg-background border rounded-md text-sm">
                            <span className="font-mono text-muted-foreground min-w-[60px]">{qid}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium line-clamp-2">{q?.text}</div>
                            </div>
                            <div className="font-mono bg-primary/10 px-2 py-1 rounded text-xs whitespace-nowrap">
                              {aid} → {opt?.text || 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
  </div>
);
const ErrorAlert = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Fehler beim Laden der Daten</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);