import Root from './Viewer3d.svelte';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { expand, type Floor, type Point, generateTopAndBottom } from '$utils/pointsToModel';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

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

  buildingMaterialSolid = new THREE.MeshStandardMaterial({
    color: '#FF5555'
  });

  buildingMaterialTransparent = new THREE.MeshStandardMaterial({
    color: '#FF5555',
    transparent: true,
    opacity: 0.5
  });

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

    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'building_group';
    this.scene.add(buildingGroup);

    this.updateCameraPosition();
  }

  reloadBuilding(floorStates: Map<string, any> | undefined, transparent: boolean) {
    const buildingGroup = this.scene.getObjectByName('building_group');
    if (!buildingGroup) return;
    buildingGroup.clear();
    const floors: Floor[] =
      floorStates
        ?.entries()
        .map(([key, value]): Floor => {
          const floor: Floor = {
            number: Number(key),
            height: value.height,
            outerWallCorners: value.outerWallCorners?.map((point: Point) => {
              return { x: point.x / 100.0, y: point.y / 100.0 };
            }),
            outerWallWidth: value.outerWallWidth,
            innerWallVectors: value.innerWallVectors
          };
          return floor;
        })
        .filter((floor) => floor.outerWallCorners)
        .toArray() ?? [];
    const buildingGeometries = expand(floors);
    buildingGeometries.forEach((geometryArray) => {
      geometryArray.forEach((geometry) => {
        const buildingMaterial = transparent ? this.buildingMaterialTransparent : this.buildingMaterialSolid;
        const mesh = new THREE.Mesh(geometry, buildingMaterial);
        buildingGroup.add(mesh);
      });
    });
    const floorAndCeilingGeometries = generateTopAndBottom(floors);
    floorAndCeilingGeometries.forEach((geometry) => {
      const buildingMaterial = transparent ? this.buildingMaterialTransparent : this.buildingMaterialSolid;
      const mesh = new THREE.Mesh(geometry, buildingMaterial);
      buildingGroup.add(mesh);
    });
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

  exportModel() {
    const exporter = new GLTFExporter();
    exporter.parse(
      this.scene,
      function (glb) {
        const blob = new Blob([glb as ArrayBuffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(blob);
        link.download = 'model.glb';
        link.click();
      },
      function (error) {
        console.log(error);
      },
      { binary: true }
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
    const intersection = this.raycaster.intersectObjects(
      this.scene.children.filter((object) => object.name !== 'building_group')
    );
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
    const test: Floor[] = [];
    const floor1: Floor = {
      number: 1,
      height: 3,
      outerWallCorners: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 8, y: 4 },
        { x: 4, y: 8 },
        { x: 0, y: 8 }
      ],
      outerWallWidth: 0.5,
      innerWallVectors: [{ startPos: { x: 0, y: 0 }, endPos: { x: 0, y: 0 }, wallWidth: 4 }]
    };
    const floor2: Floor = {
      number: 1,
      height: 2,
      outerWallCorners: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 }
      ],
      outerWallWidth: 0.5,
      innerWallVectors: [{ startPos: { x: 0, y: 0 }, endPos: { x: 0, y: 0 }, wallWidth: 4 }]
    };

    test.push(floor1);
    test.push(floor2);

    const material = new THREE.MeshStandardMaterial({ color: '#FF5555', wireframe: false });

    const buildingGeometry = expand(test);

    for (let i = 0; i < buildingGeometry.length; i++) {
      for (let j = 0; j < buildingGeometry[i].length; j++) {
        const wall_mesh = new THREE.Mesh(buildingGeometry[i][j], material);

        this.scene.add(wall_mesh);
      }
    }

    const planes = generateTopAndBottom(test);

    for (let i = 0; i < planes.length; i++) {
      const plane_mesh = new THREE.Mesh(planes[i], material);

      this.scene.add(plane_mesh);
    }
  }
}

export { Root as Viewer3d, Environment3d };
