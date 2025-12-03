import React, { ChangeEvent } from "react";
import type { Spot } from "../types";

type Props = {
    spot: Spot;
    onChangeId: (id: string) => void;
    onChangeRect: (rect: [number, number, number, number]) => void;
};

export const SpotProperties: React.FC<Props> = ({
    spot,
    onChangeId,
    onChangeRect
}) => {
    const [x1, y1, x2, y2] = spot.rect;

    const updateRectField = (index: number, value: number) => {
        const rect: [number, number, number, number] = [x1, y1, x2, y2];
        rect[index] = value;
        onChangeRect(rect);
    };

    const handleRectChange =
        (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value) || 0;
            updateRectField(index, v);
        };

    return (
        <div>
            <h3>ホットスポット</h3>
            <div>
                <label>
                    ID:
                    <input
                        type="text"
                        value={spot.id}
                        onChange={(e) => onChangeId(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </label>
            </div>
            <div style={{ marginTop: 8 }}>
                <strong>座標 [x1, y1, x2, y2]</strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    <label>
                        x1:
                        <input type="number" value={x1} onChange={handleRectChange(0)} />
                    </label>
                    <label>
                        y1:
                        <input type="number" value={y1} onChange={handleRectChange(1)} />
                    </label>
                    <label>
                        x2:
                        <input type="number" value={x2} onChange={handleRectChange(2)} />
                    </label>
                    <label>
                        y2:
                        <input type="number" value={y2} onChange={handleRectChange(3)} />
                    </label>
                </div>
            </div>
        </div>
    );
};
