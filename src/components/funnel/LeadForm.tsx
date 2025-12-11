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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Lead } from "@shared/types";
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
});
type LeadFormValues = z.infer<typeof formSchema>;
interface LeadFormProps {
  scores: AreaScores & { average: number };
  onSuccess: () => void;
}
export function LeadForm({ scores, onSuccess }: LeadFormProps) {
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
    },
  });
  async function onSubmit(values: LeadFormValues) {
    setIsSubmitting(true);
    const leadPayload: Omit<Lead, 'id' | 'createdAt'> = {
      ...values,
      scoreSummary: {
        areaA: scores.areaA,
        areaB: scores.areaB,
        areaC: scores.areaC,
        average: scores.average,
      },
    };
    try {
      await api<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadPayload),
      });
      toast.success("Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.");
      onSuccess();
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      console.error("Failed to submit lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-soft border"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-display text-foreground">Dein Ergebnis als Grundlage für konkrete Maßnahmen</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Trage deine Kontaktdaten ein – wir melden uns mit einer individuellen Einschätzung und konkreten Vorschlägen für dein Unternehmen.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Firmenname</FormLabel>
                <FormControl><Input placeholder="Ihre Firma GmbH" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact" render={({ field }) => (
              <FormItem>
                <FormLabel>Ansprechpartner (Vor- und Nachname)</FormLabel>
                <FormControl><Input placeholder="Max Mustermann" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="employeesRange" render={({ field }) => (
            <FormItem>
              <FormLabel>Anzahl Mitarbeitende</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Bitte auswählen" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1-20">1–20</SelectItem>
                  <SelectItem value="21-50">21–50</SelectItem>
                  <SelectItem value="51-200">51–200</SelectItem>
                  <SelectItem value="201-500">201–500</SelectItem>
                  <SelectItem value="501-2000">501–2.000</SelectItem>
                  <SelectItem value="2000+">Über 2.000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail-Adresse</FormLabel>
                <FormControl><Input type="email" placeholder="max.mustermann@firma.de" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Telefonnummer</FormLabel>
                <FormControl><Input placeholder="+49 123 456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Ihre Rolle/Funktion <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <FormControl><Input placeholder="z.B. IT-Leitung, Geschäftsführung" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Was ist aktuell deine größte Herausforderung in IT & Security? <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <FormControl><Textarea placeholder="Beschreiben Sie kurz Ihre Situation..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="consent" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="consent" className="cursor-pointer">Einverständnis</Label>
                <p className="text-sm text-muted-foreground">
                  Ich bin einverstanden, dass die von Busch GmbH und HXNWRK meine Angaben zur Kontaktaufnahme und zur individuellen Beratung zu IT-Security- und Cloud-Lösungen nutzen.
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )} />
          <Button type="submit" size="lg" className="w-full btn-gradient text-lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Ergebnis absenden & Beratung anfordern
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}