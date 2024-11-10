import { Vector2, Vector3 } from 'three';
import earcut from 'earcut';
import * as THREE from 'three';

export interface Point {
  x: number;
  y: number;
}

export interface WallParameters {
  startPos: Point;
  endPos: Point;
  wallWidth: number;
}

export interface Floor {
  number: number;
  height: number;
  outerWallCorners: Point[];
  outerWallWidth: number;
  innerWallVectors?: WallParameters[];
}

export function expand(floors: Floor[]) {
  let currentFloorHeight = 0;

  const buildingGeometries = [];

  for (let floorNumber = 0; floorNumber < floors.length; floorNumber++) {
    const floor = floors[floorNumber];
    const wallWidth = floor.outerWallWidth;

    const floorGeometries = []

    if (floor.outerWallCorners.length < 2) {
      console.log('Cannot draw walls between less than two corners');
      throw Error('floor had less than 2 outer wall corners');
    }

    const firstPoint = floor.outerWallCorners[floor.outerWallCorners.length - 1];
    let currentX = firstPoint.x;
    let currentY = firstPoint.y;

    const secondPoint = floor.outerWallCorners[0];
    const secondX = secondPoint.x;
    const secondY = secondPoint.y;

    const originalChangeX = secondX - currentX;
    const originalChangeY = secondY - currentY;

    const perpendicular: Vector2 = new Vector2(-originalChangeY, originalChangeX).normalize();

    const originalWidthScaleX = perpendicular.x;
    const originalWidthScaleY = perpendicular.y;

    let pointLocation1 = new Vector3(
        currentX + wallWidth * 0.5 * originalWidthScaleX,
        currentFloorHeight,
        currentY + wallWidth * 0.5 * originalWidthScaleY
    );
    let pointLocation2 = new Vector3(
        currentX - wallWidth * 0.5 * originalWidthScaleX,
        currentFloorHeight,
        currentY - wallWidth * 0.5 * originalWidthScaleY,
    );

    let originalPointLocation1 = new Vector3(0, 0, 0);
    let originalPointLocation2 = new Vector3(0, 0, 0);

    for (let pointIndex = 0; pointIndex < floor.outerWallCorners.length; pointIndex++) {
      const cornerPoint = floor.outerWallCorners[pointIndex];
      const cornerX = cornerPoint.x;
      const cornerY = cornerPoint.y;

      const changeX = cornerX - currentX;
      const changeY = cornerY - currentY;

      const perpendicular: Vector2 = new Vector2(-changeY, changeX).normalize();

      const widthScaleX = perpendicular.x;
      const widthScaleY = perpendicular.y;

      let correctionForLocation3: Vector3 = new Vector3(0, 0, 0)
      let correctionForLocation4: Vector3 = new Vector3(0, 0, 0)

      let nextPoint;
      if (pointIndex + 1 < floor.outerWallCorners.length) {
        nextPoint = floor.outerWallCorners[pointIndex + 1];
      } else {
        nextPoint = floor.outerWallCorners[0];
      }

      const nextX = nextPoint.x;
      const nextY = nextPoint.y;

      const currentVector = new Vector2(cornerX - currentX, cornerY - currentY)
      const nextVector = new Vector2(nextX - cornerX, nextY - cornerY)

      const angle = currentVector.clone().angleTo(nextVector.clone())

      const half_width = wallWidth * 0.5
      const a = half_width * Math.tan((angle - Math.PI * 0.5))
      const b = half_width / Math.cos((angle - Math.PI * 0.5))

      const currentUnit = currentVector.clone().normalize()

      const correction = currentUnit.clone().multiplyScalar(a + b)

      const dot = currentVector.clone().dot(nextVector.clone())
      const determinant = currentVector.x * nextVector.y - currentVector.y * nextVector.x
      const angleAbsolute = Math.atan2(determinant, dot)

      let correctionFactorForLocation3
      let correctionFactorForLocation4

      if (angleAbsolute > 0) {
        correctionFactorForLocation3 = correction.clone().negate()
        correctionFactorForLocation4 = correction.clone()
      } else {
        correctionFactorForLocation3 = correction.clone()
        correctionFactorForLocation4 = correction.clone().negate()
      }

      correctionForLocation3 = new Vector3(correctionFactorForLocation3.x, 0, correctionFactorForLocation3.y)
      correctionForLocation4 = new Vector3(correctionFactorForLocation4.x, 0, correctionFactorForLocation4.y)


      const pointLocation3: Vector3 = new Vector3(
        cornerX + wallWidth * 0.5 * widthScaleX,
        currentFloorHeight,
        cornerY + wallWidth * 0.5 * widthScaleY
      ).add(correctionForLocation3);
      const pointLocation4: Vector3 = new Vector3(
        cornerX - wallWidth * 0.5 * widthScaleX,
        currentFloorHeight,
        cornerY - wallWidth * 0.5 * widthScaleY,
      ).add(correctionForLocation4);

      const heightVector: Vector3 = new Vector3(0, floor.height, 0)

      if (pointIndex !== 0) {

        const lowerWallPoint1 = pointLocation1
        const lowerWallPoint2 = pointLocation2
        const lowerWallPoint3 = pointLocation3
        const lowerWallPoint4 = pointLocation4

        const upperWallPoint1 = pointLocation1.clone().add(heightVector)
        const upperWallPoint2 = pointLocation2.clone().add(heightVector)
        const upperWallPoint3 = pointLocation3.clone().add(heightVector)
        const upperWallPoint4 = pointLocation4.clone().add(heightVector)

        const wallVerticies = []

        wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z);
        wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);

        wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z);
        wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z);

        wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z,);
        wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z);

        wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z,);
        wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z);

        wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);
        wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);

        wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);
        wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint2.x, upperWallPoint1.y, upperWallPoint2.z);

        const wall = new THREE.BufferGeometry();
        wall.setAttribute('position', new THREE.BufferAttribute(new Float32Array (wallVerticies), 3));
        wall.computeVertexNormals();

        floorGeometries.push(wall)
    }
      else{
        originalPointLocation1 = pointLocation3
        originalPointLocation2 = pointLocation4
      }

      currentX = cornerX
      currentY = cornerY

      pointLocation1 = pointLocation3
      pointLocation2 = pointLocation4
    }

    const heightVector: Vector3 = new Vector3(0, floor.height, 0)


      const lowerWallPoint1 = pointLocation1
      const lowerWallPoint2 = pointLocation2
      const lowerWallPoint3 = originalPointLocation1
      const lowerWallPoint4 = originalPointLocation2

      const upperWallPoint1 = pointLocation1.clone().add(heightVector)
      const upperWallPoint2 = pointLocation2.clone().add(heightVector)
      const upperWallPoint3 = originalPointLocation1.clone().add(heightVector)
      const upperWallPoint4 = originalPointLocation2.clone().add(heightVector)

    const wallVerticies = []

    wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z);
    wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);

    wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z);
    wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z);

    wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z,);
    wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z);

    wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z,);
    wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z);

    wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);
    wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);

    wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);
    wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint2.x, upperWallPoint1.y, upperWallPoint2.z);

    const wall = new THREE.BufferGeometry();
    wall.setAttribute('position', new THREE.BufferAttribute(new Float32Array (wallVerticies), 3));
    wall.computeVertexNormals();

    floorGeometries.push(wall)

    buildingGeometries.push(floorGeometries)

    currentFloorHeight += floor.height;
  }

  return buildingGeometries
}

