export type CanvasConfig = {
    width: number;
    height: number;
    image: string;
};

export type MenuItem = {
    title: string;
    url?: string;
    children?: MenuItem[];
};

export type Spot = {
    id: string;
    rect: [number, number, number, number];
    menu: MenuItem[];
};

export type Config = {
    canvas: CanvasConfig;
    spots: Spot[];
};
