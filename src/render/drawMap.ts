import { WadMap } from '../interfaces/WadMap';
import { Vertex } from '../interfaces/Vertex';

export const drawMap = (canvas: HTMLCanvasElement, map: WadMap): CanvasRenderingContext2D => {
  let minX = map.VERTEXES[0].x;
  let maxX = minX;
  let minY = map.VERTEXES[0].y;
  let maxY = minY;
  
  map.VERTEXES.forEach((v) => {
    minX = Math.min(v.x, minX);
    maxX = Math.max(v.x, maxX);
    minY = Math.min(v.y, minY);
    maxY = Math.max(v.y, maxY);
  });
  
  const mapCanvas = canvas;
  mapCanvas.width = mapCanvas.clientWidth;
  mapCanvas.height = mapCanvas.clientHeight;
  const mapContext = mapCanvas.getContext('2d');

  if (!mapContext) {
    throw new Error('Could not create canvas for drawMap');
  }

  const offsetX = minX;
  const offsetY = minY;
  const scaleX = mapCanvas.width / (maxX - minX);
  const scaleY = mapCanvas.height / (maxY - minY);
  //const vertexSize = 2;
  const thingSize = 2;
  const scale = Math.min(scaleX, scaleY);
  
  //draw a top down 2d graph for now like the automap
  mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  
  mapContext.fillStyle = 'red';
  
  const vertexLocalPos: Record<number, Vertex> = {};
  
  map.VERTEXES.forEach((v, i) => {
    const plotPos: Vertex = {
      x: Math.round((v.x - offsetX) * scale),
      y: Math.round((v.y - offsetY) * scale)
    };
    
    vertexLocalPos[i] = plotPos;
    
    //mapContext.fillRect(plotPos.x, mapCanvas.height - plotPos.y, vertexSize, vertexSize);
  });
  
  mapContext.strokeStyle = 'blue';
  map.LINEDEFS.forEach((l) => {
    const v1 = vertexLocalPos[l.v1],
      v2 = vertexLocalPos[l.v2];
    
    if (!(l.flags.notOnMap || l.flags.secret)) {
      mapContext.beginPath();
      mapContext.moveTo(v1.x, mapCanvas.height - v1.y);
      mapContext.lineTo(v2.x, mapCanvas.height - v2.y);
      mapContext.stroke();
    }
  });
  
  //TODO: plot the locations of the things (and their direction)
  mapContext.strokeStyle = 'white';
  mapContext.fillStyle = 'green';
  map.THINGS.forEach((thing) => {
    const plotX = (thing.x - offsetX) * scale;
    const plotY = (thing.y - offsetY) * scale;
    
    mapContext.beginPath();
    mapContext.arc(plotX, mapCanvas.height - plotY, thingSize, 0, Math.PI*2);
    mapContext.fill();
    
    //use the angle to draw a line where the thing is looking
    const rotAngle = thing.angle/180 * Math.PI;
    
    const newX = Math.cos(rotAngle) * thingSize;
    const newY = (Math.sin(rotAngle) + 1) * thingSize;
    
    mapContext.beginPath();
    mapContext.moveTo(plotX, mapCanvas.height - plotY);
    mapContext.lineTo(plotX + newX, mapCanvas.height - plotY + newY);
    mapContext.stroke();
  });

  return mapContext;
}
