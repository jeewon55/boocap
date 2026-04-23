/**
 * Minimal ResizeObserver for environments that lack it (embedded browsers, some webviews).
 * Uses window "resize" + microtask; sufficient for our scale-to-width layouts.
 */
export function installResizeObserverPolyfill(): void {
  if (typeof window === 'undefined') return;
  if (typeof globalThis.ResizeObserver !== 'undefined') return;

  globalThis.ResizeObserver = class ResizeObserver implements ResizeObserver {
    private readonly callback: ResizeObserverCallback;
    private readonly observed = new Set<Element>();
    private readonly boundFire: () => void;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      this.boundFire = () => {
        for (const target of this.observed) {
          const el = target as HTMLElement;
          const rect = el.getBoundingClientRect();
          const entries = [
            {
              target,
              contentRect: rect,
              borderBoxSize: undefined,
              contentBoxSize: undefined,
              devicePixelContentBoxSize: undefined,
            } as ResizeObserverEntry,
          ];
          try {
            this.callback(entries, this);
          } catch {
            /* ignore consumer errors */
          }
        }
      };
    }

    observe(target: Element): void {
      if (this.observed.size === 0) {
        window.addEventListener('resize', this.boundFire);
      }
      this.observed.add(target);
      queueMicrotask(this.boundFire);
    }

    unobserve(target: Element): void {
      this.observed.delete(target);
      if (this.observed.size === 0) {
        window.removeEventListener('resize', this.boundFire);
      }
    }

    disconnect(): void {
      this.observed.clear();
      window.removeEventListener('resize', this.boundFire);
    }
  } as unknown as typeof ResizeObserver;
}
