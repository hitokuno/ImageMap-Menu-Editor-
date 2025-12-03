import React from "react";
import type { Spot } from "../types";

type Props = {
    spots: Spot[];
    selectedSpotId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
};

export const SpotList: React.FC<Props> = ({
    spots,
    selectedSpotId,
    onSelect,
    onDelete
}) => {
    return (
        <div>
            <h3>ホットスポット一覧</h3>
            {spots.length === 0 && <p>なし</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {spots.map((s) => (
                    <li
                        key={s.id}
                        style={{
                            marginBottom: 4,
                            padding: 4,
                            borderRadius: 4,
                            background: s.id === selectedSpotId ? "#eef6ff" : "transparent",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => onSelect(s.id)}
                        >
                            {s.id}
                        </span>
                        <button
                            onClick={() => {
                                if (confirm(`${s.id} を削除しますか？`)) onDelete(s.id);
                            }}
                        >
                            削除
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
