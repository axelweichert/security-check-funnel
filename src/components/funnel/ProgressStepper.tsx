import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}
const steps = [
  { index: 0, title: "Basis-Check" },
  { index: 1, title: "Details" },
  { index: 2, title: "Reifegrad" },
];
export function ProgressStepper({ currentStep, totalSteps, stepTitle }: ProgressStepperProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto space-y-4"
    >
      <div className="hidden md:flex justify-between items-center relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2" style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%`, transition: 'width 0.5s ease-out' }} />
        {steps.map((step) => (
          <div key={step.index} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500",
                currentStep >= step.index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {step.index + 1}
            </div>
            <span className={cn("text-xs mt-2", currentStep >= step.index ? "text-foreground font-semibold" : "text-muted-foreground")}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-2">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-1">
          <span>{`Schritt ${currentStep + 1} von ${totalSteps}`}</span>
          <span>{stepTitle}</span>
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </div>
    </motion.div>
  );
}