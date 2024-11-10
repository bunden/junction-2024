import Root from './Viewer3d.svelte';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import util from "node:util";
import { type Floor, generateTopAndBottom, expand } from "$utils/pointsToModel";

class Environment3d {
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  highlightedObject?: THREE.Mesh = undefined;
  selectedObject?: THREE.Mesh = undefined;
  selectedObjectMaterial?: THREE.Material | THREE.Material[] = undefined;

  cameraYaw: number = 0;
  cameraPitch: number = 0;
  cameraDistance: number = 10;
  cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.raycaster = new THREE.Raycaster();
    this.init();
    const render = () => {
      this.renderer.render(this.scene, this.camera);
    };
    this.renderer.setAnimationLoop(render);
  }

  init() {
    this.camera.position.z = 10;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
    directionalLight.position.set(8, 10, 5);
    this.scene.add(directionalLight);

    this.updateCameraPosition();
  }

  rotateCamera(xMovement: number, yMovement: number) {
    this.cameraYaw -= xMovement / 2;
    this.cameraPitch = Math.min(Math.max(this.cameraPitch + yMovement / 2, -85), 85);
    this.updateCameraPosition();
  }

  zoomCamera(zoomMovement: number) {
    this.cameraDistance = Math.min(Math.max(this.cameraDistance + zoomMovement / 100, 1), 50);
    this.updateCameraPosition();
  }

  moveCameraTarget(xMovement: number, yMovement: number) {
    const movementSpeed = this.cameraDistance * 0.001;
    const yawRad = (this.cameraYaw * Math.PI) / 180;
    this.cameraTarget.x -= xMovement * movementSpeed * Math.cos(yawRad) + yMovement * movementSpeed * Math.sin(yawRad);
    this.cameraTarget.z -= xMovement * movementSpeed * -Math.sin(yawRad) + yMovement * movementSpeed * Math.cos(yawRad);
    this.updateCameraPosition();
  }

  updateCameraPosition() {
    const yawRad = (this.cameraYaw * Math.PI) / 180;
    const pitchRad = (this.cameraPitch * Math.PI) / 180;
    const y = this.cameraDistance * Math.sin(pitchRad) + this.cameraTarget.y;
    const x = this.cameraDistance * Math.cos(pitchRad) * Math.sin(yawRad) + this.cameraTarget.x;
    const z = this.cameraDistance * Math.cos(pitchRad) * Math.cos(yawRad) + this.cameraTarget.z;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);
  }

  loadAdditionalModel(file: any) {
    const loader = new GLTFLoader();
    const url = URL.createObjectURL(file);
    loader.load(
      url,
      (gltf) => {
        gltf.scene.children.forEach((object) => {
          this.scene.add(object);
        });
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error(error);
        URL.revokeObjectURL(url);
      }
    );
  }

  removeSelectedObject() {
    if (this.selectedObject) {
      this.scene.remove(this.selectedObject);
    }
  }

  updateHighlightedObject(x: number, y: number) {
    const mouse = new THREE.Vector2();
    mouse.x = (x / this.canvas.clientWidth) * 2 - 1;
    mouse.y = -(y / this.canvas.clientHeight) * 2 + 1;
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersection = this.raycaster.intersectObjects(this.scene.children);
    if (intersection.length == 0) {
      this.highlightedObject = undefined;
    } else {
      const { object } = intersection[0];
      this.highlightedObject = object as THREE.Mesh;
    }
  }

  handleObjectSelection(): boolean {
    // Restore material of old selected object
    if (this.selectedObject && this.selectedObjectMaterial) {
      this.selectedObject.material = this.selectedObjectMaterial;
    }
    if (this.highlightedObject && this.highlightedObject !== this.selectedObject) {
      // Set new selected object and save its material
      this.selectedObject = this.highlightedObject;
      this.selectedObjectMaterial = this.selectedObject.material;
      this.selectedObject.material = new THREE.MeshStandardMaterial({ color: '#FF0000' });
      return true;
    }
    this.selectedObject = undefined;
    this.selectedObjectMaterial = undefined;
    return false;
  }

  moveSelectedObject(xMovement: number, yMovement: number, movementSpeed: number, modifier: boolean) {
    if (modifier) {
      this.selectedObject?.position.add(new THREE.Vector3(0, -yMovement * movementSpeed, 0));
    } else {
      const yawRad = (this.cameraYaw * Math.PI) / 180;
      const xDiff = xMovement * movementSpeed * Math.cos(yawRad) + yMovement * movementSpeed * Math.sin(yawRad);
      const zDiff = xMovement * movementSpeed * -Math.sin(yawRad) + yMovement * movementSpeed * Math.cos(yawRad);
      this.selectedObject?.position.add(new THREE.Vector3(xDiff, 0, zDiff));
    }
  }

  rotateSelectedObject(rotationAmount: number) {
    this.selectedObject?.rotateY(rotationAmount / 2000);
  }

  loadManualModel() {
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      0, 0, 0.25, 4, 0, -0.25, 4, 0, 0.25, 0, 0, 0.25, 0, 0, -0.25, 4, 0, -0.25, 0, 0, 0.25, 0, 3, -0.25, 0, 0, -0.25,
      0, 0, 0.25, 0, 3, 0.25, 0, 3, -0.25, 4, 0, 0.25, 0, 3, 0.25, 0, 0, 0.25, 4, 0, 0.25, 4, 3, 0.25, 0, 3, 0.25, 4, 0,
      -0.25, 4, 3, 0.25, 4, 0, 0.25, 4, 0, -0.25, 4, 3, -0.25, 4, 3, 0.25, 0, 0, -0.25, 4, 3, -0.25, 4, 0, -0.25, 0, 0,
      -0.25, 0, 3, -0.25, 4, 3, -0.25, 0, 3, 0.25, 4, 3, 0.25, 4, 3, -0.25, 0, 3, 0.25, 4, 3, -0.25, 0, 3, -0.25, 3.75,
      0, 0, 4.25, 0, 4, 3.75, 0, 4, 3.75, 0, 0, 4.25, 0, 0, 4.25, 0, 4, 3.75, 0, 0, 4.25, 3, 0, 4.25, 0, 0, 3.75, 0, 0,
      3.75, 3, 0, 4.25, 3, 0, 3.75, 0, 4, 3.75, 3, 0, 3.75, 0, 0, 3.75, 0, 4, 3.75, 3, 4, 3.75, 3, 0, 4.25, 0, 4, 3.75,
      3, 4, 3.75, 0, 4, 4.25, 0, 4, 4.25, 3, 4, 3.75, 3, 4, 4.25, 0, 0, 4.25, 3, 4, 4.25, 0, 4, 4.25, 0, 0, 4.25, 3, 0,
      4.25, 3, 4, 3.75, 3, 0, 3.75, 3, 4, 4.25, 3, 4, 3.75, 3, 0, 4.25, 3, 4, 4.25, 3, 0, 4, 0, 3.75, 0, 0, 4.25, 0, 0,
      3.75, 4, 0, 3.75, 4, 0, 4.25, 0, 0, 4.25, 4, 0, 3.75, 4, 3, 4.25, 4, 0, 4.25, 4, 0, 3.75, 4, 3, 3.75, 4, 3, 4.25,
      0, 0, 3.75, 4, 3, 3.75, 4, 0, 3.75, 0, 0, 3.75, 0, 3, 3.75, 4, 3, 3.75, 0, 0, 4.25, 0, 3, 3.75, 0, 0, 3.75, 0, 0,
      4.25, 0, 3, 4.25, 0, 3, 3.75, 4, 0, 4.25, 0, 3, 4.25, 0, 0, 4.25, 4, 0, 4.25, 4, 3, 4.25, 0, 3, 4.25, 4, 3, 3.75,
      0, 3, 3.75, 0, 3, 4.25, 4, 3, 3.75, 0, 3, 4.25, 4, 3, 4.25, 0.25, 0, 4, -0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 4,
      -0.25, 0, 4, -0.25, 0, 0, 0.25, 0, 4, -0.25, 3, 4, -0.25, 0, 4, 0.25, 0, 4, 0.25, 3, 4, -0.25, 3, 4, 0.25, 0, 0,
      0.25, 3, 4, 0.25, 0, 4, 0.25, 0, 0, 0.25, 3, 0, 0.25, 3, 4, -0.25, 0, 0, 0.25, 3, 0, 0.25, 0, 0, -0.25, 0, 0,
      -0.25, 3, 0, 0.25, 3, 0, -0.25, 0, 4, -0.25, 3, 0, -0.25, 0, 0, -0.25, 0, 4, -0.25, 3, 4, -0.25, 3, 0, 0.25, 3, 4,
      0.25, 3, 0, -0.25, 3, 0, 0.25, 3, 4, -0.25, 3, 0, -0.25, 3, 4
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: '#FF5555', transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
  }
}

export { Root as Viewer3d, Environment3d };
