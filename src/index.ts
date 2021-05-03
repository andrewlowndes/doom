import type { Wad } from './interfaces/Wad';

import { drawMap } from './render/drawMap';
import { renderGame } from './render/renderGame';
import { loadWadFromBlob } from "./wad/loadWadFromBlob";

(async () => {
  //allow selection of a wad file, when loaded populate the info of the wad file
  const wadSelect = document.getElementById("wad_select") as HTMLSelectElement;
  const mapSelect = document.getElementById("maps_select") as HTMLSelectElement;
  const mapCanvas = document.getElementById("maps_preview") as HTMLCanvasElement;  
  const gameCanvas = document.getElementById("game") as HTMLCanvasElement;

  const game = renderGame(gameCanvas);

  let wad: Wad;

  wadSelect.onchange = () => loadWad();

  const loadWad = async () => {
    const result = await fetch(wadSelect.value);
    wad = loadWadFromBlob(await result.arrayBuffer());

    //select an optional pwad to load on top
    /*
    const pwadFetch = await fetch('wads/e1m8b.wad');
    const pwad = loadWadFromBlob(await pwadFetch.arrayBuffer());
    wad.maps = pwad.maps;
    */

    loadMapList();
  };

  const loadMapList = () => {
    const mapNames = Object.keys(wad.maps);
    mapSelect.innerHTML = "";
    for (let i = 0; i < mapNames.length; i++) {
      const mapName = mapNames[i];

      const newOption = document.createElement("option");
      newOption.value = mapName;
      newOption.innerText = mapName;
      mapSelect.appendChild(newOption);
    }

    mapSelect.value = mapNames[0];
    mapSelect.onchange = () => loadMap();
    loadMap();
  };

  const loadMap = () => {
    const map = wad.maps[mapSelect.value];
    drawMap(mapCanvas, map);
    game.loadWad(wad, map);
  };
})();
