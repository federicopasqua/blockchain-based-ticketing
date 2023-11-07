import { useRef } from 'react';
import { G, Rect, Svg } from 'react-native-svg';

type Props = {
  address: string;
  size?: number;
  scale?: number;
};

export function Blockies({ address, size = 8, scale = 10 }: Props) {
  const width = size * scale;

  const randArray = useRef(new Array(4));

  function seedrand(seed: string) {
    randArray.current.fill(0);

    for (let i = 0; i < seed.length; i++) {
      randArray.current[i % 4] =
        (randArray.current[i % 4] << 5) - randArray.current[i % 4] + seed.charCodeAt(i);
    }
  }

  function rand() {
    const t = randArray.current[0] ^ (randArray.current[0] << 11);

    randArray.current[0] = randArray.current[1];
    randArray.current[1] = randArray.current[2];
    randArray.current[2] = randArray.current[3];
    randArray.current[3] =
      randArray.current[3] ^ (randArray.current[3] >> 19) ^ t ^ (t >> 8);

    return (randArray.current[3] >>> 0) / ((1 << 31) >>> 0);
  }

  function createImageData() {
    const width = size;
    const height = size;

    const dataWidth = Math.ceil(width / 2);
    const mirrorWidth = width - dataWidth;

    const data: number[] = [];
    for (let y = 0; y < height; y++) {
      let row: number[] = [];
      for (let x = 0; x < dataWidth; x++) {
        row[x] = Math.floor(rand() * 2.3);
      }
      const r = row.slice(0, mirrorWidth);
      r.reverse();
      row = row.concat(r);

      for (let i = 0; i < row.length; i++) {
        data.push(row[i]);
      }
    }

    return data;
  }

  function createColor() {
    const h = Math.floor(rand() * 360);
    const s = (rand() * 60 + 40).toFixed(1) + '%';
    const l = ((rand() + rand() + rand() + rand()) * 25).toFixed(1) + '%';

    return 'hsl(' + h + ',' + s + ',' + l + ')';
  }
  seedrand(address.toLowerCase());
  const color = createColor();
  const bgcolor = createColor();
  const spotcolor = createColor();
  const imageData = createImageData();

  return (
    <Svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
      <Rect width={width} height={width} fill={bgcolor} />

      <G fill={color}>
        {imageData.map((value, i) => {
          if (value === 1) {
            const row = (i % size) * scale;
            const col = Math.floor(i / size) * scale;

            return (
              <Rect
                key={`${address}-${i}`}
                width={scale}
                height={scale}
                x={row}
                y={col}
              />
            );
          }
        })}
      </G>
      <G fill={spotcolor}>
        {imageData.map((value, i) => {
          if (value === 2) {
            const row = (i % size) * scale;
            const col = Math.floor(i / size) * scale;

            return (
              <Rect
                key={`${address}-${i}`}
                width={scale}
                height={scale}
                x={row}
                y={col}
              />
            );
          }
        })}
      </G>
    </Svg>
  );
}
