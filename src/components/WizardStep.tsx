import { ReactNode } from 'react';

interface WizardStepProps {
  children: ReactNode;
  visible: boolean;
}

export function WizardStep({ children, visible }: WizardStepProps) {
  if (!visible) return null;
  return (
    <div className="animate-fade-in w-full min-h-[calc(100dvh-60px)] flex flex-col">
      {children}
    </div>
  );
}
