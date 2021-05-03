export interface LineDef {
    v1: number,
    v2: number,
    special: number,
    tag?: number,
    sidenum: [number, number]
    flags: {
        impassible: boolean;
        blockMonsters: boolean;
        twoSided: boolean;
        upperUnpegged: boolean;
        lowerUnpegged: boolean;
        secret: boolean;
        blockSound: boolean;
        notOnMap: boolean;
        alreadyOnMap: boolean;

        activateAgain?: boolean;
        activatePlayer?: boolean;
        activateMonster?: boolean;
        activateHit?: boolean;
        activateBumped?: boolean;
        activateShotThrough?: boolean;
        activatePlayerPassthrough?: boolean;
        activatePlayerMonster?: boolean;
        blockAll?: boolean;
    }
    arg1?: number;
    arg2?: number;
    arg3?: number;
    arg4?: number;
    arg5?: number;
}
