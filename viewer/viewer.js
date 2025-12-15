document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('image-map-container');

    // Load configuration using XMLHttpRequest for IE11
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    renderImageMap(data, container);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            } else {
                console.error('Error loading map data:', xhr.statusText);
            }
        }
    };
    xhr.send();
});

function renderImageMap(data, container) {
    // 1. Render Image
    var img = document.createElement('img');
    img.src = data.imageUrl || 'https://placehold.co/800x600';
    img.width = data.canvas.width;
    img.height = data.canvas.height;
    container.appendChild(img);

    // 2. Render SVG Overlay
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', data.canvas.width);
    svg.setAttribute('height', data.canvas.height);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none'; // Let clicks pass through to image if needed, but polygons will capture events
    container.appendChild(svg);

    // 3. Render Hotspots
    data.hotspots.forEach(function(hotspot) {
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        // Handle both old rect format (for backward compat if needed) and new points format
        var pointsStr = "";
        if (hotspot.points) {
            pointsStr = hotspot.points.map(function(p) {
                return p.x + ',' + p.y;
            }).join(' ');
        } else if (hotspot.rect) {
            var x = hotspot.rect.x;
            var y = hotspot.rect.y;
            var w = hotspot.rect.w;
            var h = hotspot.rect.h;
            pointsStr = x + ',' + y + ' ' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + h) + ' ' + x + ',' + (y + h);
        }

        polygon.setAttribute('points', pointsStr);
        polygon.setAttribute('class', 'hotspot-polygon'); // Add class for styling
        polygon.style.fill = 'transparent'; // Or debug color
        polygon.style.pointerEvents = 'all'; // Enable interaction
        polygon.style.cursor = 'pointer';

        if (hotspot.props.tooltip) {
            var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = hotspot.props.tooltip;
            polygon.appendChild(title);
        }

        // Attach event listeners
        if (hotspot.type === 'link') {
            polygon.addEventListener('click', function() {
                window.open(hotspot.props.url, '_blank');
            });
        } else if (hotspot.type === 'folder') {
            var menu = createMenu(hotspot.props.items);
            menu.classList.add('hotspot-menu');
            container.appendChild(menu);

            var timeout;
            var cancelHide = function() { clearTimeout(timeout); };

            var show = function() {
                cancelHide(); // Cancel any pending hide (e.g. from leaving menu back to hotspot)
                var bbox = polygon.getBBox();
                var centerX = bbox.x + bbox.width / 2;
                var centerY = bbox.y + bbox.height / 2;

                menu.classList.add('visible');
                polygon.classList.add('active'); // Keep highlight

                // Center the menu
                var menuRect = menu.getBoundingClientRect();
                menu.style.left = (centerX - menuRect.width / 2) + 'px';
                menu.style.top = (centerY - menuRect.height / 2) + 'px';
            };

            var hide = function() {
                timeout = setTimeout(function() {
                    menu.classList.remove('visible');
                    polygon.classList.remove('active');
                }, 100); // Short timeout to allow moving to menu
            };

            polygon.addEventListener('mouseenter', show);
            polygon.addEventListener('mouseleave', hide);

            // Keep menu open if hovering over it
            menu.addEventListener('mouseenter', function() {
                cancelHide();
                polygon.classList.add('active');
            });
            menu.addEventListener('mouseleave', function() {
                hide();
            });
        }

        svg.appendChild(polygon);
    });
}

function createMenu(items) {
    var list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.margin = '0';
    list.style.padding = '0';

    items.forEach(function(item) {
        var li = document.createElement('li');

        var a = document.createElement('a');
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
            var subMenu = createMenu(item.children);
            subMenu.classList.add('submenu');
            li.appendChild(subMenu);

            // JS-based parent highlighting to ensure precision
            subMenu.addEventListener('mouseenter', function() {
                a.classList.add('highlighted');
            });
            subMenu.addEventListener('mouseleave', function() {
                a.classList.remove('highlighted');
            });

            // Safety: Ensure highlight is removed when leaving the parent li
            li.addEventListener('mouseleave', function() {
                a.classList.remove('highlighted');
            });
        }

        list.appendChild(li);
    });

    return list;
}
