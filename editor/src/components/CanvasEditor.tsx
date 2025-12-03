import React from "react";
import type { CanvasConfig, Spot } from "../types";

type Props = {
    canvas: CanvasConfig;
    spots: Spot[];
    selectedSpotId: string | null;
    onSelectSpot: (id: string) => void;
};

export const CanvasEditor: React.FC<Props> = ({
    canvas,
    spots,
    selectedSpotId,
    onSelectSpot
}) => {
    const { width, height, image } = canvas;

    return (
        <div
            style={{
                position: "relative",
                width,
                height,
                margin: "8px auto",
                border: "1px solid #ccc"
            }}
        >
            <img
                src={image}
                alt="canvas"
                style={{ width, height, display: "block" }}
            />
            {spots.map((spot) => {
                const [x1, y1, x2, y2] = spot.rect;
                const left = Math.min(x1, x2);
                const top = Math.min(y1, y2);
                const w = Math.abs(x2 - x1);
                const h = Math.abs(y2 - y1);
                const selected = spot.id === selectedSpotId;
                return (
                    <div
                        key={spot.id}
                        onClick={() => onSelectSpot(spot.id)}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width: w,
                            height: h,
                            border: selected ? "2px solid #007bff" : "1px solid #f00",
                            background: "rgba(255,0,0,0.15)",
                            boxSizing: "border-box",
                            cursor: "pointer"
                        }}
                        title={spot.id}
                    />
                );
            })}
        </div>
    );
};
