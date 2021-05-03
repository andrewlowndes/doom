enum DoorLocks {
  yellow,
  red,
  blue
}

enum DoorTypes {
  openWaitClose,
  closeWaitOpen,
  openStayOpen,
  closeStayClosed
}

enum MotionSpeed {
  slow,
  normal,
  fast,
  turbo,
  instant
}

enum DelayTimes {
  threeSeconds,
  fourSeconds,
  thirtySeconds
}

enum Trigger {
  push,
  switch,
  walkover,
  gun
}

enum SpecialCategory {
  door,
  floor,
  ceiling,
  platform,
  stair,
  elevator,
  light,
  exit,
  telport,
  donut,
  transfer,
  scroll
}

interface LineDefBase {
  category: SpecialCategory;
  trigger?: Trigger;
  retriggerable?: boolean;
}

enum ScrollDirection {
  left = 'left',
  right = 'right'
}

interface Scroller extends LineDefBase {
  category: SpecialCategory.scroll;
  direction: ScrollDirection;
  wall: boolean;
}

type LineDefSpecial = Scroller;

export const lineDefSpecials: Record<number, LineDefSpecial> = {
  48: { category: SpecialCategory.scroll, direction: ScrollDirection.left, wall: true }
};

/*
export interface LineDefSpecial {
  value: number;
  category: 'mDoor' | 'rDoor' | 'ceil' | 'lift' | 'floor' | 'stair' | 'moveFloor' | 'crush' | 'exit' | 'teleport' | 'light';
  activation: 'switch' | 'walk' | 'gunfire' | 'continuous'
  repeatable?: boolean;
  monsterActivatable?: boolean;
  sound?: 'door' | 'blaze' | 'mover' | 'lift' | 'crush' | 'none' | 'clunk' | 'tport'
  speed?: 'med' | 'turbo' | 'slow' | 'fast';
  restTime?: number;
}

export const LifeDefSpecials = {
  { value: 1, category: 'mDoor', activation: '', repeatable: false, monsterActivable: , sound: , speed: , restTime:  }

  Val   Class Act  Sound Speed Tm Chg Effect

SPECIAL (Continuous effect, doesn't need triggereing)

 48   Spec  n--  -     -     -  -   Scrolling wall

LOCAL DOORS ("MANUAL" DOORS)

  1   mDoor nSRm door  med   4  -   open/close
 26   mDoor nSR  door  med   4  -   open/close BLUE KEY
 28   mDoor nSR  door  med   4  -   open/close RED KEY
 27   mDoor nSR  door  med   4  -   open/close YELLOW KEY
 31   mDoor nS1  door  med   -  -   open
 32   mDoor nS1  door  med   -  -   open BLUE KEY
 33   mDoor nS1  door  med   -  -   open RED KEY
 34   mDoor nS1  door  med   -  -   open YELLOW KEY
 46   mDoor nGR  door  med   -  -   open
117 * mDoor nSR  blaze turbo 4  -   open/close
118 * mDoor nS1  blaze turbo -  -   open

REMOTE DOORS

  4   rDoor  W1  door  med   4  -   open,close
 29   rDoor  S1  door  med   4  -   open,close
 90   rDoor  WR  door  med   4  -   open,close
 63   rDoor  SR  door  med   4  -   open,close
  2   rDoor  W1  door  med   -  -   open
103   rDoor  S1  door  med   -  -   open
 86   rDoor  WR  door  med   -  -   open
 61   rDoor  SR  door  med   -  -   open
  3   rDoor  W1  door  med   -  -   close
 50   rDoor  S1  door  med   -  -   close
 75   rDoor  WR  door  med   -  -   close
 42   rDoor  SR  door  med   -  -   close
 16   rDoor  W1  door  med   30 -   close, then opens
 76   rDoor  WR  door  med   30 -   close, then opens
108 * rDoor  W1  blaze turbo 4  -   open,close
111 * rDoor  WR  blaze turbo 4  -   open,close
105 * rDoor  S1  blaze turbo 4  -   open,close
114 * rDoor  SR  blaze turbo 4  -   open,close
109 * rDoor  W1  blaze turbo -  -   open
112 * rDoor  S1  blaze turbo -  -   open
106 * rDoor  WR  blaze turbo -  -   open
115 * rDoor  SR  blaze turbo -  -   open
110 * rDoor  W1  blaze turbo -  -   close
113 * rDoor  S1  blaze turbo -  -   close
107 * rDoor  WR  blaze turbo -  -   close
116 * rDoor  SR  blaze turbo -  -   close
133 * rDoor  S1  blaze turbo -  -   open BLUE KEY
 99 * rDoor  SR  blaze turbo -  -   open BLUE KEY
135 * rDoor  S1  blaze turbo -  -   open RED KEY
134 * rDoor  SR  blaze turbo -  -   open RED KEY
137 * rDoor  S1  blaze turbo -  -   open YELLOW KEY
136 * rDoor  SR  blaze turbo -  -   open YELLOW KEY

CEILINGS

 40   Ceil   W1  mover slow  -  -   up to HEC
 41   Ceil   S1  mover slow  -  -   down to floor
 43   Ceil   SR  mover slow  -  -   down to floor
 44   Ceil   W1  mover slow  -  -   down to floor + 8
 49   Ceil   S1  mover slow  -  -   down to floor + 8
 72   Ceil   WR  mover slow  -  -   down to floor + 8

LIFTS

 10   Lift   W1  lift  fast  3  -   lift
 21   Lift   S1  lift  fast  3  -   lift
 88   Lift   WRm lift  fast  3  -   lift
 62   Lift   SR  lift  fast  3  -   lift
121 * Lift   W1  lift  turbo 3  -   lift
122 * Lift   S1  lift  turbo 3  -   lift
120 * Lift   WR  lift  turbo 3  -   lift
123 * Lift   SR  lift  turbo 3  -   lift

FLOORS

119 * Floor  W1  mover slow  -  -   up to nhEF
128 * Floor  WR  mover slow  -  -   up to nhEF
 18   Floor  S1  mover slow  -  -   up to nhEF
 69   Floor  SR  mover slow  -  -   up to nhEF
 22   Floor  W1& mover slow  -  TX  up to nhEF
 95   Floor  WR& mover slow  -  TX  up to nhEF
 20   Floor  S1& mover slow  -  TX  up to nhEF
 68   Floor  SR& mover slow  -  TX  up to nhEF
 47   Floor  G1& mover slow  -  TX  up to nhEF
  5   Floor  W1  mover slow  -  -   up to LIC
 91   Floor  WR  mover slow  -  -   up to LIC
101   Floor  S1  mover slow  -  -   up to LIC
 64   Floor  SR  mover slow  -  -   up to LIC
 24   Floor  G1  mover slow  -  -   up to LIC
130 * Floor  W1  mover turbo -  -   up to nhEF
131 * Floor  S1  mover turbo -  -   up to nhEF
129 * Floor  WR  mover turbo -  -   up to nhEF
132 * Floor  SR  mover turbo -  -   up to nhEF
 56   Floor  W1& mover slow  -  -   up to LIC - 8, CRUSH
 94   Floor  WR& mover slow  -  -   up to LIC - 8, CRUSH
 55   Floor  S1  mover slow  -  -   up to LIC - 8, CRUSH
 65   Floor  SR  mover slow  -  -   up to LIC - 8, CRUSH
 58   Floor  W1  mover slow  -  -   up 24
 92   Floor  WR  mover slow  -  -   up 24
 15   Floor  S1& mover slow  -  TX  up 24
 66   Floor  SR& mover slow  -  TX  up 24
 59   Floor  W1& mover slow  -  TXP up 24
 93   Floor  WR& mover slow  -  TXP up 24
 14   Floor  S1& mover slow  -  TX  up 32
 67   Floor  SR& mover slow  -  TX  up 32
140 * Floor  S1  mover med   -  -   up 512
 30   Floor  W1  mover slow  -  -   up ShortestLowerTexture
 96   Floor  WR  mover slow  -  -   up ShortestLowerTexture
 38   Floor  W1  mover slow  -  -   down to LEF
 23   Floor  S1  mover slow  -  -   down to LEF
 82   Floor  WR  mover slow  -  -   down to LEF
 60   Floor  SR  mover slow  -  -   down to LEF
 37   Floor  W1  mover slow  -  NXP down to LEF
 84   Floor  WR  mover slow  -  NXP down to LEF
 19   Floor  W1  mover slow  -  -   down to HEF
102   Floor  S1  mover slow  -  -   down to HEF
 83   Floor  WR  mover slow  -  -   down to HEF
 45   Floor  SR  mover slow  -  -   down to HEF
 36   Floor  W1  mover fast  -  -   down to HEF + 8
 71   Floor  S1  mover fast  -  -   down to HEF + 8
 98   Floor  WR  mover fast  -  -   down to HEF + 8
 70   Floor  SR  mover fast  -  -   down to HEF + 8
  9   Floor  S1  mover slow  -  NXP donut (see note 12 above)

STAIRS

  8   Stair  W1  mover slow  -  -   stairs
  7   Stair  S1  mover slow  -  -   stairs
100 * Stair  W1  mover turbo -  -   stairs (each up 16 not 8) + crush
127 * Stair  S1  mover turbo -  -   stairs (each up 16 not 8) + crush

MOVING FLOORS

 53   MvFlr  W1& lift  slow  3  -   start moving floor
 54   MvFlr  W1& -     -     -  -   stop moving floor
 87   MvFlr  WR& lift  slow  3  -   start moving floor
 89   MvFlr  WR& -     -     -  -   stop moving floor

CRUSHING CEILINGS

  6   Crush  W1& crush med   0  -   start crushing, fast hurt
 25   Crush  W1& crush med   0  -   start crushing, slow hurt
 73   Crush  WR& crush slow  0  -   start crushing, slow hurt
 77   Crush  WR& crush med   0  -   start crushing, fast hurt
 57   Crush  W1& -     -     -  -   stop crush
 74   Crush  WR& -     -     -  -   stop crush
141 * Crush  W1& none? slow  0  -   start crushing, slow hurt "Silent"

EXIT LEVEL

 11   Exit  nS-  clunk -     -  -   End level, go to next level
 51   Exit  nS-  clunk -     -  -   End level, go to secret level
 52   Exit  nW-  clunk -     -  -   End level, go to next level
124 * Exit  nW-  clunk -     -  -   End level, go to secret level

TELEPORT

 39   Telpt  W1m tport -     -  -   Teleport
 97   Telpt  WRm tport -     -  -   Teleport
125 * Telpt  W1m tport -     -  -   Teleport monsters only
126 * Telpt  WRm tport -     -  -   Teleport monsters only

LIGHT

 35   Light  W1  -     -     -  -   0
104   Light  W1  -     -     -  -   LE (light level)
 12   Light  W1  -     -     -  -   HE (light level)
 13   Light  W1  -     -     -  -   255
 79   Light  WR  -     -     -  -   0
 80   Light  WR  -     -     -  -   HE (light level)
 81   Light  WR  -     -     -  -   255
 17   Light  W1  -     -     -  -   Light blinks (see [4-9-1] type 3)
138 * Light  SR  clunk -     -  -   255
139 * Light  SR  clunk -     -  -   0
}
*/