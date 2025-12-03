import React from "react";
import type { MenuItem } from "../types";
import type { MenuPath } from "../hooks/useEditorState";
import { MenuTree } from "./MenuTree";

type Props = {
    menu: MenuItem[];
    selectedPath: MenuPath | null;
    onChange: (menu: MenuItem[]) => void;
    onSelectPath: (path: MenuPath | null) => void;
};

export const MenuEditor: React.FC<Props> = ({
    menu,
    selectedPath,
    onChange,
    onSelectPath
}) => {
    const getItemByPath = (path: MenuPath): MenuItem | null => {
        let cur: MenuItem | undefined;
        let list = menu;
        for (const idx of path) {
            cur = list[idx];
            if (!cur) return null;
            if (idx === path[path.length - 1]) break;
            list = cur.children ?? [];
        }
        return cur ?? null;
    };

    const updateItemByPath = (path: MenuPath, updater: (item: MenuItem) => MenuItem) => {
        const newMenu = structuredClone(menu) as MenuItem[];
        let list = newMenu;
        for (let i = 0; i < path.length; i++) {
            const idx = path[i];
            if (i === path.length - 1) {
                list[idx] = updater(list[idx]);
            } else {
                list = list[idx].children ?? [];
            }
        }
        onChange(newMenu);
    };

    const deleteItemByPath = (path: MenuPath) => {
        const newMenu = structuredClone(menu) as MenuItem[];
        let list = newMenu;
        for (let i = 0; i < path.length - 1; i++) {
            const idx = path[i];
            list = list[idx].children ?? [];
        }
        list.splice(path[path.length - 1], 1);
        onChange(newMenu);
        onSelectPath(null);
    };

    const addParent = () => {
        const newItem: MenuItem = {
            title: "新規カテゴリ",
            children: []
        };
        onChange([...menu, newItem]);
    };

    const addSingle = () => {
        const newItem: MenuItem = {
            title: "新規メニュー",
            url: "https://example.com/"
        };
        onChange([...menu, newItem]);
    };

    const addChildTo = (path: MenuPath) => {
        const item = getItemByPath(path);
        if (!item) return;
        const child: MenuItem = {
            title: "子メニュー",
            url: "https://example.com/"
        };
        updateItemByPath(path, (it) => ({
            ...it,
            children: [...(it.children ?? []), child]
        }));
    };

    const selectedItem =
        selectedPath && selectedPath.length > 0 ? getItemByPath(selectedPath) : null;

    const handleTitleChange = (title: string) => {
        if (!selectedPath || !selectedItem) return;
        updateItemByPath(selectedPath, (item) => ({ ...item, title }));
    };

    const handleUrlChange = (url: string) => {
        if (!selectedPath || !selectedItem) return;
        updateItemByPath(selectedPath, (item) => ({ ...item, url }));
    };

    const handleDelete = () => {
        if (!selectedPath) return;
        if (!confirm("このメニュー項目を削除しますか？")) return;
        deleteItemByPath(selectedPath);
    };

    const isParent =
        selectedItem && selectedItem.children && selectedItem.children.length >= 0;
    const canAddChild =
        selectedItem && selectedItem.children !== undefined; // 親メニューにだけ子追加

    const isLeaf = selectedItem && !selectedItem.children;

    return (
        <div>
            <h3>メニュー編集</h3>
            <div style={{ marginBottom: 8 }}>
                <button onClick={addParent}>親メニュー追加</button>{" "}
                <button onClick={addSingle}>単独メニュー追加</button>
            </div>

            <MenuTree
                items={menu}
                selectedPath={selectedPath ?? []}
                onSelectPath={onSelectPath}
            />

            <hr />

            {selectedItem ? (
                <div>
                    <h4>選択中の項目</h4>
                    <div>
                        <label>
                            タイトル:
                            <input
                                type="text"
                                value={selectedItem.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                style={{ width: "100%" }}
                            />
                        </label>
                    </div>

                    {isLeaf && (
                        <div style={{ marginTop: 6 }}>
                            <label>
                                URL:
                                <input
                                    type="text"
                                    value={selectedItem.url ?? ""}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    style={{ width: "100%" }}
                                />
                            </label>
                        </div>
                    )}

                    {canAddChild && (
                        <div style={{ marginTop: 6 }}>
                            <button
                                onClick={() =>
                                    selectedPath && addChildTo(selectedPath)
                                }
                            >
                                子メニュー追加
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: 6 }}>
                        <button onClick={handleDelete}>削除</button>
                    </div>
                </div>
            ) : (
                <p>メニュー項目を選択してください。</p>
            )}
        </div>
    );
};
