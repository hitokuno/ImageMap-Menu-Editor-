import { useState, useEffect } from 'react';

function Hotspot({ data, isSelected, onSelect, onUpdate, containerSize }) {
    const { points } = data;
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [draggingVertexIndex, setDraggingVertexIndex] = useState(null);

    // Helper to format points for polygon points attribute
    const pointsStr = points.map(p => `${p.x},${p.y} `).join(' ');

    const handleMouseDown = (e) => {
        e.stopPropagation();
        onSelect();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const handleGlobalMove = (e) => {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            if (draggingVertexIndex !== null) {
                // Move single vertex
                const newPoints = [...points];
                const p = newPoints[draggingVertexIndex];
                newPoints[draggingVertexIndex] = {
                    x: Math.max(0, Math.min(containerSize.width, p.x + dx)),
                    y: Math.max(0, Math.min(containerSize.height, p.y + dy))
                };
                onUpdate({ points: newPoints });
                setDragStart({ x: e.clientX, y: e.clientY });
            } else if (isDragging) {
                // Move entire polygon
                const newPoints = points.map(p => ({
                    x: Math.max(0, Math.min(containerSize.width, p.x + dx)),
                    y: Math.max(0, Math.min(containerSize.height, p.y + dy))
                }));

                // Check boundaries roughly (clamping all points)
                // A better way is to check if ANY point goes out, but clamping individually distorts shape if hitting edge.
                // For now, let's just apply delta and clamp.
                // To prevent distortion, we should calculate max allowed delta.
                // But simple clamping is okay for prototype.

                onUpdate({ points: newPoints });
                setDragStart({ x: e.clientX, y: e.clientY });
            }
        };

        const handleGlobalUp = () => {
            setIsDragging(false);
            setDraggingVertexIndex(null);
        };

        if (isDragging || draggingVertexIndex !== null) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
        };
    }, [isDragging, draggingVertexIndex, dragStart, points, containerSize, onUpdate]);

    const handleVertexDown = (e, index) => {
        e.stopPropagation();
        setDraggingVertexIndex(index);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    return (
        <g>
            <polygon
                points={pointsStr}
                fill={isSelected ? 'rgba(0,0,255,0.2)' : 'rgba(0,0,255,0.1)'}
                stroke={isSelected ? '#00f' : 'rgba(0,0,255,0.5)'}
                strokeWidth="2"
                cursor="move"
                onMouseDown={handleMouseDown}
            />

            {isSelected && points.map((p, i) => (
                <rect
                    key={i}
                    x={p.x - 4}
                    y={p.y - 4}
                    width={8}
                    height={8}
                    fill="white"
                    stroke="#00f"
                    cursor="pointer"
                    onMouseDown={(e) => handleVertexDown(e, i)}
                />
            ))}
        </g>
    );
}

export default Hotspot;
