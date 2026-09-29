// ============ LEVEL DATA ============
const TILE = 40;

function borderWalls(cols, rows) {
    const w = [];
    for (let x = 0; x < cols; x++) {
        w.push({ x: x * TILE, y: 0, w: TILE, h: TILE });
        w.push({ x: x * TILE, y: (rows - 1) * TILE, w: TILE, h: TILE });
    }
    for (let y = 1; y < rows - 1; y++) {
        w.push({ x: 0, y: y * TILE, w: TILE, h: TILE });
        w.push({ x: (cols - 1) * TILE, y: y * TILE, w: TILE, h: TILE });
    }
    return w;
}

function wall(x, y, w, h) {
    return { x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE };
}

const Levels = [
    {
        name: "Первые шаги", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: borderWalls(24, 16),
        spikes: [], movingWalls: [], lasers: [], keys: [], doors: [], disappearing: []
    },
    {
        name: "Осторожно", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [...borderWalls(24, 16), wall(8, 4, 1, 8), wall(12, 4, 1, 8), wall(16, 4, 1, 8)],
        spikes: [
            { x: 10 * TILE, y: 7 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 14 * TILE, y: 8 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 4 * TILE, y: 3 * TILE, w: TILE * 2, h: TILE, dir: 'up' }
        ],
        movingWalls: [], lasers: [], keys: [], doors: [], disappearing: []
    },
    {
        name: "Ловушки", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [...borderWalls(24, 16), wall(6, 1, 1, 10), wall(11, 5, 1, 10), wall(16, 1, 1, 10)],
        spikes: [
            { x: 7 * TILE, y: 13 * TILE, w: TILE * 3, h: TILE, dir: 'up' },
            { x: 12 * TILE, y: 2 * TILE, w: TILE * 3, h: TILE, dir: 'up' },
            { x: 17 * TILE, y: 13 * TILE, w: TILE * 3, h: TILE, dir: 'up' },
            { x: 3 * TILE, y: 5 * TILE, w: TILE, h: TILE * 3, dir: 'right' },
            { x: 20 * TILE, y: 6 * TILE, w: TILE, h: TILE * 3, dir: 'left' }
        ],
        movingWalls: [], lasers: [], keys: [], doors: [], disappearing: []
    },
    {
        name: "Движение", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [...borderWalls(24, 16), wall(5, 3, 1, 6), wall(9, 7, 1, 6), wall(13, 3, 1, 6), wall(17, 7, 1, 6)],
        spikes: [
            { x: 3 * TILE, y: 1 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 19 * TILE, y: 14 * TILE, w: TILE * 2, h: TILE, dir: 'up' }
        ],
        movingWalls: [
            { x: 7 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 1.5, phase: 0 },
            { x: 11 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 6 * TILE, speed: 2, phase: Math.PI },
            { x: 15 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 1.8, phase: Math.PI / 2 },
            { x: 19 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 6 * TILE, speed: 2.2, phase: Math.PI * 1.5 }
        ],
        lasers: [], keys: [], doors: [], disappearing: []
    },
    {
        name: "Лазерная сетка", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [
            ...borderWalls(24, 16),
            wall(4, 4, 8, 1), wall(12, 4, 8, 1),
            wall(4, 8, 8, 1), wall(12, 8, 8, 1),
            wall(4, 12, 8, 1), wall(12, 12, 8, 1)
        ],
        spikes: [
            { x: 4 * TILE, y: 5 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 19 * TILE, y: 5 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 4 * TILE, y: 9 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 19 * TILE, y: 9 * TILE, w: TILE, h: TILE, dir: 'up' }
        ],
        movingWalls: [],
        lasers: [
            { x: 8 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 2.5, phase: 0 },
            { x: 16 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 2.5, phase: Math.PI },
            { x: 8 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 3, phase: Math.PI / 2 },
            { x: 16 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 3, phase: Math.PI * 1.5 }
        ],
        keys: [], doors: [], disappearing: []
    },
    {
        name: "Исчезающие пути", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [
            ...borderWalls(24, 16),
            wall(3, 11, 4, 1), wall(9, 11, 4, 1), wall(15, 11, 4, 1), wall(21, 11, 1, 1),
            wall(3, 3, 1, 4), wall(9, 3, 1, 4), wall(15, 3, 1, 4)
        ],
        spikes: [{ x: 12 * TILE, y: 14 * TILE, w: TILE * 4, h: TILE, dir: 'up' }],
        movingWalls: [], lasers: [], keys: [], doors: [],
        disappearing: [
            { x: 4 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 0 },
            { x: 7 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 0.6 },
            { x: 10 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 1.2 },
            { x: 13 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 1.8 },
            { x: 16 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 2.4 },
            { x: 19 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 2, duration: 1.2, phase: 3.0 },
            { x: 6 * TILE, y: 5 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 1, phase: 0.4 },
            { x: 12 * TILE, y: 5 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 1, phase: 1.0 },
            { x: 18 * TILE, y: 5 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 1, phase: 1.6 }
        ]
    },
    {
        name: "Ключ к выходу", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [...borderWalls(24, 16), wall(6, 6, 1, 8), wall(12, 1, 1, 8), wall(18, 6, 1, 8)],
        spikes: [
            { x: 8 * TILE, y: 3 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 14 * TILE, y: 12 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 20 * TILE, y: 3 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 3 * TILE, y: 8 * TILE, w: TILE, h: TILE * 2, dir: 'right' }
        ],
        movingWalls: [
            { x: 9 * TILE, y: 3 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 3 * TILE, speed: 3, phase: 0 },
            { x: 15 * TILE, y: 3 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 3 * TILE, speed: 3.5, phase: Math.PI },
            { x: 9 * TILE, y: 11 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 3 * TILE, speed: 3, phase: Math.PI / 2 },
            { x: 15 * TILE, y: 11 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 3 * TILE, speed: 3.5, phase: Math.PI * 1.5 }
        ],
        lasers: [],
        keys: [{ x: 9 * TILE, y: 7 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false }],
        doors: [{ x: 21 * TILE, y: 2 * TILE, w: TILE, h: TILE, open: false }],
        disappearing: []
    },
    {
        name: "Хаос", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [
            ...borderWalls(24, 16),
            wall(4, 1, 1, 5), wall(8, 10, 1, 5), wall(12, 1, 1, 5),
            wall(16, 10, 1, 5), wall(20, 1, 1, 5)
        ],
        spikes: [
            { x: 2 * TILE, y: 1 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 20 * TILE, y: 14 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 6 * TILE, y: 7 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 14 * TILE, y: 7 * TILE, w: TILE, h: TILE, dir: 'up' },
            { x: 10 * TILE, y: 14 * TILE, w: TILE * 4, h: TILE, dir: 'up' }
        ],
        movingWalls: [
            { x: 6 * TILE, y: 2 * TILE, w: TILE, h: TILE, axis: 'y', range: 6 * TILE, speed: 3, phase: 0 },
            { x: 10 * TILE, y: 8 * TILE, w: TILE, h: TILE, axis: 'y', range: 6 * TILE, speed: 3.5, phase: Math.PI },
            { x: 14 * TILE, y: 2 * TILE, w: TILE, h: TILE, axis: 'y', range: 6 * TILE, speed: 3, phase: Math.PI / 2 },
            { x: 18 * TILE, y: 8 * TILE, w: TILE, h: TILE, axis: 'y', range: 6 * TILE, speed: 3.5, phase: Math.PI * 1.5 }
        ],
        lasers: [
            { x: 7 * TILE, y: 3 * TILE, w: TILE, h: TILE * 3, axis: 'x', range: 8 * TILE, speed: 4, phase: 0 },
            { x: 15 * TILE, y: 10 * TILE, w: TILE, h: TILE * 3, axis: 'x', range: 8 * TILE, speed: 4, phase: Math.PI }
        ],
        keys: [
            { x: 4 * TILE, y: 7 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false },
            { x: 18 * TILE, y: 7 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false }
        ],
        doors: [{ x: 21 * TILE, y: 2 * TILE, w: TILE, h: TILE, open: false }],
        disappearing: [
            { x: 5 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 0.9, phase: 0 },
            { x: 9 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 0.9, phase: 0.9 },
            { x: 13 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 0.9, phase: 1.8 },
            { x: 17 * TILE, y: 8 * TILE, w: TILE, h: TILE, interval: 1.8, duration: 0.9, phase: 2.7 }
        ]
    },
    {
        name: "Испытание", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [
            ...borderWalls(24, 16),
            wall(3, 1, 1, 6), wall(3, 9, 1, 6),
            wall(7, 5, 1, 6), wall(11, 1, 1, 6), wall(11, 9, 1, 6),
            wall(15, 5, 1, 6), wall(19, 1, 1, 6), wall(19, 9, 1, 6)
        ],
        spikes: [
            { x: 4 * TILE, y: 7 * TILE, w: TILE * 3, h: TILE, dir: 'up' },
            { x: 12 * TILE, y: 7 * TILE, w: TILE * 3, h: TILE, dir: 'up' },
            { x: 20 * TILE, y: 7 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 8 * TILE, y: 1 * TILE, w: TILE, h: TILE * 2, dir: 'right' },
            { x: 16 * TILE, y: 1 * TILE, w: TILE, h: TILE * 2, dir: 'right' }
        ],
        movingWalls: [
            { x: 5 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 4, phase: 0 },
            { x: 9 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 4.5, phase: Math.PI },
            { x: 13 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 4, phase: Math.PI / 2 },
            { x: 17 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 4.5, phase: Math.PI * 1.5 },
            { x: 21 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 8 * TILE, speed: 5, phase: 0.5 }
        ],
        lasers: [
            { x: 4 * TILE, y: 12 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 6 * TILE, speed: 5, phase: 0 },
            { x: 10 * TILE, y: 12 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 6 * TILE, speed: 5, phase: Math.PI },
            { x: 16 * TILE, y: 12 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 6 * TILE, speed: 5, phase: Math.PI / 2 }
        ],
        keys: [
            { x: 5 * TILE, y: 6 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false },
            { x: 17 * TILE, y: 6 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false }
        ],
        doors: [{ x: 21 * TILE, y: 2 * TILE, w: TILE, h: TILE, open: false }],
        disappearing: [
            { x: 6 * TILE, y: 10 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 0 },
            { x: 12 * TILE, y: 10 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 0.75 },
            { x: 18 * TILE, y: 10 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 1.5 }
        ]
    },
    {
        name: "Побег", cols: 24, rows: 16,
        playerStart: { x: 2 * TILE, y: 13 * TILE },
        finish: { x: 21 * TILE, y: 2 * TILE },
        walls: [
            ...borderWalls(24, 16),
            wall(4, 1, 1, 4), wall(4, 8, 1, 7),
            wall(8, 4, 1, 5), wall(8, 12, 1, 3),
            wall(12, 1, 1, 4), wall(12, 8, 1, 7),
            wall(16, 4, 1, 5), wall(16, 12, 1, 3),
            wall(20, 1, 1, 4), wall(20, 8, 1, 7)
        ],
        spikes: [
            { x: 2 * TILE, y: 5 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 6 * TILE, y: 2 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 10 * TILE, y: 5 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 14 * TILE, y: 2 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 18 * TILE, y: 5 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 2 * TILE, y: 11 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 20 * TILE, y: 11 * TILE, w: TILE * 2, h: TILE, dir: 'up' },
            { x: 10 * TILE, y: 11 * TILE, w: TILE * 2, h: TILE, dir: 'up' }
        ],
        movingWalls: [
            { x: 6 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 5, phase: 0 },
            { x: 10 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 5, phase: Math.PI },
            { x: 14 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 5, phase: Math.PI / 2 },
            { x: 18 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 5, phase: Math.PI * 1.5 },
            { x: 6 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 6, phase: 0.5 },
            { x: 14 * TILE, y: 10 * TILE, w: TILE, h: TILE * 2, axis: 'x', range: 4 * TILE, speed: 6, phase: 2.0 }
        ],
        lasers: [
            { x: 5 * TILE, y: 6 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 6, phase: 0 },
            { x: 9 * TILE, y: 6 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 6, phase: Math.PI },
            { x: 13 * TILE, y: 6 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 6, phase: Math.PI / 2 },
            { x: 17 * TILE, y: 6 * TILE, w: TILE, h: TILE * 2, axis: 'y', range: 10 * TILE, speed: 6, phase: Math.PI * 1.5 }
        ],
        keys: [
            { x: 6 * TILE, y: 8 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false },
            { x: 10 * TILE, y: 8 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false },
            { x: 14 * TILE, y: 8 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false },
            { x: 18 * TILE, y: 8 * TILE, w: TILE * 0.6, h: TILE * 0.6, collected: false }
        ],
        doors: [{ x: 21 * TILE, y: 2 * TILE, w: TILE, h: TILE, open: false }],
        disappearing: [
            { x: 7 * TILE, y: 6 * TILE, w: TILE, h: TILE, interval: 1.2, duration: 0.7, phase: 0 },
            { x: 11 * TILE, y: 6 * TILE, w: TILE, h: TILE, interval: 1.2, duration: 0.7, phase: 0.6 },
            { x: 15 * TILE, y: 6 * TILE, w: TILE, h: TILE, interval: 1.2, duration: 0.7, phase: 1.2 },
            { x: 19 * TILE, y: 6 * TILE, w: TILE, h: TILE, interval: 1.2, duration: 0.7, phase: 1.8 },
            { x: 5 * TILE, y: 11 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 0.3 },
            { x: 11 * TILE, y: 11 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 0.9 },
            { x: 17 * TILE, y: 11 * TILE, w: TILE, h: TILE, interval: 1.5, duration: 0.8, phase: 1.5 }
        ]
    }
];