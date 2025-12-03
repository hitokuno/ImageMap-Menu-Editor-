import React from "react";
import type { MenuItem } from "../types";
import type { MenuPath } from "../hooks/useEditorState";

type Props = {
    items: MenuItem[];
    basePath?: MenuPath;
    selectedPath: MenuPath | null;
    onSelectPath: (path: MenuPath) => void;
};

export const MenuTree: React.FC<Props> = ({
    items,
    basePath = [],
    selectedPath,
    onSelectPath
}) => {
    return (
        <ul style={{ listStyle: "none", paddingLeft: 12 }}>
            {items.map((item, idx) => {
                const path = [...basePath, idx];
                const isSelected =
                    selectedPath && selectedPath.join(",") === path.join(",");
                const hasChildren = !!item.children && item.children.length > 0;
                const isLeaf = !hasChildren;

                return (
                    <li key={idx}>
                        <div
                            style={{
                                padding: "2px 4px",
                                borderRadius: 4,
                                cursor: "pointer",
                                background: isSelected ? "#eef6ff" : "transparent"
                            }}
                            onClick={() => onSelectPath(path)}
                        >
                            {hasChildren ? "📂 " : "🔗 "}
                            {item.title}
                        </div>
                        {hasChildren && item.children && (
                            <MenuTree
                                items={item.children}
                                basePath={path}
                                selectedPath={selectedPath}
                                onSelectPath={onSelectPath}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
