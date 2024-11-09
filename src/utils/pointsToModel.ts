import { Vector2, Vector3 } from 'three';
import * as util from "node:util";

interface Point {
  x: number;
  y: number;
}

interface WallParameters {
  startPos: Point;
  endPos: Point;
  wallWidth: number;
}

interface Floor {
  number: number;
  height: number;
  outerWallCorners: Point[];
  outerWallWidth: number;
  innerWallVectors: WallParameters[];
}

function expand(floors: Floor[]) {
  let currentFloorHeight = 0;

  const wallVerticies: number[] = [];

  for (let floorNumber = 0; floorNumber < floors.length; floorNumber++) {
    const floor = floors[floorNumber];
    const wallWidth = floor.outerWallWidth;

    if (floor.outerWallCorners.length < 2) {
      console.log('Cannot draw walls between less than two corners');
      throw Error('floor had less than 2 outer wall corners');
    }

    const firstPoint = floor.outerWallCorners[0];
    let currentX = firstPoint.x;
    let currentY = firstPoint.y;

    const secondPoint = floor.outerWallCorners[1];
    const secondX = secondPoint.x;
    const secondY = secondPoint.y;

    const originalChangeX = secondX - currentX;
    const originalChangeY = secondY - currentY;

    const perpendicular: Vector2 = new Vector2(-originalChangeY, originalChangeX).normalize();

    const originalWidthScaleX = perpendicular.x;
    const originalWidthScaleY = perpendicular.y;

    let pointLocation1: Vector3 = new Vector3(
        currentX + wallWidth * 0.5 * originalWidthScaleX,
        currentFloorHeight,
        currentY + wallWidth * 0.5 * originalWidthScaleY
    );
    let pointLocation2: Vector3 = new Vector3(
        currentX - wallWidth * 0.5 * originalWidthScaleX,
        currentFloorHeight,
        currentY - wallWidth * 0.5 * originalWidthScaleY
    );
    for (let pointIndex = 1; pointIndex < floor.outerWallCorners.length; pointIndex++) {
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

      if (pointIndex + 1 < floor.outerWallCorners.length) {
        const nextPoint = floor.outerWallCorners[pointIndex + 1];
        const nextX = nextPoint.x;
        const nextY = nextPoint.y;

        const currentVector = new Vector2(cornerX - currentX, cornerY - currentY)
        const nextVector = new Vector2(nextX - cornerX, nextY - cornerY)

        const angle = currentVector.clone().angleTo(nextVector.clone())

        const half_width = wallWidth * 0.5
        const a = half_width * Math.tan((Math.PI * 0.5 - angle))
        const b = half_width / Math.cos((Math.PI * 0.5 - angle))

        const currentUnit = currentVector.clone().normalize()

        const correction = currentUnit.clone().multiplyScalar(a + b)

        const dot = currentVector.clone().dot(nextVector.clone())
        const determinant = currentVector.x * nextVector.y - currentVector.y * nextVector.x
        const angleAbsolute = Math.atan2(determinant, dot)

        let correctionFactorForLocation3
        let correctionFactorForLocation4

        console.log(angleAbsolute)

        if (angleAbsolute > 0) {
          correctionFactorForLocation3 = correction.clone().negate()
          correctionFactorForLocation4 = correction.clone()
        }
        else {
          correctionFactorForLocation3 = correction.clone()
          correctionFactorForLocation4 = correction.clone().negate()
        }

        correctionForLocation3 = new Vector3(correctionFactorForLocation3.x, 0, correctionFactorForLocation3.y)
        correctionForLocation4 = new Vector3(correctionFactorForLocation4.x, 0, correctionFactorForLocation4.y)
      }

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

      //const heightVector: Vector3 = new Vector3(0, floor.height, 0)

      const lowerWallPoint1 = pointLocation1
      const lowerWallPoint2 = pointLocation2
      const lowerWallPoint3 = pointLocation3
      const lowerWallPoint4 = pointLocation4

      //const upperWallPoint1 = pointLocation1.clone().add(heightVector)
      //const upperWallPoint2 = pointLocation2.clone().add(heightVector)
      //const upperWallPoint3 = pointLocation3.clone().add(heightVector)
      //const upperWallPoint4 = pointLocation4.clone().add(heightVector)

      wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z);
      wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);

      //wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z);
      //wallVerticies.push(lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z);

      //wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, lowerWallPoint1.x, lowerWallPoint1.y, lowerWallPoint1.z,);
      //wallVerticies.push(lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z);

      //wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, lowerWallPoint3.x, lowerWallPoint3.y, lowerWallPoint3.z,);
      //wallVerticies.push(lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z);

      //wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, lowerWallPoint4.x, lowerWallPoint4.y, lowerWallPoint4.z);
      //wallVerticies.push(lowerWallPoint2.x, lowerWallPoint2.y, lowerWallPoint2.z, upperWallPoint2.x, upperWallPoint2.y, upperWallPoint2.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);

      //wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint3.x, upperWallPoint3.y, upperWallPoint3.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z);
      //wallVerticies.push(upperWallPoint1.x, upperWallPoint1.y, upperWallPoint1.z, upperWallPoint4.x, upperWallPoint4.y, upperWallPoint4.z, upperWallPoint2.x, upperWallPoint1.y, upperWallPoint2.z);

      currentX = cornerX
      currentY = cornerY

        pointLocation1 = pointLocation3
        pointLocation2 = pointLocation4
    }

    currentFloorHeight += floor.height;
  }

  return new Float32Array(wallVerticies)
}

const test: Floor[] = [];
const floor1: Floor = {
  number: 1,
  height: 3,
  outerWallCorners: [{x: 0, y: 0}, {x: 4, y: 0}, {x: 4, y: 4}, {x: 8, y: 4}, {x: 4, y: 8}],
  outerWallWidth: 0.5,
  innerWallVectors: [{startPos: {x: 0, y: 0}, endPos: {x: 0, y: 0}, wallWidth: 4}]
}

test.push(floor1)
console.log(util.inspect(expand(test), { maxArrayLength: null }))
