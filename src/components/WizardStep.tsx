import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WizardStepProps {
  children: ReactNode;
  visible: boolean;
}

export function WizardStep({ children, visible }: WizardStepProps) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex min-h-[100dvh] w-full flex-col overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
