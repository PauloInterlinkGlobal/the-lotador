/**
 * LOTADOR - Scenery & Obstacle Manager
 * Manages 3D billboard placement, pixel-art textures, Y-sorting depth,
 * solid footprint collisions with axial sliding, AI steering, and dev debug visualization.
 */

import * as THREE from 'three';
import { SceneryCollider, SceneryPlacement } from '../types/scenery';
import { SCENERY_FRAME_DEFS, SCENERY_PLACEMENTS } from '../data/sceneryPlacements';
import { sceneryAtlasManager } from '../utils/sceneryAtlas';

export class SceneryObstacleManager {
  private scene: THREE.Scene;
  private sceneryMeshes: Map<string, THREE.Group> = new Map();
  private colliders: SceneryCollider[] = [];
  private debugGroup: THREE.Group | null = null;
  private debugVisible = false;

  // Scratch vector to avoid Garbage Collection in update loops
  private static readonly _tempVec = new THREE.Vector2();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Initializes scenery for the current paragem zone / level.
   * Replaces or augments map decorations with exact pixel-art obstacles.
   */
  public initLevelScenery(zoneId: string = 'PARAGEM_URBANA') {
    this.clear();

    const placements = SCENERY_PLACEMENTS[zoneId] || SCENERY_PLACEMENTS.LEVEL_1;
    const playerHeightRef = 2.8;

    placements.forEach((placement) => {
      const def = SCENERY_FRAME_DEFS[placement.type];
      if (!def) return;

      const scaleMult = placement.scale ?? 1.0;
      const worldHeight = playerHeightRef * def.heightRatio * scaleMult;
      const worldWidth = worldHeight * (def.width / def.height);
      const groundY = placement.y ?? (placement.z < -1.5 ? 0.0 : 0.4);

      const group = new THREE.Group();
      group.name = `scenery_${placement.id}`;

      // 1. Texture & Pixel-Art Sprite Billboard
      const texture = sceneryAtlasManager.getTexture(placement.type);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(worldWidth, worldHeight, 1);
      // Anchor sprite base directly onto ground contact plane
      sprite.position.set(0, worldHeight / 2, 0);
      group.add(sprite);

      // 2. Soft Contact Ground Shadow
      const shadowW = worldWidth * (def.footprint.w * 0.95);
      const shadowH = Math.max(0.4, worldHeight * (def.footprint.h * 0.35));
      const shadowGeo = new THREE.PlaneGeometry(shadowW, shadowH);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x070c17,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(
        (def.footprint.x + def.footprint.w / 2 - 0.5) * worldWidth,
        0.015,
        0
      );
      group.add(shadow);

      // Position group at world coordinates
      group.position.set(placement.x, groundY, placement.z);
      group.renderOrder = 1000 - Math.round(placement.z * 10);

      this.scene.add(group);
      this.sceneryMeshes.set(placement.id, group);

      // 3. Compute Solid Footprint Collider in World Space
      // Base contact depth along Z
      let depthZ = 0.5;
      if (placement.type === 'cone_transito') depthZ = 0.45;
      else if (placement.type === 'banco_madeira') depthZ = 0.85;
      else if (placement.type === 'paragem_taxi_placa') depthZ = 0.45;
      else if (placement.type === 'barraca_agua_fresca') depthZ = 1.25;
      else if (placement.type === 'arvore') depthZ = 0.65;
      else if (placement.type === 'abrigo_paragem') depthZ = 1.55;

      const colCenterX = placement.x + (def.footprint.x + def.footprint.w / 2 - 0.5) * worldWidth;
      const colWidth = Math.max(0.4, def.footprint.w * worldWidth);
      const colMinX = colCenterX - colWidth / 2;
      const colMaxX = colCenterX + colWidth / 2;
      const colMinZ = placement.z - depthZ / 2;
      const colMaxZ = placement.z + depthZ / 2;

      this.colliders.push({
        id: placement.id,
        type: placement.type,
        minX: colMinX,
        maxX: colMaxX,
        minZ: colMinZ,
        maxZ: colMaxZ,
        centerX: colCenterX,
        centerZ: placement.z,
        width: colWidth,
        depth: depthZ,
      });
    });

    if (this.debugVisible) {
      this.rebuildDebugVisualizer();
    }
  }

