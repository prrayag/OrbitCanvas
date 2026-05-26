import { memo, useCallback } from 'react';

const AI_ACTIONS = [
  {
    id: 'brainstorm',
    label: 'Brainstorm Features',
    cmd: '001',
  },
  {
    id: 'deconstruct',
    label: 'Deconstruct Tech Stack',
    cmd: '002',
  },
  {
    id: 'ideas',
    label: 'Generate Ideas',
    cmd: '003',
  },
  {
    id: 'deepdive',
    label: 'Deep Dive',
    cmd: '004',
  },
];

function SparkleMenu({ onSelect, onClose }) {
  const handleSelect = useCallback((actionId) => {
    onSelect(actionId);
  }, [onSelect]);

  const handleBackdropClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
        onMouseDown={(e) => e.stopPropagation()}
      />

      {/* Menu */}
      <div
        className="absolute right-0 bottom-full mb-2 z-50 menu-enter"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/[0.1] rounded-lg overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)] min-w-[240px] p-1.5">
          <div className="px-2 py-2 mb-1 border-b border-white/[0.05]">
            <p className="text-[9px] font-mono text-orbit-text-muted/60 uppercase tracking-[0.2em]">
              Select Action
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {AI_ACTIONS.map((action) => {
              return (
                <button
                  key={action.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(action.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="group w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-mono text-orbit-text-muted hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-orbit-accent/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {'>'}
                    </span>
                    <span>{action.label}</span>
                  </div>
                  <span className="text-[9px] opacity-30 group-hover:opacity-60 transition-opacity">
                    {action.cmd}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(SparkleMenu);
