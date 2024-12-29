import "./style.css";

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshPhongMaterial,
  Mesh,
  SphereGeometry,
  PointLight,
  Object3D,
  AxesHelper,
  Material,
  GridHelper,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const dpi = window.devicePixelRatio ?? 1;

const gui = new GUI();
const scene = new Scene();

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

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

const light = new PointLight(0xffffff, 500);
scene.add(light);

const objects: (Mesh | Object3D)[] = [];

const solarSystem = new Object3D();
scene.add(solarSystem);
objects.push(solarSystem);

const sphereGeometry = new SphereGeometry(1, 6, 6);

// Sun
const sunMaterial = new MeshPhongMaterial({ emissive: 0xffff00 });
const sunMesh = new Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);
solarSystem.add(sunMesh);
objects.push(sunMesh);

// Earch Orbit
const earthOrbit = new Object3D();
earthOrbit.position.x = 10;
solarSystem.add(earthOrbit);
objects.push(earthOrbit);

// Earth
const earthMaterial = new MeshPhongMaterial({
  color: 0x2233ff,
  emissive: 0x112244,
});
const earthMesh = new Mesh(sphereGeometry, earthMaterial);
earthOrbit.add(earthMesh);
objects.push(earthMesh);

// Moon Orbit
const moonOrbit = new Object3D();
moonOrbit.position.x = 2;
earthOrbit.add(moonOrbit);
objects.push(earthOrbit);

// Moon
const moonMaterial = new MeshPhongMaterial({
  color: 0x888888,
  emissive: 0x222222,
});
const moonMesh = new Mesh(sphereGeometry, moonMaterial);
moonMesh.scale.set(0.5, 0.5, 0.5);
moonOrbit.add(moonMesh);
objects.push(moonMesh);

class AxisGridHelper {
  grid: GridHelper;
  axes: AxesHelper;
  _visible = false;
  constructor(node: Mesh | Object3D, units: number = 10) {
    const axes = new AxesHelper();
    if (axes.material instanceof Material) {
      axes.material.depthTest = false;
    }
    axes.renderOrder = 2;
    node.add(axes);

    const grid = new GridHelper(units, units);
    if (grid.material instanceof Material) {
      grid.material.depthTest = false;
    }
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }

  get visible() {
    return this._visible;
  }

  set visible(v: boolean) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

function makeAxisGrid(node: Mesh | Object3D, label: string, units?: number) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, "visible").name(label);
}

makeAxisGrid(solarSystem, "solarSystem", 25);
makeAxisGrid(sunMesh, "sunMesh");
makeAxisGrid(earthOrbit, "earthOrbit");
makeAxisGrid(earthMesh, "earchMesh");
makeAxisGrid(moonOrbit, "moonOrbit");
makeAxisGrid(moonMesh, "moonMesh");

// Begin rendering out the scene
document.body.appendChild(renderer.domElement);

function render(time: number) {
  if (toUpdate.width != null && toUpdate.height != null) {
    camera.aspect = toUpdate.width / toUpdate.height;
    camera.updateProjectionMatrix();
    renderer.setSize(toUpdate.width, toUpdate.height, false);
    toUpdate.width = null;
    toUpdate.height = null;
  }
  for (const obj of objects) {
    obj.rotation.y = time * 0.001;
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