export function generateTopAndBottom(floors: Floor[]) {
  const geometries = [];

  let currentFloorHeight = 0

  for (let floorNumber = 0; floorNumber < floors.length; floorNumber++) {
    const points = []

    for (let pointIndex = 0; pointIndex < floors[floorNumber].outerWallCorners.length; pointIndex++) {
      const current = floors[floorNumber].outerWallCorners[pointIndex];

      points.push(current.x)
      points.push(current.y)
    }
    const first = floors[floorNumber].outerWallCorners[0]

    points.push(first.x)
    points.push(first.y)

    const Vertices2d = earcut(points)

    const bottomVertices = []
    const topVertices = []

    for (let i = 0; i < Vertices2d.length; i += 3) {
      const pointA = floors[floorNumber].outerWallCorners[Vertices2d[i]]
      const pointB = floors[floorNumber].outerWallCorners[Vertices2d[i+1]]
      const pointC = floors[floorNumber].outerWallCorners[Vertices2d[i+2]]

      bottomVertices.push(pointA.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointA.y)

      topVertices.push(pointA.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointA.y)

      bottomVertices.push(pointC.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointC.y)

      topVertices.push(pointB.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointB.y)

      bottomVertices.push(pointB.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointB.y)

      topVertices.push(pointC.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointC.y)

      bottomVertices.push(pointA.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointA.y)

      topVertices.push(pointA.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointA.y)

      bottomVertices.push(pointB.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointB.y)

      topVertices.push(pointC.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointC.y)

      bottomVertices.push(pointC.x)
      bottomVertices.push(currentFloorHeight)
      bottomVertices.push(pointC.y)

      topVertices.push(pointB.x)
      topVertices.push(currentFloorHeight + floors[floorNumber].height)
      topVertices.push(pointB.y)
    }

    console.log(bottomVertices)

    const bottomGeometry = new THREE.BufferGeometry();
    const topGeometry = new THREE.BufferGeometry();

    bottomGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array (bottomVertices), 3));
    bottomGeometry.computeVertexNormals();


    geometries.push(bottomGeometry)

    topGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array (topVertices), 3));
    topGeometry.computeVertexNormals();

    geometries.push(topGeometry)

    currentFloorHeight += floors[floorNumber].height
  }

  return geometries
}
