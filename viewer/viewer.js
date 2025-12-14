document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('image-map-container');

    // Load configuration
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderImageMap(data, container);
        })
        .catch(error => console.error('Error loading map data:', error));
});

function renderImageMap(data, container) {
    // 1. Render Image
    const img = document.createElement('img');
    img.src = data.imageUrl || 'https://placehold.co/800x600';
    img.width = data.canvas.width;
    img.height = data.canvas.height;
    container.appendChild(img);

    // 2. Render SVG Overlay
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', data.canvas.width);
    svg.setAttribute('height', data.canvas.height);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none'; // Let clicks pass through to image if needed, but polygons will capture events
    container.appendChild(svg);

    // 3. Render Hotspots
    data.hotspots.forEach(hotspot => {
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        // Handle both old rect format (for backward compat if needed) and new points format
        let pointsStr = "";
        if (hotspot.points) {
            pointsStr = hotspot.points.map(p => `${p.x},${p.y}`).join(' ');
        } else if (hotspot.rect) {
            const { x, y, w, h } = hotspot.rect;
            pointsStr = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
        }

        polygon.setAttribute('points', pointsStr);
        polygon.setAttribute('class', 'hotspot-polygon'); // Add class for styling
        polygon.style.fill = 'transparent'; // Or debug color
        polygon.style.pointerEvents = 'all'; // Enable interaction
        polygon.style.cursor = 'pointer';

        if (hotspot.props.tooltip) {
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = hotspot.props.tooltip;
            polygon.appendChild(title);
        }

        // Attach event listeners
        if (hotspot.type === 'link') {
            polygon.addEventListener('click', () => {
                window.open(hotspot.props.url, '_blank');
            });
        } else if (hotspot.type === 'folder') {
            const menu = createMenu(hotspot.props.items);
            menu.classList.add('hotspot-menu');
            container.appendChild(menu);

            let timeout;
            const cancelHide = () => clearTimeout(timeout);

            const show = () => {
                cancelHide(); // Cancel any pending hide (e.g. from leaving menu back to hotspot)
                const bbox = polygon.getBBox();
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                menu.classList.add('visible');
                polygon.classList.add('active'); // Keep highlight

                // Center the menu
                // We need menu dimensions to center it perfectly.
                // Since it's display:none, we might need to show it first or use visibility:hidden.
                // But 'visible' class makes it block.
                const menuRect = menu.getBoundingClientRect();
                menu.style.left = `${centerX - menuRect.width / 2}px`;
                menu.style.top = `${centerY - menuRect.height / 2}px`;
            };

            const hide = () => {
                timeout = setTimeout(() => {
                    menu.classList.remove('visible');
                    polygon.classList.remove('active');
                }, 100); // Short timeout to allow moving to menu
            };

            polygon.addEventListener('mouseenter', show);
            polygon.addEventListener('mouseleave', hide);

            // Keep menu open if hovering over it
            menu.addEventListener('mouseenter', () => {
                cancelHide();
                polygon.classList.add('active');
            });
            menu.addEventListener('mouseleave', () => {
                hide();
            });
        }

        svg.appendChild(polygon);
    });
}

function createMenu(items) {
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.margin = '0';
    list.style.padding = '0';

    items.forEach(item => {
        const li = document.createElement('li');

        const a = document.createElement('a');
        a.className = 'menu-item';
        a.textContent = item.label;

        if (item.url) {
            a.href = item.url;
            a.target = '_blank';
        } else {
            a.href = '#';
        }

        li.appendChild(a);

        if (item.children && item.children.length > 0) {
            a.classList.add('has-submenu');
            const subMenu = createMenu(item.children);
            subMenu.classList.add('submenu');
            li.appendChild(subMenu);

            // JS-based parent highlighting to ensure precision
            subMenu.addEventListener('mouseenter', () => {
                a.classList.add('highlighted');
            });
            subMenu.addEventListener('mouseleave', () => {
                a.classList.remove('highlighted');
            });

            // Safety: Ensure highlight is removed when leaving the parent li
            // This handles cases where the submenu might disappear (display:none) before its mouseleave fires
            li.addEventListener('mouseleave', () => {
                a.classList.remove('highlighted');
            });
        }

        list.appendChild(li);
    });

    return list;
}
