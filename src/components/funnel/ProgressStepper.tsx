import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}
export function ProgressStepper({ currentStep, totalSteps, stepTitle }: ProgressStepperProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto space-y-3"
    >
      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>{`Schritt ${currentStep + 1} von ${totalSteps}`}</span>
        <span>{stepTitle}</span>
      </div>
      <Progress value={progressValue} className="w-full h-2" />
    </motion.div>
  );
}