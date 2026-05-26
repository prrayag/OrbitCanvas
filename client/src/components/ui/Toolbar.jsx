import { memo } from 'react';
import { MousePointer2, Hand, Type, Share2 } from 'lucide-react';

/**
 * Toolbar — Left-side minimal tool palette.
 * (Currently visual — tools are handled by React Flow built-in interactions)
 */
function Toolbar() {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-1 p-1.5 bg-orbit-card/85 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <ToolButton icon={MousePointer2} label="Select" active />
        <ToolButton icon={Hand} label="Pan" />
        <ToolButton icon={Type} label="Add Node" />
        <ToolButton icon={Share2} label="Connect" />
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, label, active }) {
  return (
    <button
      className={`
        p-2.5 rounded-lg text-orbit-text-muted hover:text-orbit-text hover:bg-white/[0.04] transition-all duration-200
        ${active ? 'bg-white/[0.08] text-white' : ''}
      `}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}

export default memo(Toolbar);
