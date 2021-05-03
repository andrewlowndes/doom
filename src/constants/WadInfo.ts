export const flatSize = 64;

export const skyTextures = ['SKY1', 'SKY2', 'SKY3'];

export const skyFlats = ['F_SKY1', 'F_SKY'];

export enum difficulty {
  easy,
  intermediate,
  hard
};

export const animatedFlatMap: Record<string, string> = {
	NUKAGE1: 'NUKAGE3',
	FWATER1: 'FWATER4',
	SWATER1: 'SWATER4',
	LAVA1: 'LAVA4',
	BLOOD1: 'BLOOD3',
	RROCK05: 'RROCK08',
	SLIME01: 'SLIME04',
	SLIME05: 'SLIME08',
	SLIME09: 'SLIME12'
};

export const animatedTextureMap: Record<string, string> = {
	BLODGR1:'BLODGR4',
	BLODRIP1: 'BLODRIP4',
	FIREBLU1: 'FIREBLU2',
	FIRLAV3: 'FIRELAVA',
	FIREMAG1: 'FIREMAG3',
	FIREWALA: 'FIREWALL',
	GSTFONT1: 'GSTFONT3',
	ROCKRED1: 'ROCKRED3',
	SLADRIP1: 'SLADRIP3',
	BFALL1: 'BFALL4',
	SFALL1: 'SFALL4',
	WFALL1: 'WFALL4',
	DBRAIN1: 'DBRAIN4'
};

export const animatedFlatFps = 4;

export const animatedWallFps = 4;

export const animatedSpriteFps = 8;
