import React, { ChangeEvent } from "react";
import { useEditorState } from "./hooks/useEditorState";
import { CanvasEditor } from "./components/CanvasEditor";
import { SpotList } from "./components/SpotList";
import { SpotProperties } from "./components/SpotProperties";
import { MenuEditor } from "./components/MenuEditor";
import type { Config } from "./types";

const App: React.FC = () => {
    const {
        config,
        selectedSpot,
        selectedSpotId,
        selectedMenuPath,
        setSelectedSpotId,
        setSelectedMenuPath,
        addSpot,
        deleteSpot,
        updateSpotId,
        updateSpotRect,
        setMenuForSpot,
        loadConfig
    } = useEditorState();

    const onLoadJson = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = String(reader.result);
                const json = JSON.parse(text) as Config;
                loadConfig(json);
            } catch (err) {
                alert("JSON の読み込みに失敗しました: " + String(err));
            }
        };
        reader.readAsText(file);
    };

    const onSaveJson = () => {
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "config.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="app-root">
            <div className="app-toolbar">
                <strong>ImageMap Menu Editor</strong>
                <button onClick={addSpot}>ホットスポット追加</button>

                <label>
                    JSON読み込み
                    <input
                        type="file"
                        accept="application/json"
                        onChange={onLoadJson}
                        style={{ display: "none" }}
                    />
                </label>

                <button onClick={onSaveJson}>JSON保存</button>
            </div>

            <div className="app-main">
                {/* 左ペイン：Spot一覧 */}
                <div className="app-panel">
                    <SpotList
                        spots={config.spots}
                        selectedSpotId={selectedSpotId}
                        onSelect={setSelectedSpotId}
                        onDelete={deleteSpot}
                    />
                </div>

                {/* 中央：キャンバス */}
                <CanvasEditor
                    canvas={config.canvas}
                    spots={config.spots}
                    selectedSpotId={selectedSpotId}
                    onSelectSpot={setSelectedSpotId}
                />

                {/* 右ペイン：プロパティ/メニュー */}
                <div className="app-panel-right">
                    {selectedSpot ? (
                        <>
                            <SpotProperties
                                spot={selectedSpot}
                                onChangeId={(newId) => updateSpotId(selectedSpot.id, newId)}
                                onChangeRect={(rect) => updateSpotRect(selectedSpot.id, rect)}
                            />
                            <hr />
                            <MenuEditor
                                menu={selectedSpot.menu}
                                selectedPath={selectedMenuPath}
                                onChange={(menu) => setMenuForSpot(selectedSpot.id, menu)}
                                onSelectPath={setSelectedMenuPath}
                            />
                        </>
                    ) : (
                        <p>ホットスポットを選択してください。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
