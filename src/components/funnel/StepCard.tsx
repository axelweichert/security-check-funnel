import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question, AnswerId } from "@/lib/funnel";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
interface StepCardProps {
  question: Question;
  value: AnswerId | null;
  onValueChange: (value: AnswerId) => void;
  className?: string;
}
export function StepCard({ question, value, onValueChange, className }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card className="w-full shadow-soft overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-foreground">{question.text}</CardTitle>
          {question.subtext && (
            <CardDescription className="text-base text-muted-foreground pt-1">
              {question.subtext}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup value={value || undefined} onValueChange={onValueChange} className="gap-4">
            {question.options.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200",
                    value === option.id
                      ? "bg-primary/10 border-primary shadow-inner"
                      : "bg-background hover:bg-accent"
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <span className="text-base font-medium text-foreground">{option.text}</span>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}