import { useEffect, useRef, useState } from 'react';
import Hotspot from './Hotspot';

function PreviewMenu({ items, onTooltipEnter, onTooltipMove, onTooltipLeave }) {
    return (
        <ul className="editor-hotspot-menu-list">
            {items.map((item, index) => (
                <li key={item.id || `${item.label}-${index}`} className="editor-hotspot-menu-item-wrapper">
                    <a
                        href={item.url || '#'}
                        className={`editor-menu-item${item.children && item.children.length > 0 ? ' has-submenu' : ''}`}
                        onClick={(e) => e.preventDefault()}
                        onMouseEnter={(e) => onTooltipEnter(e, item.tooltip)}
                        onMouseMove={(e) => onTooltipMove(e, item.tooltip)}
                        onMouseLeave={onTooltipLeave}
                    >
                        {item.label}
                    </a>

                    {item.children && item.children.length > 0 && (
                        <div className="editor-submenu">
                            <PreviewMenu
                                items={item.children}
                                onTooltipEnter={onTooltipEnter}
                                onTooltipMove={onTooltipMove}
                                onTooltipLeave={onTooltipLeave}
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}

function Canvas({ image, width, height, hotspots, selectedHotspotId, onAddHotspot, onUpdateHotspot, onSelectHotspot }) {
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);
    const tooltipTimerRef = useRef(null);
    const menuHideTimerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState(null);
    const [hoveredTooltip, setHoveredTooltip] = useState(null);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [visibleMenuHotspotId, setVisibleMenuHotspotId] = useState(null);
    const tooltipDelay = 350;

    useEffect(() => {
        return () => {
            if (tooltipTimerRef.current) {
                clearTimeout(tooltipTimerRef.current);
            }
            if (menuHideTimerRef.current) {
                clearTimeout(menuHideTimerRef.current);
            }
        };
    }, []);

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
        hideTooltip(); // Clear tooltip
        hideMenu();
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

    const isTooltipEmpty = (html) => {
        if (!html) return true;
        const clean = html.replace(/<[^>]*>|&nbsp;/gi, '').trim();
        return clean === '';
    };

    const clearTooltipTimer = () => {
        if (tooltipTimerRef.current) {
            clearTimeout(tooltipTimerRef.current);
            tooltipTimerRef.current = null;
        }
    };

    const hideTooltip = () => {
        clearTooltipTimer();
        setIsTooltipVisible(false);
    };

    const clearMenuHideTimer = () => {
        if (menuHideTimerRef.current) {
            clearTimeout(menuHideTimerRef.current);
            menuHideTimerRef.current = null;
        }
    };

    const hideMenu = () => {
        clearMenuHideTimer();
        setVisibleMenuHotspotId(null);
    };

    const scheduleHideMenu = () => {
        clearMenuHideTimer();
        menuHideTimerRef.current = setTimeout(() => {
            setVisibleMenuHotspotId(null);
        }, 100);
    };

    const showMenu = (hotspot) => {
        clearMenuHideTimer();
        setVisibleMenuHotspotId(hotspot.id);
    };

    const updateTooltipPos = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const offset = 24;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 250;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 80;
        let left = x + offset;
        let top = y + offset;
        const maxLeft = rect.width - tooltipWidth - 8;
        const maxTop = rect.height - tooltipHeight - 8;

        if (left > maxLeft) {
            left = x - tooltipWidth - offset;
        }

        if (top > maxTop) {
            top = y - tooltipHeight - offset;
        }

        setTooltipPos({
            x: Math.max(8, left),
            y: Math.max(8, top)
        });
    };

    const scheduleTooltip = (tooltip, e) => {
        if (isDrawing || isTooltipEmpty(tooltip)) return;

        clearTooltipTimer();
        setIsTooltipVisible(false);
        setHoveredTooltip(tooltip);
        tooltipTimerRef.current = setTimeout(() => {
            updateTooltipPos(e);
            setIsTooltipVisible(true);
        }, tooltipDelay);
    };

    const handleHotspotMouseEnter = (e, hotspot) => {
        scheduleTooltip(hotspot.props.tooltip, e);
        if (hotspot.type === 'folder' && hotspot.props.items?.length) {
            showMenu(hotspot);
        } else {
            hideMenu();
        }
    };

    const handleHotspotMouseMove = (e, hotspot) => {
        const tooltip = hotspot.props.tooltip;
        if (!isTooltipEmpty(tooltip)) {
            hideTooltip();
            scheduleTooltip(tooltip, e);
        }
        if (hotspot.type === 'folder' && hotspot.props.items?.length) {
            showMenu(hotspot);
        } else {
            hideMenu();
        }
    };

    const handleHotspotMouseLeave = (hotspot) => {
        hideTooltip();
        if (hotspot.type === 'folder' && hotspot.props.items?.length) {
            scheduleHideMenu();
        }
    };

    const getHotspotBounds = (points) => {
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    };

    const getMenuPosition = (hotspot) => {
        const bounds = getHotspotBounds(hotspot.points);
        return {
            left: bounds.minX + (bounds.maxX - bounds.minX) / 2,
            top: bounds.minY + (bounds.maxY - bounds.minY) / 2
        };
    };

    const handleMenuMouseEnter = () => {
        clearMenuHideTimer();
    };

    const handleMenuMouseLeave = () => {
        scheduleHideMenu();
        hideTooltip();
    };

    const handleMenuItemTooltipEnter = (e, tooltip) => {
        scheduleTooltip(tooltip, e);
    };

    const handleMenuItemTooltipMove = (e, tooltip) => {
        if (isTooltipEmpty(tooltip)) return;
        hideTooltip();
        scheduleTooltip(tooltip, e);
    };

    const handleMenuItemTooltipLeave = () => {
        hideTooltip();
    };

    const visibleMenuHotspot = hotspots.find((hotspot) => hotspot.id === visibleMenuHotspotId);
    const visibleMenuPosition = visibleMenuHotspot ? getMenuPosition(visibleMenuHotspot) : null;

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
                        onMouseEnter={handleHotspotMouseEnter}
                        onMouseMove={handleHotspotMouseMove}
                        onMouseLeave={handleHotspotMouseLeave}
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

            {visibleMenuHotspot && visibleMenuPosition && (
                <div
                    className="editor-hotspot-menu visible"
                    style={{
                        left: visibleMenuPosition.left,
                        top: visibleMenuPosition.top
                    }}
                    onMouseEnter={handleMenuMouseEnter}
                    onMouseLeave={handleMenuMouseLeave}
                >
                    <PreviewMenu
                        items={visibleMenuHotspot.props.items || []}
                        onTooltipEnter={handleMenuItemTooltipEnter}
                        onTooltipMove={handleMenuItemTooltipMove}
                        onTooltipLeave={handleMenuItemTooltipLeave}
                    />
                </div>
            )}

            {hoveredTooltip && !isDrawing && (
                <div
                    ref={tooltipRef}
                    className="hotspot-tooltip-preview"
                    style={{
                        position: 'absolute',
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}
                    data-visible={isTooltipVisible ? 'true' : 'false'}
                    dangerouslySetInnerHTML={{ __html: hoveredTooltip }}
                />
            )}
        </div>
    );
}

export default Canvas;