  /**
   * Resolves axial sliding collision against all scenery obstacle footings.
   * If an entity (player, rival, or passenger) penetrates a footprint collider,
   * it pushes the position out along the shallowest penetration axis, allowing smooth sliding.
   */
  public resolveSlidingCollision(
    pos: { x: number; z: number },
    radius: number = 0.4
  ): { collided: boolean; obstacleId?: string } {
    let hasCollided = false;
    let hitId: string | undefined;

    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      const boxMinX = col.minX - radius;
      const boxMaxX = col.maxX + radius;
      const boxMinZ = col.minZ - radius;
      const boxMaxZ = col.maxZ + radius;

      if (pos.x > boxMinX && pos.x < boxMaxX && pos.z > boxMinZ && pos.z < boxMaxZ) {
        hasCollided = true;
        hitId = col.id;

        const overlapLeft = pos.x - boxMinX;
        const overlapRight = boxMaxX - pos.x;
        const overlapBack = pos.z - boxMinZ;
        const overlapFront = boxMaxZ - pos.z;

        const minXOverlap = Math.min(overlapLeft, overlapRight);
        const minZOverlap = Math.min(overlapBack, overlapFront);

        if (minXOverlap < minZOverlap) {
          pos.x = overlapLeft < overlapRight ? boxMinX : boxMaxX;
        } else {
          pos.z = overlapBack < overlapFront ? boxMinZ : boxMaxZ;
        }
      }
    }

    return { collided: hasCollided, obstacleId: hitId };
  }

  /**
   * AI Rival Obstacle Avoidance: Checks if an intended movement trajectory would
   * penetrate a collider within a lookahead distance, and steers tangentially.
   */
  public steerAroundObstacles(
    pos: { x: number; z: number },
    vel: { x: number; z: number },
    lookahead: number = 0.8
  ): { x: number; z: number } {
    const speed = Math.hypot(vel.x, vel.z);
    if (speed < 0.1) return vel;

    const futureX = pos.x + (vel.x / speed) * lookahead;
    const futureZ = pos.z + (vel.z / speed) * lookahead;

    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      const margin = 0.55;
      if (
        futureX > col.minX - margin &&
        futureX < col.maxX + margin &&
        futureZ > col.minZ - margin &&
        futureZ < col.maxZ + margin
      ) {
        // Steer perpendicular to avoid obstacle
        const toColX = col.centerX - pos.x;
        const toColZ = col.centerZ - pos.z;
        // Cross product determines left vs right avoidance
        const cross = vel.x * toColZ - vel.z * toColX;
        const sign = cross >= 0 ? -1 : 1;
        // Perpendicular vector
        const steerX = -vel.z * sign;
        const steerZ = vel.x * sign;
        return {
          x: vel.x * 0.4 + steerX * 0.7,
          z: vel.z * 0.4 + steerZ * 0.7,
        };
      }
    }

    return vel;
  }

  /**
   * Verifies that a spawn coordinate is safely away from any solid obstacle footprint.
   * Enforces clearance >= margin (default 2.5 units, ensuring >= 1.5x player height).
   */
  public isClearForSpawn(x: number, z: number, margin: number = 2.5): boolean {
    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      if (
        x >= col.minX - margin &&
        x <= col.maxX + margin &&
        z >= col.minZ - margin &&
        z <= col.maxZ + margin
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Updates Y-sorting depth renderOrder for all scenery objects
   */
  public updateDepthSorting() {
    this.sceneryMeshes.forEach((mesh) => {
      mesh.renderOrder = 1000 - Math.round(mesh.position.z * 10);
    });
  }

  /**
   * Toggles DEV Diagnostic Footprint Colliders wireframe overlay
   */
  public setDebugColliders(enabled: boolean) {
    this.debugVisible = enabled;
    if (!enabled) {
      if (this.debugGroup) {
        this.scene.remove(this.debugGroup);
        this.debugGroup = null;
      }
    } else {
      this.rebuildDebugVisualizer();
    }
  }

  public isDebugCollidersVisible(): boolean {
    return this.debugVisible;
  }

  private rebuildDebugVisualizer() {
    if (this.debugGroup) {
      this.scene.remove(this.debugGroup);
      this.debugGroup = null;
    }

    const group = new THREE.Group();
    group.name = 'sceneryCollidersDebugGroup';

    this.colliders.forEach((col) => {
      const width = col.maxX - col.minX;
      const depth = col.maxZ - col.minZ;
      const centerX = (col.minX + col.maxX) / 2;
      const centerZ = (col.minZ + col.maxZ) / 2;

      // Semi-transparent box showing solid footprint on ground
      const boxGeo = new THREE.BoxGeometry(width, 0.4, depth);
      const boxMat = new THREE.MeshBasicMaterial({
        color: 0x00e676,
        transparent: true,
        opacity: 0.45,
        wireframe: false,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(centerX, 0.6, centerZ);
      group.add(box);

      // Wireframe border outline
      const edges = new THREE.EdgesGeometry(boxGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xfe6b00, linewidth: 2 })
      );
      line.position.copy(box.position);
      group.add(line);
    });

    this.scene.add(group);
    this.debugGroup = group;
  }

  public getColliders(): SceneryCollider[] {
    return this.colliders;
  }

  public clear() {
    if (this.debugGroup) {
      this.scene.remove(this.debugGroup);
      this.debugGroup = null;
    }
    this.sceneryMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.sceneryMeshes.clear();
    this.colliders = [];
  }
}
