import { vec3 } from "gl-matrix";

import { Ray } from './../interfaces/Ray';
import { Triangle3D } from "../interfaces/Triangle3D";

const EPSILON = 0.0000001;

//re-use the same memory block for every call for the triangle
const h = vec3.create();
const s = vec3.create();
const q = vec3.create();

export const rayTriangleIntersection = (out: vec3, ray: Ray, triangle: Triangle3D): vec3 | undefined => {
    vec3.cross(h, ray.direction, triangle.edge2);
    const a = vec3.dot(triangle.edge1, h);
    
    //ray is parallel to this triangle
    if (a > -EPSILON && a < EPSILON) {
      return;
    }

    const f = 1.0 / a;
    vec3.subtract(s, ray.position, triangle.v1);

    const u = f * vec3.dot(s, h);
    if (u < 0.0 || u > 1.0) {
        return;
    }

    vec3.cross(q, s, triangle.edge1);
    const v = f * vec3.dot(ray.direction, q);
    if (v < 0.0 || u + v > 1.0) {
        return;
    }

    const t = f * vec3.dot(triangle.edge2, q);
    if (t < EPSILON) {
      //line intersection but not a ray intersection
      return;
    }

    return vec3.scaleAndAdd(out, ray.position, ray.direction, t);
};
