import { registerEnumType } from 'type-graphql';

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SIDEWAYS = 'SIDEWAYS',
}

registerEnumType(Direction, {
  name: 'Direction',
  description: 'The basic directions',
  valuesConfig: {
    SIDEWAYS: {
      deprecationReason: 'Replaced with Left or Right',
    },
    RIGHT: {
      description: 'The other left',
    },
  },
});

// https://typegraphql.com/docs/enums.html
