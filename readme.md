# Doom in WebGL
This is a complete rewrite of Doom where the original wad files can be used (not supplied) to play the game, the **wad assets are extracted and converted on-the-fly** creating custom textures and converting levels to real polygons to be used in WebGL 1.

## Current Status
More of a map viewer than a game currently, no UI, collision detection, AI or interaction yet.

## Preview
![Doom 1](/images/doom1.jpg)
![Doom 2](/images/doom2.jpg)

## Running
- Copy .wad file ('DOOM1.WAD', 'DOOM2.WAD', etc) to 'assets/wads'
- Ensure NodeJS is installed
- Run `npm i` to install dependencies
- Launch web `npm start`

## Roadmap
- [x] 3d scene
- [x] flats
  - [x] flat textures
  - [/] atlas creator
  - [x] animated flats
- [-] walls 
  - [x] textures
  - [x] transparency
  - [x] clamped textures
  - [x] animated walls
  - [/] empty walls - hall of mirrors effect
- [ ] line def specials
  - [ ] floors
  - [ ] ceilings
  - [ ] doors
  - [ ] locked doors
  - [ ] lifts
  - [ ] stairs
  - [ ] crushers
  - [ ] light changers
  - [ ] exit
  - [ ] teleport
  - [ ] property transfer (extra)
  - [ ] scroll (extra)
- [ ] performance
  - [ ] render visibility check
  - [ ] gpu level streaming
- [ ] automap
- [-] sky
  - [x] working
  - [ ] custom sky shader
- [ ] collision detection
- [ ] Sector specials
  - [ ] Light (blink random)
  - [ ] Light (blink 0.5s)
  - [ ] Light (blink 1.0s)
  - [ ] Light (blink 0.5s) + damage 20% per second
  - [ ] Damage 10% per second
  - [ ] Damage 5% per second
  - [ ] Light (Oscillates)
  - [ ] Secret
  - [ ] Door (closes 30 seconds after level start)
  - [ ] End
  - [ ] Light (blink 0.5s synchronised)
  - [ ] Light (blink 1.0s synchronised)
  - [ ] Door (opens 300 seconds after level start)
  - [ ] Damage 20% per second
  - [ ] Light (flickers random)
- [-] static 'things'
  - [x] render
  - [ ] sector height/lighting
  - [ ] 3d models
  - [ ] collision detection
- [ ] enemies
  - [ ] render/animate
  - [ ] collision
  - [ ] ai
  - [ ] 3d models
- [/] hud
  - [ ] health
  - [ ] guns
  - [ ] inventory
- [ ] vr
  - [ ] render view
  - [ ] touch controls
  - [ ] locomotion
- [ ] extras
  - [ ] particles (smoke, bullet shells, blood splatter)
  - [ ] decals (bullet holes)
  - [ ] high res textures
  - [ ] bump maps
  - [ ] specular maps
  - [ ] custom water shaders
  - [ ] reflections
  - [ ] path tracing lighting model
- [ ] audio
- [ ] single player playthrough
- [ ] multi player
  - [ ] deathmatch
  - [ ] coop
  - [ ] custom game types
- [ ] custom wad
  - [ ] zdoom additions
  - [-] hexen
    - [x] wad loading
    - [ ] specials

## Known Issues
- Sprite animation frames out of order

## Legal
This project is in no way affliated with ID Software, ZeniMax Media or any subsidiaries. No copyright material has been used creating these works.
