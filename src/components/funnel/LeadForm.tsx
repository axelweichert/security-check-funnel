import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AreaScores } from "@/lib/funnel";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Loader2, Heart, Download, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Lead } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLang } from "@/stores/useLangStore";
import { t } from "@/lib/i18n";
import { downloadReport } from "@/lib/reportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const formSchema = z.object({
  company: z.string().min(1, "Firmenname ist ein Pflichtfeld."),
  contact: z.string().min(1, "Ansprechpartner ist ein Pflichtfeld."),
  employeesRange: z.string().min(1, "Bitte w��hlen Sie die Mitarbeiterzahl."),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  phone: z.string().min(1, "Telefonnummer ist ein Pflichtfeld."),
  role: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Sie müssen der Kontaktaufnahme zustimmen.",
  }),
  analyticsConsent: z.boolean().optional(),
  rabattConsent: z.boolean().optional(),
});
type LeadFormValues = z.infer<typeof formSchema>;
interface LeadFormProps {
  scores: AreaScores & { average: number };
  onSuccess: () => void;
}
export function LeadForm({ scores, onSuccess }: LeadFormProps) {
  const lang = useCurrentLang();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentLead, setCurrentLead] = useState<Partial<Lead> | null>(null);
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      contact: "",
      employeesRange: "",
      email: "",
      phone: "",
      role: "",
      notes: "",
      consent: false,
      analyticsConsent: false,
      rabattConsent: false,
    },
  });
  const onSubmit = useCallback(async (values: LeadFormValues) => {
    setIsSubmitting(true);
    const leadPayload: Omit<Lead, 'id' | 'createdAt'> = {
      ...values,
      scoreSummary: {
        ...scores,
        rabattConsent: values.rabattConsent ?? false,
      },
    };
    try {
      const createdLead = await api<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadPayload),
      });
      setCurrentLead(createdLead);
      if (values.analyticsConsent) {
        localStorage.setItem('analyticsConsent', 'true');
        window.dispatchEvent(new CustomEvent('analyticsConsentChanged'));
        window.dispatchEvent(new CustomEvent('leadSubmit', {
          detail: { lang, ...scores, employees: values.employeesRange }
        }));
      }
      toast.success("Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.");
      setIsSuccess(true);
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      console.error("Failed to submit lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [scores, lang]);
  const handleDownload = useCallback(async () => {
    if (currentLead) {
      await downloadReport({ scores, lang, lead: currentLead });
    }
  }, [currentLead, scores, lang]);
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto text-center space-y-6"
      >
        <Card className="shadow-soft border text-left">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <CardTitle className="text-2xl font-bold">{t(lang, 'thanksHeadline')}</CardTitle>
                <p className="text-muted-foreground">{t(lang, 'thanksText')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ein PDF-Bericht mit Ihren Ergebnissen steht zum Download bereit.</p>
            <Button size="lg" onClick={handleDownload} className="w-full btn-gradient">
              <Download className="mr-2 h-5 w-5" />
              {t(lang, 'downloadReport')}
            </Button>
          </CardContent>
        </Card>
        <Button onClick={onSuccess} variant="outline">Weiter zum Abschluss</Button>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-soft border"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">{t(lang, 'formHeadline')}</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          {t(lang, 'formSubline').split('–')[0]} <Heart className="inline h-4 w-4 text-red-500" /> {t(lang, 'formSubline').split('–')[1]}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>{t(lang, 'company')}</FormLabel>
                <FormControl>{isSubmitting ? <Skeleton className="h-10 w-full" /> : <Input placeholder={t(lang, 'companyPlaceholder')} {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>{t(lang, 'contact')}</FormLabel>
                <FormControl>{isSubmitting ? <Skeleton className="h-10 w-full" /> : <Input placeholder={t(lang, 'contactPlaceholder')} {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="employeesRange" render={({ field }) => (
            <FormItem>
              <FormLabel>{t(lang, 'employees')}</FormLabel>
              {isSubmitting ? <Skeleton className="h-10 w-full" /> :
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder={t(lang, 'employeesPlaceholder')} /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-20">1–20</SelectItem>
                  <SelectItem value="21-50">21–50</SelectItem>
                  <SelectItem value="51-200">51–200</SelectItem>
                  <SelectItem value="201-500">201–500</SelectItem>
                  <SelectItem value="501-2000">501–2.000</SelectItem>
                  <SelectItem value="2000+">Über 2.000</SelectItem>
                </SelectContent>
              </Select>}
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t(lang, 'email')}</FormLabel>
                <FormControl>{isSubmitting ? <Skeleton className="h-10 w-full" /> : <Input type="email" placeholder={t(lang, 'emailPlaceholder')} {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>{t(lang, 'phone')}</FormLabel>
                <FormControl>{isSubmitting ? <Skeleton className="h-10 w-full" /> : <Input placeholder={t(lang, 'phonePlaceholder')} {...field} />}</FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>{t(lang, 'role')} <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <FormControl>{isSubmitting ? <Skeleton className="h-10 w-full" /> : <Input placeholder={t(lang, 'rolePlaceholder')} {...field} />}</FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>{t(lang, 'notes')} <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <FormControl>{isSubmitting ? <Skeleton className="h-24 w-full" /> : <Textarea placeholder={t(lang, 'notesPlaceholder')} {...field} />}</FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="consent" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="consent" className="cursor-pointer">{t(lang, 'consentText')}</Label>
                <FormMessage />
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="analyticsConsent" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="analyticsConsent" className="cursor-pointer">{t(lang, 'analyticsConsent')}</Label>
                <p className="text-sm text-muted-foreground">{t(lang, 'analyticsConsentText')}</p>
                <FormMessage />
              </div>
            </FormItem>
          )} />
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-primary font-semibold mb-2">{t(lang, 'discountInfo')}</p>
            <FormField control={form.control} name="rabattConsent" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
                <div className="space-y-1 leading-none">
                  <Label htmlFor="rabattConsent" className="cursor-pointer">{t(lang, 'secureDiscount')}</Label>
                  <p className="text-sm text-muted-foreground">{t(lang, 'secureDiscountText')}</p>
                </div>
              </FormItem>
            )} />
          </div>
          <Button type="submit" size="lg" className="w-full btn-gradient text-lg transition-transform duration-200 hover:scale-105 active:scale-95" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {t(lang, 'submitAndConsult')}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}