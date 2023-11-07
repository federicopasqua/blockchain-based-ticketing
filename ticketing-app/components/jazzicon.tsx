import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Svg, Rect } from 'react-native-svg';
import MersenneTwister from 'mersenne-twister';
import Color from 'color';

const COLORS = [
  '#01888C', // teal
  '#FC7500', // bright orange
  '#034F5D', // dark teal
  '#F73F01', // orangered
  '#FC1960', // magenta
  '#C7144C', // raspberry
  '#F3C100', // goldenrod
  '#1598F2', // lightning blue
  '#2465E1', // sail blue
  '#F19E02', // gold
];

const WOBBLE = 30;
const SHAPECOUNT = 3;

interface Props {
  size?: number;
  address: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Jazzicon({ size = 30, address, containerStyle }: Props) {
  const generator = new MersenneTwister(parseInt(address.toLowerCase().slice(2, 10), 16));

  const randomNumber = () => {
    return generator.random();
  };

  const randomColor = () => {
    randomNumber();

    return colors.splice(Math.floor(colors.length * randomNumber()), 1)[0];
  };

  const amount = generator.random() * 30 - WOBBLE / 2;
  const colors = COLORS.map((hex) => new Color(hex).rotate(amount).hex());

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: randomColor(),
          borderRadius: size / 2,
        },
        containerStyle,
      ]}
    >
      <Svg width={size} height={size}>
        {Array(SHAPECOUNT)
          .fill(0)
          .map((_, index) => {
            const center = size / 2;

            const firstRot = randomNumber();
            const angle = Math.PI * 2 * firstRot;
            const velocity =
              (size / SHAPECOUNT) * randomNumber() + (index * size) / SHAPECOUNT;

            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            const secondRot = randomNumber();
            const rot = firstRot * 360 + secondRot * 180;

            return (
              <Rect
                key={`shape_${index}`}
                x={0}
                y={0}
                width={size}
                height={size}
                fill={randomColor()}
                transform={`translate(${tx} ${ty}) rotate(${rot.toFixed(
                  1
                )} ${center} ${center})`}
              />
            );
          })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
