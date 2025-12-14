import { useRef, useState } from 'react';
import Hotspot from './Hotspot';

function Canvas({ image, width, height, hotspots, selectedHotspotId, onAddHotspot, onUpdateHotspot, onSelectHotspot }) {
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState(null);

    const getMousePos = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        // If clicking on a hotspot (handled by stopPropagation in Hotspot), this won't trigger if we do it right.
        // But if we click on empty space, we start drawing.
        if (e.target.tagName !== 'svg' && e.target.tagName !== 'IMG') return;

        const pos = getMousePos(e);
        setIsDrawing(true);
        setStartPos(pos);
        setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
        onSelectHotspot(null); // Deselect when starting to draw
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        const w = pos.x - startPos.x;
        const h = pos.y - startPos.y;

        setCurrentRect({
            x: w > 0 ? startPos.x : pos.x,
            y: h > 0 ? startPos.y : pos.y,
            w: Math.abs(w),
            h: Math.abs(h)
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentRect && currentRect.w > 10 && currentRect.h > 10) {
            onAddHotspot(currentRect);
        }
        setCurrentRect(null);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: width,
                height: height,
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <img
                src={image}
                alt="Canvas"
                style={{ width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }}
                draggable={false}
            />

            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible'
                }}
            >
                {hotspots.map(h => (
                    <Hotspot
                        key={h.id}
                        data={h}
                        isSelected={h.id === selectedHotspotId}
                        onSelect={() => onSelectHotspot(h.id)}
                        onUpdate={(updates) => onUpdateHotspot(h.id, updates)}
                        containerSize={{ width, height }}
                    />
                ))}

                {currentRect && (
                    <rect
                        x={currentRect.x}
                        y={currentRect.y}
                        width={currentRect.w}
                        height={currentRect.h}
                        fill="rgba(0, 0, 255, 0.1)"
                        stroke="#00f"
                        strokeDasharray="4"
                        pointerEvents="none"
                    />
                )}
            </svg>
        </div>
    );
}

export default Canvas;
