import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, Eraser } from 'lucide-react';

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    // Sync external changes (e.g. when changing selected hotspot)
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (e, command, value = null) => {
    e.preventDefault(); // Prevent losing focus and selection
    document.execCommand(command, false, value);
    handleInput();
  };

  return (
    <div className="rich-text-editor">
      <div className="rte-toolbar">
        <button
          type="button"
          onMouseDown={(e) => executeCommand(e, 'bold')}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => executeCommand(e, 'italic')}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => executeCommand(e, 'underline')}
          title="Underline"
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => executeCommand(e, 'insertUnorderedList')}
          title="Bullet List"
        >
          <List size={14} />
        </button>

        <div className="rte-divider" style={{ width: 1, height: 16, backgroundColor: 'var(--rte-border)', margin: '0 4px' }} />

        <select
          onChange={(e) => executeCommand(e, 'formatBlock', e.target.value)}
          defaultValue="DIV"
          title="Text Style"
        >
          <option value="DIV">Normal</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="PRE">Code</option>
        </select>

        <div className="rte-color-picker-wrapper" title="Text Color" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="color"
            onChange={(e) => executeCommand(e, 'foreColor', e.target.value)}
            style={{
              width: 20,
              height: 20,
              padding: 0,
              border: '1px solid var(--rte-border)',
              borderRadius: 3,
              cursor: 'pointer',
              background: 'none'
            }}
          />
        </div>

        <button
          type="button"
          onMouseDown={(e) => executeCommand(e, 'removeFormat')}
          title="Clear Format"
        >
          <Eraser size={14} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="rte-content"
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
      />
    </div>
  );
}

export default RichTextEditor;
