// menu.js

window.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("config.json");
    const config = await res.json();

    const container = document.getElementById("canvas-container");

    // --- background image ---
    const img = document.createElement("img");
    img.src = config.canvas.image;
    img.width = config.canvas.width;
    img.height = config.canvas.height;
    img.useMap = "#map01";
    img.style.display = "block";
    container.appendChild(img);

    // --- create map ---
    const map = document.createElement("map");
    map.name = "map01";
    container.appendChild(map);

    // --- create areas & menus ---
    config.spots.forEach(spot => {
        const [x1, y1, x2, y2] = spot.rect;

        const area = document.createElement("area");
        area.shape = "rect";
        area.coords = `${x1},${y1},${x2},${y2}`;
        area.dataset.menuId = spot.id;
        map.appendChild(area);

        const menu = createMenuDOM(spot.id, spot.menu);
        container.appendChild(menu);

        // show/hide events
        area.addEventListener("mouseenter", () => showMenu(spot.id, x1, y1));
        area.addEventListener("mouseleave", () => hideMenu(spot.id));
    });
});


// ---- Menu DOM (recursive) ----

function createMenuDOM(id, menuTree) {
    const div = document.createElement("div");
    div.id = "menu-" + id;
    div.className = "popup-menu";

    const ul = document.createElement("ul");
    menuTree.forEach(item => {
        ul.appendChild(createMenuNode(item));
    });

    div.appendChild(ul);
    return div;
}

function createMenuNode(item) {
    const li = document.createElement("li");

    if (item.children) {
        // parent node
        li.textContent = item.title;
        const subUl = document.createElement("ul");
        item.children.forEach(child => {
            subUl.appendChild(createMenuNode(child));
        });
        li.appendChild(subUl);
    } else {
        // leaf node (single or child)
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_blank";
        a.textContent = item.title;
        li.appendChild(a);
    }

    return li;
}


// --- popup menu control ---

function showMenu(id, x, y) {
    const menu = document.getElementById("menu-" + id);
    menu.style.display = "block";
    menu.style.left = x + "px";
    menu.style.top = y + "px";
}

function hideMenu(id) {
    const menu = document.getElementById("menu-" + id);
    menu.style.display = "none";
}
