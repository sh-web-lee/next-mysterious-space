import { EquirectangularReflectionMapping, SRGBColorSpace, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import EventEmitter from "./EventEmitter";
import { sources, type SourceData } from "@/sources";

type ResourceType = Texture | GLTF;

export class LoadSource extends EventEmitter<{
  ready: void;
  progress: number;
}> {
  toLoad = 0;
  isReady = false;
  loaded = 0;
  sources: SourceData[] = [];
  items: Record<string, ResourceType> = {};
  private loaders;

  constructor(sources: SourceData[]) {
    super();
    this.sources = sources;
    this.toLoad = sources.length;

    // DRACO decoder for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    this.loaders = {
      gltfLoader,
      textureLoader: new TextureLoader(),
      hdrLoader: new HDRLoader(),
    };
  }

  startLoading() {
    if (this.isReady) return;

    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file: Texture) => {
          file.colorSpace = SRGBColorSpace;
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "hdr") {
        this.loaders.hdrLoader.load(source.path, (texture: Texture) => {
          texture.mapping = EquirectangularReflectionMapping;
          this.sourceLoaded(source, texture);
        });
      }
    }
  }

  sourceLoaded(item: SourceData, file: ResourceType) {
    this.items[item.name] = file;
    this.loaded++;
    console.log(123, item.name);
    this.emit("progress", this.loaded / this.toLoad);
    if (this.loaded === this.toLoad) {
      this.isReady = true;
      this.emit("ready");
    }
  }
}

export const loadSources = new LoadSource(sources);
