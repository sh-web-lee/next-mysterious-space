import { attitude } from "./attitude";
import { floor } from "./floor";
import { groundFog } from "./groundFog";
import { house } from "./house";
import { paths } from "./paths";
import { sky } from "./sky";
import { skyClouds } from "./skyClouds";
import { skyscrapers } from "./skyscraper";
import { soul } from "./soul";
import { wish } from "./wish";

function init() {
  floor.init();
  paths.init();
  sky.init();
  house.init();
  skyscrapers.init();
  groundFog.init();
  skyClouds.init();
  attitude.init();
  wish.init();
  soul.init();
}

function destroy() {
  floor.destroy();
  paths.destroy();
  house.destroy();
  groundFog.destroy();
  skyClouds.destroy();
  attitude.destroy();
  wish.destroy();
  skyscrapers.destroy();
  soul.destroy();
  sky.destroy();
}

export const objects = { init, destroy };
