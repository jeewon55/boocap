import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useVisualViewportLayout } from '@/hooks/useVisualViewportLayout';

type Props = { children: ReactNode; className?: string };

/** Lifts bottom-sheet content above the mobile soft keyboard (visualViewport). */
export function BottomSheetKeyboardLift({ children, className }: Props) {
  const { keyboardInset: inset } = useVisualViewportLayout();
  return (
    <div
      className={cn('pointer-events-none w-full sm:mx-4 sm:max-w-md', className)}
      style={{
        transform: inset > 0 ? `translateY(-${inset}px)` : undefined,
        transition: 'transform 0.18s ease-out',
      }}
    >
      <div className="pointer-events-auto w-full">{children}</div>
    </div>
  );
}
