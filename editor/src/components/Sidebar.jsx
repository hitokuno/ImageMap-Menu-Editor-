import MenuEditor from './MenuEditor';

function Sidebar({ hotspot, onUpdate, onDelete }) {
    if (!hotspot) {
        return (
            <div className="sidebar">
                <p>Select a hotspot to edit properties.</p>
            </div>
        );
    }

    const { type, props } = hotspot;

    const handleChange = (field, value) => {
        onUpdate({ props: { ...props, [field]: value } });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        // Preserve common props if possible, or reset specific ones
        onUpdate({
            type: newType,
            props: {
                ...props,
                url: newType === 'link' ? props.url || '' : undefined,
                items: newType === 'folder' ? props.items || [] : undefined
            }
        });
    };

    return (
        <div className="sidebar">
            <h3>Properties</h3>

            <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={handleTypeChange}>
                    <option value="link">Link</option>
                    <option value="folder">Folder</option>
                </select>
            </div>

            <div className="form-group">
                <label>Tooltip</label>
                <input
                    type="text"
                    value={props.tooltip || ''}
                    onChange={(e) => handleChange('tooltip', e.target.value)}
                />
            </div>

            {type === 'link' && (
                <div className="form-group">
                    <label>URL</label>
                    <input
                        type="text"
                        value={props.url || ''}
                        onChange={(e) => handleChange('url', e.target.value)}
                    />
                </div>
            )}

            {type === 'folder' && (
                <div className="form-group">
                    <label>Menu Items</label>
                    <MenuEditor
                        items={props.items || []}
                        onChange={(items) => handleChange('items', items)}
                    />
                </div>
            )}

            <div style={{ marginTop: 20 }}>
                <button onClick={onDelete} style={{ color: 'red' }}>Delete Hotspot</button>
            </div>
        </div>
    );
}

export default Sidebar;
