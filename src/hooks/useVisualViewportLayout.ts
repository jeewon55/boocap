import { useState, useEffect } from 'react';

export type VisualViewportLayout = {
  /** Pixels of layout viewport bottom covered by the soft keyboard (etc.). */
  keyboardInset: number;
  /** `visualViewport.height` — paintable area above the keyboard. */
  visibleHeight: number;
};

function readLayout(): VisualViewportLayout {
  const vv = window.visualViewport;
  if (!vv) {
    return { keyboardInset: 0, visibleHeight: window.innerHeight };
  }
  const keyboardInset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
  return {
    keyboardInset: Math.round(keyboardInset),
    visibleHeight: Math.round(vv.height),
  };
}

/** Resize / keyboard-safe metrics from `window.visualViewport`. */
export function useVisualViewportLayout(): VisualViewportLayout {
  const [layout, setLayout] = useState<VisualViewportLayout>(() =>
    typeof window !== 'undefined' ? readLayout() : { keyboardInset: 0, visibleHeight: 0 },
  );

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setLayout(readLayout());

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return layout;
}
