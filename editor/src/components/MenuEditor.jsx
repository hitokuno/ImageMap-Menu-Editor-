import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function MenuEditor({ items, onChange }) {
    const addItem = () => {
        onChange([...items, { id: uuidv4(), label: 'New Item', url: '', children: [] }]);
    };

    const updateItem = (index, updates) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChange(newItems);
    };

    const deleteItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    return (
        <div className="menu-editor">
            {items.map((item, index) => (
                <MenuItem
                    key={item.id || index}
                    item={item}
                    onUpdate={(updates) => updateItem(index, updates)}
                    onDelete={() => deleteItem(index)}
                />
            ))}
            <button onClick={addItem} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={14} /> Add Item
            </button>
        </div>
    );
}

function MenuItem({ item, onUpdate, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ border: '1px solid #eee', padding: 5, marginBottom: 5, borderRadius: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <input
                    type="text"
                    value={item.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    placeholder="Label"
                    style={{ flex: 1 }}
                />
                <button onClick={onDelete} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>
                    <Trash size={14} />
                </button>
            </div>

            {expanded && (
                <div style={{ paddingLeft: 20 }}>
                    <div style={{ marginBottom: 5 }}>
                        <label style={{ fontSize: 12 }}>URL (optional)</label>
                        <input
                            type="text"
                            value={item.url || ''}
                            onChange={(e) => onUpdate({ url: e.target.value })}
                            placeholder="https://..."
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 12 }}>Sub-items</label>
                        <MenuEditor
                            items={item.children || []}
                            onChange={(children) => onUpdate({ children })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default MenuEditor;
