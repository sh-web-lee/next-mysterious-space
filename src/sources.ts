export type SourceData = {
  name: string;
  type: "gltfModel" | "texture" | "hdr";
  path: string;
};

export const sources = [
  {
    name: "house-model",
    type: "gltfModel",
    path: "/models/house.glb",
  },
  {
    name: "attitude-model",
    type: "gltfModel",
    path: "/models/attitude.glb",
  },
  {
    name: "soul-model",
    type: "gltfModel",
    path: "/models/soul.glb",
  },
  {
    name: "wish-model",
    type: "gltfModel",
    path: "/models/wish.glb",
  },
  {
    name: "skyscrapers-model",
    type: "gltfModel",
    path: "/models/skyscrapers.glb",
  },
  {
    name: "step-texture",
    type: "texture",
    path: "/texture/step.webp",
  },
  {
    name: "floor-texture",
    type: "texture",
    path: "/texture/floor-v2.webp",
  },
  {
    name: "cloud-texture",
    type: "texture",
    path: "/texture/cloud.webp",
  },
  {
    name: "scene-hdr",
    type: "hdr",
    path: "/hdr/scene.hdr",
  },
] as const satisfies SourceData[];
