import { useState } from "react";
import type { Config, Spot, MenuItem } from "../types";

const defaultConfig: Config = {
    canvas: {
        width: 800,
        height: 500,
        image: "../runtime/floor.png"
    },
    spots: [
        {
            id: "s01",
            rect: [100, 80, 250, 180],
            menu: [
                {
                    title: "カテゴリA",
                    children: [
                        { title: "A-1", url: "https://example.com/a1" },
                        { title: "A-2", url: "https://example.com/a2" }
                    ]
                },
                {
                    title: "単独リンクB",
                    url: "https://example.com/b"
                }
            ]
        }
    ]
};

export type MenuPath = number[]; // e.g. [0] or [0,1] etc.

export function useEditorState() {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(
        config.spots[0]?.id ?? null
    );
    const [selectedMenuPath, setSelectedMenuPath] = useState<MenuPath | null>(
        null
    );

    const selectedSpot = config.spots.find((s) => s.id === selectedSpotId) ?? null;

    const updateSpot = (id: string, updater: (spot: Spot) => Spot) => {
        setConfig((prev) => ({
            ...prev,
            spots: prev.spots.map((s) => (s.id === id ? updater(s) : s))
        }));
    };

    const addSpot = () => {
        const newId = `spot${config.spots.length + 1}`;
        const newSpot: Spot = {
            id: newId,
            rect: [50, 50, 150, 120],
            menu: [
                {
                    title: "新規メニュー",
                    url: "https://example.com/"
                }
            ]
        };
        setConfig((prev) => ({
            ...prev,
            spots: [...prev.spots, newSpot]
        }));
        setSelectedSpotId(newId);
        setSelectedMenuPath(null);
    };

    const deleteSpot = (id: string) => {
        setConfig((prev) => ({
            ...prev,
            spots: prev.spots.filter((s) => s.id !== id)
        }));
        if (selectedSpotId === id) {
            setSelectedSpotId(config.spots[0]?.id ?? null);
            setSelectedMenuPath(null);
        }
    };

    const updateSpotId = (oldId: string, newId: string) => {
        if (!newId.trim()) return;
        setConfig((prev) => ({
            ...prev,
            spots: prev.spots.map((s) =>
                s.id === oldId
                    ? {
                        ...s,
                        id: newId
                    }
                    : s
            )
        }));
        setSelectedSpotId(newId);
    };

    const updateSpotRect = (
        id: string,
        rect: [number, number, number, number]
    ) => {
        updateSpot(id, (spot) => ({ ...spot, rect }));
    };

    const setMenuForSpot = (id: string, menu: MenuItem[]) => {
        updateSpot(id, (spot) => ({ ...spot, menu }));
    };

    const loadConfig = (c: Config) => {
        setConfig(c);
        setSelectedSpotId(c.spots[0]?.id ?? null);
        setSelectedMenuPath(null);
    };

    return {
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
    };
}
