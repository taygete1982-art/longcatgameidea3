import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.disposables = new Set();
    this.updatables = [];
    this.pulseTime = 0;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.setupResizeHandler();
  }

  createCamera() {
    const C = CONFIG.camera;
    const camera = new THREE.PerspectiveCamera(
      C.fov || 60,
      window.innerWidth / window.innerHeight,
      0.1,
      C.far || 1000
    );
    camera.position.set(0, 65, 0.1);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CONFIG.render.clearColor, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  handleResize() {
    // Размер от контейнера: контейнер зафиксирован в портрете 9:16 через CSS.
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update(delta) {
    for (const obj of this.updatables) {
      obj.update(delta, this.pulseTime);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  addObject(object) {
    this.scene.add(object);
    this.trackDisposable(object);
    if (typeof object.update === 'function') {
      this.updatables.push(object);
    }
  }

  removeObject(object) {
    this.scene.remove(object);
    this.disposeObject(object);
    this.updatables = this.updatables.filter(o => o !== object);
  }

  trackDisposable(object) {
    this.disposables.add(object);
    object.traverse((child) => {
      if (child.geometry) this.disposables.add(child.geometry);
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => this.disposables.add(m));
        } else {
          this.disposables.add(child.material);
        }
      }
    });
  }

  disposeObject(object) {
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.disposables.forEach(item => {
      if (item && typeof item.dispose === 'function') item.dispose();
    });
    this.disposables.clear();
    this.updatables = [];
    this.scene.clear();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
