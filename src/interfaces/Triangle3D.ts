import { Vertex3D } from './Vertex3D';
import { Aabb3D } from './Aabb3D';

export interface Triangle3D {
  v1: Vertex3D;
  v2: Vertex3D;
  v3: Vertex3D;

  edge1: Vertex3D;
  edge2: Vertex3D;

  normal: Vertex3D;

  aabb: Aabb3D;
}
