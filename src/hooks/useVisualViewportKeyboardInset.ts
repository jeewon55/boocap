import { useVisualViewportLayout } from '@/hooks/useVisualViewportLayout';

/**
 * How many pixels of the layout viewport bottom are covered (typically by the
 * on-screen keyboard). Use with e.g. translateY(-inset) on bottom sheets.
 */
export function useVisualViewportKeyboardInset(): number {
  return useVisualViewportLayout().keyboardInset;
}
