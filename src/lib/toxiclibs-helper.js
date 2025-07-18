import toxi from "toxiclibsjs";

export const {
  Rect,
  Circle,
  Polygon2D,
  Vec2D,
  Line2D,
  Ray2D,
  Vec3D,
  Line3D,
  Ray3D,
  Quaternion,
} = toxi.geom;

export const {
  VerletPhysics2D,
  GravityBehavior2D,
  AttractionBehavior2D,
  VerletParticle2D,
  VerletSpring2D,
  VerletMinDistanceSpring2D,
} = toxi.physics2d;

export const { AttractionBehavior, ConstantForceBehavior, GravityBehavior } =
  toxi.physics2d.behaviors;

export const simplexNoise = toxi.math.noise.simplexNoise.noise;
