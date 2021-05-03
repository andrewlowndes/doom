export type SpriteFrameDirection = string;

export type SpriteFrame = Record<SpriteFrameDirection, string>;

export type Sprite = Record<number, SpriteFrame>;
