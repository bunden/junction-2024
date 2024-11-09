import Root from './Viewer3d.svelte';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Environment3d {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    const ret = this.init(canvas);
    this.scene = ret.scene;
    this.camera = ret.camera;
    this.renderer = ret.renderer;
  }

  init(canvas: HTMLCanvasElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#AAAAFF', 1);
    directionalLight.position.x = 10;
    directionalLight.position.y = 10;
    directionalLight.position.z = 10;
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(
      '/elevator.gltf',
      function (gltf) {
        scene.add(gltf.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    function render() {
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);

    return { scene, camera, renderer };
  }

  setCameraRotation(yaw: number, pitch: number, distance: number) {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const y = distance * Math.sin(pitchRad);
    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }
}

export { Root as Viewer3d, Environment3d };
