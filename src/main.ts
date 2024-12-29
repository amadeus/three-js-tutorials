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

const loader = new TextureLoader();
const texture = loader.load("/wall.jpg");
texture.colorSpace = SRGBColorSpace;

function makeInstance(geometry: BufferGeometry, color: number, x: number) {
  const material = new MeshBasicMaterial({
    color,
    map: texture,
  });
  const cube = new Mesh(geometry, material);
  cube.position.x = x;
  scene.add(cube);
  return cube;
}

const geometry = new BoxGeometry(1, 1, 1);

const cubes = [
  makeInstance(geometry, 0x44aa88, 0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844, 2),
];

camera.position.z = 5;

const light = new DirectionalLight(0xffffff, 3);
light.position.set(-1, 2, 4);
scene.add(light);

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
