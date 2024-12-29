import "./style.css";

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  DirectionalLight,
  TextureLoader,
  SRGBColorSpace,
  LoadingManager,
  type BufferGeometry,
} from "three";

const dpi = window.devicePixelRatio ?? 1;

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

interface QueuedWindowUpdates {
  width: number | null;
  height: number | null;
}

const toUpdate: QueuedWindowUpdates = {
  width: null,
  height: null,
};

window.addEventListener("resize", () => {
  toUpdate.width = window.innerWidth * dpi;
  toUpdate.height = window.innerHeight * dpi;
});

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth * dpi, window.innerHeight * dpi, false);

document.body.appendChild(renderer.domElement);

function loadColorTexture(path: string) {
  const texture = loader.load(path);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const loadManager = new LoadingManager();
const loader = new TextureLoader(loadManager);
const materials = [
  new MeshBasicMaterial({ map: loadColorTexture("/flower-1.jpg") }),
  new MeshBasicMaterial({ map: loadColorTexture("/flower-2.jpg") }),
  new MeshBasicMaterial({ map: loadColorTexture("/flower-3.jpg") }),
  new MeshBasicMaterial({ map: loadColorTexture("/flower-4.jpg") }),
  new MeshBasicMaterial({ map: loadColorTexture("/flower-5.jpg") }),
  new MeshBasicMaterial({ map: loadColorTexture("/flower-6.jpg") }),
];

function makeInstance(geometry: BufferGeometry, x: number) {
  const cube = new Mesh(geometry, materials);
  cube.position.x = x;
  scene.add(cube);
  return cube;
}

const geometry = new BoxGeometry(1, 1, 1);

const light = new DirectionalLight(0xffffff, 3);
light.position.set(-1, 2, 4);
scene.add(light);

const loadingElem = document.getElementById("loading");
if (loadingElem == null) {
  throw new Error(`Loading Element doesn't exist`);
}
const progressBarElem = loadingElem.querySelector(".progressbar");
if (!(progressBarElem instanceof HTMLElement)) {
  throw new Error(`progressBarElem doesn't exist`);
}

loadManager.onProgress = (
  _urlOfLastItemLoaded: string,
  itemsLoaded: number,
  itemsTotal: number,
) => {
  const progress = itemsLoaded / itemsTotal;
  progressBarElem.style.transform = `scaleX(${progress})`;
};

loadManager.onLoad = () => {
  loadingElem.style.display = "none";
  const cubes = [
    makeInstance(geometry, 0),
    makeInstance(geometry, -2),
    makeInstance(geometry, 2),
  ];

  function render() {
    if (toUpdate.width != null && toUpdate.height != null) {
      camera.aspect = toUpdate.width / toUpdate.height;
      camera.updateProjectionMatrix();
      renderer.setSize(toUpdate.width, toUpdate.height, false);
      toUpdate.width = null;
      toUpdate.height = null;
    }
    for (const cube of cubes) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
};
