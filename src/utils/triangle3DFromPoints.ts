import { vec3 } from "gl-matrix";

import { Triangle3D } from "../interfaces/Triangle3D";
import { Vertex3D } from "../interfaces/Vertex3D";

export const triangle3DFromPoints = (v1: Vertex3D, v2: Vertex3D, v3: Vertex3D): Triangle3D => {
  const edge1 = vec3.create();
  const edge2 = vec3.create();
  const normal = vec3.create();
  const min = vec3.create();
  const max = vec3.create();
    
  vec3.subtract(edge1, v2, v1);
  vec3.subtract(edge2, v3, v1);
  
  vec3.cross(normal, edge1, edge2);

  vec3.min(min, vec3.min(min, v1, v2), v3);
  vec3.max(max, vec3.max(max, v1, v2), v3);
  
  return {
    v1,
    v2,
    v3,
    edge1,
    edge2,
    normal,
    aabb: {
      min,
      max 
    }
  };
};
