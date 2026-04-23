import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

/** Catches render errors so the tab is not an empty white screen. */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unknown error' };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Boocap]', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-white p-8 text-foreground">
          <h1 className="font-display text-lg font-bold">Something went wrong</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Please refresh the page. If it keeps happening, open the browser console and share the error.</p>
          <pre className="mt-4 max-w-full overflow-auto rounded border border-border bg-muted/30 p-3 font-mono text-xs">{this.state.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
