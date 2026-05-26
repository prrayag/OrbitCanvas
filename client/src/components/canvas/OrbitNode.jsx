import { useState, useCallback, useRef, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import SparkleMenu from './SparkleMenu';

/**
 * OrbitNode — Premium dark canvas card with inline editing,
 * AI sparkle trigger, and streaming state.
 */
function OrbitNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const textRef = useRef(null);

  const isStreaming = data?.isStreaming || false;
  const label = data?.label || '';

  const handleTextChange = useCallback((e) => {
    const newLabel = e.target.value;
    if (data?.onTextChange) {
      data.onTextChange(id, newLabel);
    }
  }, [id, data]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  }, [id, data]);

  const handleSparkleAction = useCallback((actionType) => {
    setShowSparkle(false);
    if (data?.onAIGenerate) {
      data.onAIGenerate(id, label, actionType);
    }
  }, [id, label, data]);

  const handleSparkleToggle = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowSparkle((prev) => !prev);
  }, []);

  const handleStartEdit = useCallback((e) => {
    e.stopPropagation();
    if (!isStreaming) {
      setIsEditing(true);
    }
  }, [isStreaming]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Split for AI-generated nodes that have title\ndescription
  const lines = label.split('\n');
  const title = lines[0] || '';
  const description = lines.slice(1).join('\n');

  return (
    <div
      className={`
        orbit-node group relative
        ${isStreaming ? 'orbit-node--streaming' : ''}
        ${selected ? 'orbit-node--selected' : ''}
      `}
    >
      {/* Top connection handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="orbit-handle"
      />

      {/* Drag bar + actions */}
      <div className="orbit-drag-handle orbit-node__header">
        <div className="orbit-node__header-left">
          <div className="opacity-30 text-[8px] tracking-widest px-1 font-mono select-none">
            ::::
          </div>
        </div>
        <div className="orbit-node__header-right">
          {!isStreaming && (
            <button
              onClick={handleSparkleToggle}
              className={`orbit-node__sparkle-btn nodrag ${showSparkle ? 'active' : ''}`}
              title="AI Actions"
            >
              ✦
            </button>
          )}
          <button
            onClick={handleDelete}
            className="orbit-node__delete-btn nodrag"
            title="Delete"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="orbit-node__body">
        {isEditing && !isStreaming ? (
          <textarea
            ref={textRef}
            value={label}
            onChange={handleTextChange}
            onBlur={handleBlur}
            autoFocus
            rows={3}
            className="orbit-node__textarea nodrag nowheel"
            placeholder="Type your idea..."
          />
        ) : (
          <div
            onDoubleClick={handleStartEdit}
            className={`orbit-node__content ${isStreaming ? '' : 'cursor-text'}`}
          >
            {title ? (
              <>
                <p className="orbit-node__title">{title}</p>
                {description && (
                  <p className="orbit-node__desc">{description}</p>
                )}
              </>
            ) : (
              <p className="orbit-node__placeholder">Double-click to type...</p>
            )}

            {isStreaming && (
              <div className="orbit-node__streaming-indicator">
                <span className="orbit-node__streaming-dot" />
                <span className="orbit-node__streaming-dot" style={{ animationDelay: '0.15s' }} />
                <span className="orbit-node__streaming-dot" style={{ animationDelay: '0.3s' }} />
                <span className="orbit-node__streaming-label">streaming</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sparkle Menu */}
      {showSparkle && (
        <SparkleMenu
          onSelect={handleSparkleAction}
          onClose={() => setShowSparkle(false)}
        />
      )}

      {/* Bottom connection handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="orbit-handle"
      />
    </div>
  );
}

export default memo(OrbitNode);
