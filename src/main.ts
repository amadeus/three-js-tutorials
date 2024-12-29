import "./style.css";

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  LineBasicMaterial,
  Vector3,
  BufferGeometry,
  Line,
} from "three";

const dpi = window.devicePixelRatio ?? 1;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth * dpi, window.innerHeight * dpi, false);

const camera = new PerspectiveCamera(
  45,
  (window.innerWidth * dpi) / (window.innerHeight * dpi),
  1,
  500,
);

camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const scene = new Scene();

const material = new LineBasicMaterial({ color: 0x0000ff });

const points = [
  new Vector3(-10, 0, 0),
  new Vector3(0, 10, 0),
  new Vector3(10, 0, 0),
];

const geometry = new BufferGeometry().setFromPoints(points);
const line = new Line(geometry, material);
scene.add(line);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);
