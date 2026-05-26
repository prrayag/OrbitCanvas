import { memo } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingOverlay — Full-screen loading state with orbit animation.
 */
function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-orbit-bg">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-orbit-accent/20 animate-ping absolute inset-0" />
          <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-orbit-accent animate-spin" />
        </div>
        <p className="text-sm text-orbit-text-muted font-mono">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}

export default memo(LoadingOverlay);
