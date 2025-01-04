import './style.css';

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  DirectionalLight,
  MathUtils,
  TextureLoader,
  SRGBColorSpace,
  LoadingManager,
  ClampToEdgeWrapping,
  RepeatWrapping,
  MirroredRepeatWrapping,
  type BufferGeometry,
} from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

class BaseHelper {
  obj: Record<string, any>;
  prop: string;

  constructor(obj: Record<string, any>, prop: string) {
    this.obj = obj;
    this.prop = prop;
  }
}

class DegRadHelper extends BaseHelper {
  get value(): number {
    return MathUtils.radToDeg(this.obj[this.prop]);
  }

  set value(v: number) {
    this.obj[this.prop] = MathUtils.degToRad(v);
  }
}

class StringToNumberHelper extends BaseHelper {
  get value(): number {
    return this.obj[this.prop];
  }

  set value(v: string) {
    this.obj[this.prop] = parseFloat(v);
  }
}

const wrapModes = {
  ClampToEdgeWrapping,
  RepeatWrapping,
  MirroredRepeatWrapping,
};

const dpi = window.devicePixelRatio ?? 1;

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

interface QueuedWindowUpdates {
  width: number | null;
  height: number | null;
}

const toUpdate: QueuedWindowUpdates = {
  width: null,
  height: null,
};

window.addEventListener('resize', () => {
  toUpdate.width = window.innerWidth * dpi;
  toUpdate.height = window.innerHeight * dpi;
});

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth * dpi, window.innerHeight * dpi, false);

document.body.appendChild(renderer.domElement);

const loadManager = new LoadingManager();
const loader = new TextureLoader(loadManager);
const texture = loader.load('/wall.jpg');
texture.colorSpace = SRGBColorSpace;
const material = new MeshBasicMaterial({map: texture});

function makeInstance(geometry: BufferGeometry, x: number) {
  const cube = new Mesh(geometry, material);
  cube.position.x = x;
  scene.add(cube);
  return cube;
}

const geometry = new BoxGeometry(1, 1, 1);

const light = new DirectionalLight(0xffffff, 3);
light.position.set(-1, 2, 4);
scene.add(light);

const loadingElem = document.getElementById('loading');
if (loadingElem == null) {
  throw new Error(`Loading Element doesn't exist`);
}
const progressBarElem = loadingElem.querySelector('.progressbar');
if (!(progressBarElem instanceof HTMLElement)) {
  throw new Error(`progressBarElem doesn't exist`);
}

function updateTexture() {
  texture.needsUpdate = true;
}

const gui = new GUI();
gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes).name('texture.wrapS').onChange(updateTexture);
gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes).name('wrapT').onChange(updateTexture);
gui.add(texture.repeat, 'x', 0, 5, 0.1).name('texture.repeat.x');
gui.add(texture.repeat, 'y', 0, 5, 0.1).name('texture.repeat.y');
gui.add(texture.offset, 'x', 0, 5, 0.1).name('texture.offset.x');
gui.add(texture.offset, 'y', 0, 5, 0.1).name('texture.offset.y');
gui.add(texture.center, 'x', 0, 5, 0.1).name('texture.center.x');
gui.add(texture.center, 'y', 0, 5, 0.1).name('texture.center.y');
gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360).name('texture.rotation');

loadManager.onProgress = (_urlOfLastItemLoaded: string, itemsLoaded: number, itemsTotal: number) => {
  const progress = itemsLoaded / itemsTotal;
  progressBarElem.style.transform = `scaleX(${progress})`;
};

loadManager.onLoad = () => {
  loadingElem.style.display = 'none';
  const cubes = [makeInstance(geometry, 0), makeInstance(geometry, -2), makeInstance(geometry, 2)];

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
