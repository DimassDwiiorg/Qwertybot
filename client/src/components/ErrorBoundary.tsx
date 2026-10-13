import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary uncaught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Gagal membersihkan storage:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || this.state.error?.toString() || 'Kesalahan yang tidak diketahui';

      return (
        <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] font-sans antialiased">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#202024] rounded-3xl border border-[#E5E3DB] dark:border-[#2E2E33] shadow-2xl space-y-6 text-center">
            {/* Icon & Title */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center border border-[#DA7756]/20 shadow-xs">
                <AlertTriangle size={28} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                Terjadi Kendala pada Tampilan
              </h1>
              <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] max-w-md leading-relaxed">
                Halaman mengalami kesalahan saat merender sesi atau data akun. Anda dapat memuat ulang atau mereset cache lokal untuk memulihkan aplikasi secara normal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#DA7756] hover:bg-[#DA7756]/90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw size={14} />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-medium text-[#23201D] dark:text-[#F4F4F5] flex items-center justify-center gap-2 transition-colors"
                title="Hapus riwayat lokal yang rusak dan muat ulang"
              >
                <Trash2 size={14} className="text-red-500" />
                <span>Bersihkan Cache & Reset</span>
              </button>
            </div>

            {/* Error Detail Accordion */}
            <div className="pt-2 border-t border-[#E5E3DB]/60 dark:border-[#2E2E33]/60 text-left">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between py-1.5 text-[11px] font-medium text-[#8C8782] dark:text-[#71717A] hover:text-[#23201D] dark:hover:text-white transition-colors"
              >
                <span>Detail Teknis Masalah</span>
                {this.state.showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 font-mono text-[10px] text-red-600 dark:text-red-400 overflow-x-auto max-h-48 whitespace-pre-wrap leading-tight select-all">
                  <div className="font-bold mb-1">Pesan: {errorMsg}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="opacity-80 text-[#65605B] dark:text-[#A1A1AA] mt-1 text-[9px]">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#8C8782] dark:text-[#71717A]">
              <a href="/" className="hover:text-[#DA7756] transition inline-flex items-center gap-1">
                <Home size={12} />
                <span>Kembali ke Beranda</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
