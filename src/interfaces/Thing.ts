import { difficulty } from "../constants/WadInfo";

export interface Thing {
  x: number;
  y: number;
  angle: number;
  type: number;
  flags: {
    difficulty: difficulty;
    isDeaf: boolean;
    hideInSingleplayer: boolean;
    hideInDeathmatch?: boolean;
    hideInCoop?: boolean;
    friendly?: boolean;
    isDormant?: boolean;
    class1Only?: boolean;
    class2Only?: boolean;
    class3Only?: boolean;
  }
  action?: number;
  arg1?: number;
  arg2?: number;
  arg3?: number;
  arg4?: number;
  arg5?: number;
}
