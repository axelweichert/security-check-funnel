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
import { AreaScores, deriveAreaLabel, deriveOverallLabel } from "@/lib/funnel";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useState, useCallback, useMemo } from "react";
import { Loader2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Lead } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLang } from "@/stores/useLangStore";
import { t } from "@/lib/i18n";
const formSchema = z.object({
  company: z.string().min(1, "Firmenname ist ein Pflichtfeld."),
  contact: z.string().min(1, "Ansprechpartner ist ein Pflichtfeld."),
  employeesRange: z.string().min(1, "Bitte wählen Sie die Mitarbeiterzahl."),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  phone: z.string().min(1, "Telefonnummer ist ein Pflichtfeld."),
  role: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Sie müssen der Kontaktaufnahme zustimmen.",
  }),
  analyticsConsent: z.boolean().optional(),
});
type LeadFormValues = z.infer<typeof formSchema>;
interface LeadFormProps {
  scores: AreaScores & { average: number };
  onSuccess: () => void;
}
export function LeadForm({ scores, onSuccess }: LeadFormProps) {
  const lang = useCurrentLang();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
  });
  const stableScores = useMemo(() => JSON.stringify(scores), [scores]);
  const onSubmit = useCallback(async (values: LeadFormValues) => {
    setIsSubmitting(true);
    const currentScores = JSON.parse(stableScores);
    const leadPayload: Omit<Lead, 'id' | 'createdAt'> = {
      ...values,
      scoreSummary: {
        areaA: currentScores.areaA,
        areaB: currentScores.areaB,
        areaC: currentScores.areaC,
        average: currentScores.average,
      },
    };
    try {
      await api<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadPayload),
      });
      if (values.analyticsConsent) {
        localStorage.setItem('analyticsConsent', 'true');
        window.dispatchEvent(new CustomEvent('analyticsConsentChanged'));
        // Dispatch event for Plausible goal tracking
        window.dispatchEvent(new CustomEvent('leadSubmit', {
          detail: { lang, ...currentScores, employees: values.employeesRange }
        }));
      }
      toast.success("Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.");
      const areaALabel = deriveAreaLabel(currentScores.areaA, lang);
      const areaBLabel = deriveAreaLabel(currentScores.areaB, lang);
      const areaCLabel = deriveAreaLabel(currentScores.areaC, lang);
      const overallLabel = deriveOverallLabel(currentScores.average, lang);
      const formattedBody = [
        "Firmendaten:",
        `- Firma: ${values.company}`,
        `- Ansprechpartner: ${values.contact}`,
        `- Mitarbeiter: ${values.employeesRange}`,
        `- E-Mail: ${values.email}`,
        `- Telefon: ${values.phone}`,
        values.role ? `- Rolle: ${values.role}` : null,
        values.notes ? `- Notizen: ${values.notes}` : null,
        "",
        "Score-Zusammenfassung:",
        `- VPN/Remote: ${currentScores.areaA}/6 (${areaALabel.text})`,
        `- Web/Online: ${currentScores.areaB}/6 (${areaBLabel.text})`,
        `- Mitarbeiter-Sicherheit: ${currentScores.areaC}/6 (${areaCLabel.text})`,
        `- Gesamt: ${currentScores.average.toFixed(1)}/6 (${overallLabel.headline})`,
      ].filter(line => line !== null).join("\n");
      const mailtoUrl = `mailto:security@vonbusch.digital?subject=${encodeURIComponent(`Security-Check Anfrage von ${values.company}`)}&body=${encodeURIComponent(formattedBody)}`;
      window.location.href = mailtoUrl;
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      console.error("Failed to submit lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [stableScores, form, onSuccess, lang]);
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
                <Label htmlFor="consent" className="cursor-pointer">{t(lang, 'consent')}</Label>
                <p className="text-sm text-muted-foreground">{t(lang, 'consentText')}</p>
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
          <Button type="submit" size="lg" className="w-full btn-gradient text-lg transition-transform duration-200 hover:scale-105 active:scale-95" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {t(lang, 'submitAndConsult')}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}