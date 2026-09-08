/**
 * ErrorBoundary — Catches render errors, shows fallback UI.
 * Phase 22: Production ready error handling.
 */
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-6 text-center space-y-4">
            <div className="text-4xl">{"\u{1F6A8}"}</div>
            <h2 className="text-xl font-bold text-slate-800">Terjadi Kesalahan</h2>
            <p className="text-sm text-slate-500">
              Sepertinya ada masalah. Coba muat ulang halaman.
            </p>
            {this.state.error && (
              <p className="text-xs text-red-400 bg-red-50 rounded-lg p-2 break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
