import { useState, useEffect } from 'react';

/**
 * How many pixels of the layout viewport bottom are covered (typically by the
 * on-screen keyboard). Use with e.g. translateY(-inset) on bottom sheets.
 */
export function useVisualViewportKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const obscured = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
      setInset(Math.round(obscured));
    };

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

  return inset;
}
