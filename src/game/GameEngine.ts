/**
 * LOTADOR 3D Game Engine (Three.js Low-Poly Arcade)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import hiaceVanGlbUrl from '../assets/images/hiace_van.glb?url';
import { 
  Passenger, 
  Taxi, 
  NPCLotador, 
  RouteType, 
  PassengerType, 
  TaxiType, 
  PlayerStats,
  FloatingText,
  UrbanObstacle,
  PassengerDispute
} from '../types/game';
import { soundManager } from '../utils/audio';
import { spriteAtlasManager } from '../utils/spriteAtlas';
import { CAMPAIGN_ZONES } from '../utils/storage';
import { BuildingManager } from './BuildingManager';

export interface GameEngineCallbacks {
  onScoreUpdate: (kz: number, xp: number, combo: number) => void;
  onTaxiLoaded: (taxi: Taxi, reward: number, xp: number) => void;
  onFloatingText: (text: string, color: string, pos: { x: number; y: number; z: number }) => void;
  onRushHourState: (isRush: boolean) => void;
  onStaminaChange: (current: number, max: number) => void;
  onPassengerServedCount: (count: number) => void;
  onDisputeUpdate?: (dispute: PassengerDispute | null) => void;
  onPlayerMove?: (distanceTotal: number) => void;
  onPassengerFollowed?: (p: Passenger) => void;
  onPassengerBoarded?: (p: Passenger, taxi: Taxi) => void;
  onPlayerRunStart?: () => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // 3D Taxi Model Cache (Toyota HiAce GLB)
  private static cachedTaxiModel: THREE.Group | null = null;
  private static taxiModelLoadingPromise: Promise<THREE.Group> | null = null;

  /**
   * Loads and caches the real Toyota HiAce GLB model with PBR materials,
   * SRGB textures, shadows, and correct proportions for the LOTADOR world.
   */
  public static preloadTaxiModel(): Promise<THREE.Group> {
    if (GameEngine.cachedTaxiModel) {
      return Promise.resolve(GameEngine.cachedTaxiModel);
    }
    if (GameEngine.taxiModelLoadingPromise) {
      return GameEngine.taxiModelLoadingPromise;
    }

    GameEngine.taxiModelLoadingPromise = new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        hiaceVanGlbUrl,
        (gltf) => {
          const root = gltf.scene;

          // Configure shadows and ensure SRGB texture colorSpace
          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                mats.forEach((mat) => {
                  if ('map' in mat && mat.map) {
                    (mat.map as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
                    (mat.map as THREE.Texture).needsUpdate = true;
                  }
                  if ('emissiveMap' in mat && mat.emissiveMap) {
                    (mat.emissiveMap as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
                    (mat.emissiveMap as THREE.Texture).needsUpdate = true;
                  }
                  // Apply authentic Luanda Candongueiro blue body paint to carpaint meshes once
                  if (mat.name === 'carpaint' && 'color' in mat) {
                    const stdMat = mat as THREE.MeshStandardMaterial;
                    stdMat.color.setHex(0x006dae); // Iconic Luanda Candongueiro Blue
                    stdMat.roughness = 0.35;
                    stdMat.metalness = 0.25;
                  }
                });
              }
            }
          });

          // Raw GLB model dimensions:
          // Width: 215.7cm, Height: 192.8cm, Length: 473.5cm.
          // Front faces +Z, rear faces -Z. Lowest tire point is at y = 0.
          //
          // Scale 0.0115:
          // - Height: 2.22 units (proportionate to player at 2.8 and passengers at 2.2)
          // - Length: 5.44 units (fits 9-unit road slots with ~3.5 units spacing)
          // - Width: 2.48 units (fits road lane)
          const scale = 0.0115;
          root.scale.set(scale, scale, scale);

          // Rotate by -Math.PI / 2 (-90 deg) around Y so that:
          // +Z (front) turns to -X (facing left, matching the road traffic direction).
          // Right passenger sliding door faces +Z (towards sidewalk & boarding passengers).
          root.rotation.y = -Math.PI / 2;

          // Wheels rest directly on road level (y = 0)
          root.position.set(0, 0, 0);

          GameEngine.cachedTaxiModel = root;
          resolve(root);
        },
        undefined,
        (error) => {
          console.error('Failed to load hiace_van.glb:', error);
          reject(error);
        }
      );
    });

    return GameEngine.taxiModelLoadingPromise;
  }

  /**
   * Preloads all critical game assets (3D GLB model, sprite atlases, and core textures)
   * so that everything is decoded and ready before rendering frame 0.
   * Reports progress (0 to 100%) via onProgress callback.
   */
  public static async preloadAllAssets(onProgress?: (percent: number) => void): Promise<void> {
    onProgress?.(15);

    // If both assets are already loaded in memory, report 100% immediately
    if (GameEngine.cachedTaxiModel && spriteAtlasManager.isLoaded()) {
      onProgress?.(100);
      return;
    }

    let loadedCount = 0;
    const totalSteps = 2;

    const stepDone = () => {
      loadedCount++;
      const pct = Math.min(90, Math.round(15 + (loadedCount / totalSteps) * 75));
      onProgress?.(pct);
    };

    const modelPromise = GameEngine.preloadTaxiModel()
      .then(() => stepDone())
      .catch((err) => {
        console.warn('[AssetPreloader] Warning loading HiAce 3D model:', err);
        stepDone();
      });

    const atlasPromise = spriteAtlasManager.waitUntilLoaded()
      .then(() => stepDone())
      .catch((err) => {
        console.warn('[AssetPreloader] Warning loading sprite atlas:', err);
        stepDone();
      });

    await Promise.all([modelPromise, atlasPromise]);

    // Warm up core sprite textures in memory so they are instantly ready on frame 0
    try {
      const coreSprites = [
        'player_front_idle_0',
        'player_back_idle_0',
        'player_left_idle_0',
        'player_right_idle_0',
        'passenger_m1',
        'passenger_f1',
        'passenger_elder',
        'passenger_student',
        'candongueiro_full',
        'kwanza_note'
      ];
      for (const k of coreSprites) {
        spriteAtlasManager.getTexture(k);
      }
    } catch {}

    onProgress?.(100);
  }

  // Player State
  public playerPos = new THREE.Vector3(0, 0.6, 2);
  public playerRotation = 0;
  public playerSpeed = 8;
  public isRunning = false;
  public stamina = 100;
  public maxStamina = 100;
  private staminaRecoveryRate = 20;
  private staminaDrainRate = 35;
  public playerStats: PlayerStats;
  public isTutorial = false;
  public playerMovedDistance = 0;
  public tutorialPassengerId: string | null = null;
  
  // Game Collections
  public passengers: Passenger[] = [];
  public taxis: Taxi[] = [];
  public npcs: NPCLotador[] = [];
  public urbanObstacles: UrbanObstacle[] = [];
  public activeDispute: PassengerDispute | null = null;
  public playerStumbleTimer = 0;
  
  // Meshes
  private playerMesh!: THREE.Group;
  private playerRingMesh!: THREE.Mesh;
  private playerDirArrowGroup!: THREE.Group;
  private playerDirArrowMesh!: THREE.Mesh;
  private passengerMeshes: Map<string, THREE.Group> = new Map();
  private taxiMeshes: Map<string, THREE.Group> = new Map();
  private npcMeshes: Map<string, THREE.Group> = new Map();
  private obstacleMeshes: Map<string, THREE.Group> = new Map();

  // Match State
  public combo = 1;
  public comboTimer = 0;
  public matchKz = 0;
  public matchXp = 0;
  public taxisLoadedCount = 0;
  public passengersServedCount = 0;
  public isRushHour = false;
  private _isPaused = false;

  public get isPaused(): boolean {
    return this._isPaused;
  }

  public set isPaused(val: boolean) {
    if (this._isPaused === val) return;
    this._isPaused = val;
    if (val) {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      // Render one single frozen snapshot frame
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    } else {
      if (this.animationFrameId === null) {
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    }
  }

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Input state
  public inputDir = { x: 0, z: 0 };
  public isCalling = false;
  private callRadiusMesh!: THREE.Mesh;
  private callPulseTimer = 0;

  // Taxi Slots
  private taxiSlots = [
    { x: -9, z: -4, occupied: false, taxiId: null as string | null },
    { x: 0, z: -4, occupied: false, taxiId: null as string | null },
    { x: 9, z: -4, occupied: false, taxiId: null as string | null },
  ];

  // Spawn Timers
  private passengerSpawnTimer = 0;
  private taxiSpawnTimer = 0;

  // Animation state tracking
  private playerVel = { x: 0, z: 0 };
  private playerAnimDistance = 0;
  private playerAnimFrameTimer = 0;
  private playerAnimFrameIndex = 0;
  private playerFacingDir: 'front' | 'back' | 'left' | 'right' = 'front';
  private playerFacingLeft = false;
  private prevPlayerFacingLeft = false;
  private prevPlayerAnimStep = 0;
  private playerTurnTilt = 0;
  private playerSkidTimer = 0;
  private wasInputMoving = false;
  private idleBreathTimer = 0;
  private campaignZoneMultiplier = 1.0;

  // Particle System with Zero-GC Object Pooling
  private dustGeo = new THREE.CircleGeometry(1, 8);
  private dustMat = new THREE.MeshBasicMaterial({
    color: 0xe8dfc8,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  private dustMeshPool: THREE.Mesh[] = [];
  private spriteParticlePool: THREE.Sprite[] = [];
  private passengerMeshPool: THREE.Group[] = [];

  // Performance caches & Callback throttling
  private playerSprite: THREE.Sprite | null = null;
  private playerShadow: THREE.Mesh | null = null;
  private lastPlayerFrameKey: string = '';
  private lastReportedStamina: number = 100;
  private lastStaminaReportTime: number = 0;
  private lastMoveReportDist: number = 0;
  private wasRunningLastFrame: boolean = false;
  private lastDustSpawnTime: number = 0;

  // Telemetry, Performance & Auto-Quality
  public currentFps: number = 60;
  public graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private lowFpsStreak: number = 0;
  private dirLight!: THREE.DirectionalLight;

  private particles: {
    sprite: THREE.Sprite | THREE.Mesh;
    isDust?: boolean;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    scaleStart: number;
    scaleEnd: number;
  }[] = [];

  constructor(
    container: HTMLElement, 
    playerStats: PlayerStats, 
    callbacks: GameEngineCallbacks,
    options?: { isTutorial?: boolean }
  ) {
    this.container = container;
    this.playerStats = playerStats;
    this.callbacks = callbacks;
    this.isTutorial = !!options?.isTutorial;

    // Apply Campaign Zone Multiplier
    const selectedZone = CAMPAIGN_ZONES.find((z) => z.id === playerStats.selectedMapId);
    this.campaignZoneMultiplier = selectedZone ? selectedZone.bonusKzMultiplier : 1.0;

    // Apply Upgrades to Player
    this.playerSpeed = 7.5 + playerStats.upgradeSpeed * 0.6;
    this.maxStamina = 100 + playerStats.upgradeStamina * 15;
    this.stamina = this.maxStamina;

    this.initThree();
    this.buildMap();
    this.initPlayer();
    this.initNPCs();
    this.initObstacles();
    this.spawnInitialEntities();

    // Preload real 3D Toyota HiAce model
    GameEngine.preloadTaxiModel().catch(() => {});

    window.addEventListener('resize', this.onWindowResize);
    this.animate(0);
  }

  // Spawns dust cloud particle at ground level using object pooling
  public spawnDustParticle(x: number, y: number, z: number, scale = 0.4) {
    const now = performance.now();
    if (now - this.lastDustSpawnTime < 75) return; // at most ~13 dust particles per sec
    if (this.particles.length >= 25) return; // cap simultaneous active particles
    this.lastDustSpawnTime = now;

    let mesh = this.dustMeshPool.pop();
    if (!mesh) {
      mesh = new THREE.Mesh(this.dustGeo, this.dustMat.clone());
      mesh.rotation.x = Math.PI / 2;
      this.scene.add(mesh);
    }
    mesh.visible = true;
    mesh.position.set(x + (Math.random() - 0.5) * 0.2, y + 0.02, z + (Math.random() - 0.5) * 0.2);
    mesh.scale.set(scale, scale, 1);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.55;

    this.particles.push({
      sprite: mesh,
      isDust: true,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.25, (Math.random() - 0.5) * 0.5),
      life: 0.35,
      maxLife: 0.35,
      scaleStart: scale,
      scaleEnd: scale * 1.7,
    });
  }

  // Spawns visual feedback sprite particle from atlas using object pooling
  public spawnSpriteParticle(
    frameName: string, 
    pos: THREE.Vector3 | { x: number; y: number; z: number }, 
    scale = 1.6, 
    velocityY = 2.2
  ) {
    const tex = spriteAtlasManager.getTexture(frameName);
    let sprite = this.spriteParticlePool.pop();
    if (!sprite) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.05, depthWrite: false });
      sprite = new THREE.Sprite(mat);
      sprite.renderOrder = 3000;
      this.scene.add(sprite);
    } else {
      sprite.material.map = tex;
      sprite.material.needsUpdate = true;
      sprite.visible = true;
    }
    sprite.position.set(pos.x, (pos.y || 0.6) + 1.2, pos.z);
    sprite.scale.set(scale, scale, 1);
    (sprite.material as THREE.SpriteMaterial).opacity = 1.0;

    this.particles.push({
      sprite,
      isDust: false,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 1.2, velocityY, (Math.random() - 0.5) * 1.2),
      life: 1.0,
      maxLife: 1.0,
      scaleStart: scale,
      scaleEnd: scale * 1.3,
    });
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        p.sprite.visible = false;
        if (p.isDust) {
          this.dustMeshPool.push(p.sprite as THREE.Mesh);
        } else {
          this.spriteParticlePool.push(p.sprite as THREE.Sprite);
        }
        const lastIdx = this.particles.length - 1;
        if (i !== lastIdx) {
          this.particles[i] = this.particles[lastIdx];
        }
        this.particles.pop();
        continue;
      }

      const t = 1 - p.life / p.maxLife;
      p.sprite.position.x += p.velocity.x * delta;
      p.sprite.position.y += p.velocity.y * delta;
      p.sprite.position.z += p.velocity.z * delta;

      const currentScale = p.scaleStart + (p.scaleEnd - p.scaleStart) * t;
      p.sprite.scale.set(currentScale, currentScale, 1);
      (p.sprite.material as THREE.SpriteMaterial | THREE.MeshBasicMaterial).opacity = Math.max(0, (p.life / p.maxLife) * (p.isDust ? 0.55 : 1.0));
    }
  }

  // Dynamic Depth Sorting
  private updateDepthSorting() {
    if (this.playerMesh) {
      this.playerMesh.renderOrder = 1000 - Math.round(this.playerPos.z * 10);
    }
    this.passengerMeshes.forEach((mesh) => {
      mesh.renderOrder = 1000 - Math.round(mesh.position.z * 10);
    });
    this.npcMeshes.forEach((mesh) => {
      mesh.renderOrder = 1000 - Math.round(mesh.position.z * 10);
    });
    this.obstacleMeshes.forEach((mesh) => {
      mesh.renderOrder = 1000 - Math.round(mesh.position.z * 10);
    });
    this.taxiMeshes.forEach((mesh) => {
      mesh.renderOrder = 1000 - Math.round(mesh.position.z * 10);
    });
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdde2f3); // Soft sky light blue
    this.scene.fog = new THREE.FogExp2(0xdde2f3, 0.015);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 16, -16);
    this.camera.lookAt(0, 0.8, 2);

    // Adaptive Resolution & Quality Scaling
    let quality: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    try {
      const raw = localStorage.getItem('LOTADOR_SETTINGS_V1');
      if (raw) {
        const parsed = JSON.parse(raw).graphicsQuality;
        if (parsed === 'HIGH' || parsed === 'MEDIUM' || parsed === 'LOW') {
          quality = parsed;
        }
      }
    } catch {}

    // Synchronize internal graphics quality field with loaded user settings
    this.graphicsQuality = quality;

    // Antialiasing only turns on in HIGH quality to maximize framerate on mobile GPUs
    const useAntialias = quality === 'HIGH';

    this.renderer = new THREE.WebGLRenderer({ antialias: useAntialias, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    const baseDpr = window.devicePixelRatio || 1;
    const targetDpr = quality === 'LOW' ? 1.0 : quality === 'HIGH' ? Math.min(baseDpr, 1.75) : Math.min(baseDpr, 1.25);
    this.renderer.setPixelRatio(targetDpr);

    if (quality === 'LOW') {
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'MEDIUM') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Clear container and append
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444d66, 0.45);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(15, 25, -15);
    this.dirLight = dirLight;
    
    if (quality === 'LOW') {
      dirLight.castShadow = false;
    } else {
      dirLight.castShadow = true;
      const shadowRes = quality === 'HIGH' ? 1024 : 512;
      dirLight.shadow.mapSize.width = shadowRes;
      dirLight.shadow.mapSize.height = shadowRes;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 100;
      dirLight.shadow.camera.left = -25;
      dirLight.shadow.camera.right = 25;
      dirLight.shadow.camera.top = 25;
      dirLight.shadow.camera.bottom = -25;
    }
    this.scene.add(dirLight);
  }

  private buildMap() {
    // 1. Main Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(90, 10);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x353a45 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -4);
    road.receiveShadow = true;
    this.scene.add(road);

    // Road Stripes
    for (let x = -44; x <= 44; x += 4) {
      const stripeGeo = new THREE.PlaneGeometry(2, 0.3);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.01, -4);
      this.scene.add(stripe);
    }

    // Zebra Crosswalk
    for (let z = -8; z <= 0; z += 1.2) {
      const zebraGeo = new THREE.PlaneGeometry(0.8, 4);
      const zebraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const zebra = new THREE.Mesh(zebraGeo, zebraMat);
      zebra.rotation.x = -Math.PI / 2;
      zebra.position.set(-15, 0.015, z);
      this.scene.add(zebra);
    }

    // 2. Sidewalk (Paragem Area where passengers gather)
    const sidewalkGeo = new THREE.BoxGeometry(90, 0.4, 18);
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f9 });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(0, 0.2, 5);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    // Curb edge yellow line
    const curbGeo = new THREE.BoxGeometry(90, 0.42, 0.3);
    const curbMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.21, -2.85);
    this.scene.add(curb);

    // 3. Establishments & Buildings (Detailed Angolan Urban Architecture)
    // Central Commercial Strip behind sidewalk (z = 12)
    const backgroundBuildings = BuildingManager.generateCityBackground(-28, 28, 7.6, 12);
    backgroundBuildings.forEach((bGroup) => {
      this.scene.add(bGroup);
    });

    // Lateral Wings & Side Streets (x < -28 and x > 28)
    const lateralBuildings = BuildingManager.generateLateralStreets();
    lateralBuildings.forEach((bGroup) => {
      this.scene.add(bGroup);
    });

    // Distant City Skyline (z = 20) with residential buildings, tin roofs, and water tanks
    const distantSkyline = BuildingManager.generateDistantSkyline();
    this.scene.add(distantSkyline);

    // Street life props: lamps, trash bins, Luanda road signs, Multicaixa ATM, market stalls
    const urbanProps = BuildingManager.generateUrbanProps();
    urbanProps.forEach((prop) => {
      this.scene.add(prop);
    });

    // 4. Paragem Signs & Benches
    this.createParagemSign(-12, 0.4, 1);
    this.createParagemSign(0, 0.4, 1);
    this.createParagemSign(12, 0.4, 1);

    // Benches & Trees
    for (let x = -20; x <= 20; x += 10) {
      if (x !== 0) {
        this.createBench(x, 0.4, 7);
        this.createTree(x + 4, 0.4, 9);
      }
    }
  }

  private createParagemSign(x: number, y: number, z: number) {
    const group = new THREE.Group();

    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2);
    const postMat = new THREE.MeshLambertMaterial({ color: 0x705d00 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 1.6;
    post.castShadow = true;
    group.add(post);

    // Paragem / Bus Stop Sprite from Atlas
    const tex = spriteAtlasManager.getTexture('object_bus_stop_1');
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 2.3, 1);
    sprite.position.set(0, 2.5, 0.1);
    group.add(sprite);

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  private createBench(x: number, y: number, z: number) {
    const group = new THREE.Group();

    const benchGeo = new THREE.BoxGeometry(2.2, 0.4, 0.8);
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x572000 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.y = 0.2;
    bench.castShadow = true;
    group.add(bench);

    // Stall / Market bench accent from atlas if available
    const tex = spriteAtlasManager.getTexture('object_stall');
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 1.4, 1);
    sprite.position.set(0, 0.9, 0);
    group.add(sprite);

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  private createTree(x: number, y: number, z: number) {
    const group = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 2.0);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x572000 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.0;
    trunk.castShadow = true;
    group.add(trunk);

    // Real Tree Sprite from Atlas
    const tex = spriteAtlasManager.getTexture('object_tree_large');
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 4.0, 1);
    sprite.position.set(0, 2.8, 0);
    group.add(sprite);

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  private initPlayer() {
    this.playerMesh = this.createStylizedCharacter(0xffd700, 0x006399, true, 'player_front_idle_0');
    this.playerMesh.position.copy(this.playerPos);
    this.scene.add(this.playerMesh);

    this.playerSprite = (this.playerMesh.userData.sprite || this.playerMesh.children.find((c) => c instanceof THREE.Sprite)) as THREE.Sprite;
    this.playerShadow = (this.playerMesh.userData.shadow || this.playerMesh.children.find((c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CircleGeometry)) as THREE.Mesh;
    this.lastPlayerFrameKey = 'player_front_idle_0';
    this.lastReportedStamina = this.stamina;

    // Player position ring under feet
    const ringGeo = new THREE.RingGeometry(0.6, 0.75, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    this.playerRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.playerRingMesh.rotation.x = Math.PI / 2;
    this.playerRingMesh.position.set(0, 0.42, 0);
    this.scene.add(this.playerRingMesh);

    // Directional chevron indicator (activates during movement to make world orientation obvious)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.95);
    arrowShape.lineTo(0.24, 0.65);
    arrowShape.lineTo(0.10, 0.70);
    arrowShape.lineTo(0.10, 0.45);
    arrowShape.lineTo(-0.10, 0.45);
    arrowShape.lineTo(-0.10, 0.70);
    arrowShape.lineTo(-0.24, 0.65);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0xfe6b00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.playerDirArrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    this.playerDirArrowMesh.rotation.x = -Math.PI / 2; // Flat on ground, pointing +Z
    this.playerDirArrowGroup = new THREE.Group();
    this.playerDirArrowGroup.position.set(0, 0.425, 0);
    this.playerDirArrowGroup.add(this.playerDirArrowMesh);
    this.scene.add(this.playerDirArrowGroup);

    // Call Voice Radius Circle (shows when pressing CHAMAR)
    const callGeo = new THREE.RingGeometry(0.1, 5.0, 32);
    const callMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0 });
    this.callRadiusMesh = new THREE.Mesh(callGeo, callMat);
    this.callRadiusMesh.rotation.x = Math.PI / 2;
    this.callRadiusMesh.position.set(0, 0.43, 0);
    this.scene.add(this.callRadiusMesh);
  }

  private initNPCs() {
    if (this.isTutorial) {
      // In tutorial, don't spawn rival lotadores so they don't harass or steal the player's passenger
      return;
    }
    const npcDefs = [
      { id: 'kito', name: 'Kito', nickname: 'Relâmpago', spriteKey: 'npc_kito', color: 0xba1a1a, pants: 0x161c28, pos: new THREE.Vector3(-6, 0.6, 6) },
      { id: 'manuel', name: 'Manuel', nickname: 'Veterano', spriteKey: 'npc_manuel', color: 0x2e7d32, pants: 0x572000, pos: new THREE.Vector3(6, 0.6, 6) },
    ];

    npcDefs.forEach((def) => {
      const npcMesh = this.createStylizedCharacter(def.color, def.pants, false, def.spriteKey);
      npcMesh.position.copy(def.pos);
      this.scene.add(npcMesh);
      this.npcMeshes.set(def.id, npcMesh);

      this.npcs.push({
        id: def.id,
        name: def.name,
        nickname: def.nickname,
        specialty: def.id === 'kito' ? 'VELOCIDADE' : 'ESTRATEGIA',
        speed: def.id === 'kito' ? 7.2 : 6.0,
        persuasion: 0.8,
        voiceRange: 4.5,
        position: { x: def.pos.x, y: def.pos.y, z: def.pos.z },
        targetPassengerId: null,
        followingPassengerId: null,
        color: '#' + def.color.toString(16),
        shirtColor: '#' + def.color.toString(16),
        state: 'IDLE',
        passengersLoaded: 0,
      });
    });
  }

  private initObstacles() {
    if (this.isTutorial) {
      // In tutorial, disable moving obstacles so new players aren't tripped
      return;
    }
    const obstacleDefs: {
      id: string;
      name: string;
      type: 'ZUNGUEIRA' | 'FISCAL';
      spriteKey: string;
      speed: number;
      patrol: { x: number; z: number }[];
    }[] = [
      {
        id: 'zungueira_1',
        name: 'Dona Maria (Zungueira)',
        type: 'ZUNGUEIRA',
        spriteKey: 'obstacle_zungueira',
        speed: 2.2,
        patrol: [
          { x: -22, z: 4.8 },
          { x: 22, z: 5.2 },
        ],
      },
      {
        id: 'zungueira_2',
        name: 'Mamã Rosa (Ambulante)',
        type: 'ZUNGUEIRA',
        spriteKey: 'obstacle_zungueira',
        speed: 2.5,
        patrol: [
          { x: 18, z: 7.2 },
          { x: -18, z: 6.6 },
        ],
      },
      {
        id: 'fiscal_1',
        name: 'Fiscal João',
        type: 'FISCAL',
        spriteKey: 'obstacle_fiscal',
        speed: 3.2,
        patrol: [
          { x: -16, z: 1.0 },
          { x: 16, z: 1.0 },
        ],
      },
    ];

    obstacleDefs.forEach((def) => {
      const mesh = this.createStylizedCharacter(0, 0, false, def.spriteKey);
      mesh.position.set(def.patrol[0].x, 0.6, def.patrol[0].z);
      this.scene.add(mesh);
      this.obstacleMeshes.set(def.id, mesh);

      this.urbanObstacles.push({
        id: def.id,
        type: def.type,
        name: def.name,
        position: { x: def.patrol[0].x, y: 0.6, z: def.patrol[0].z },
        targetPos: { x: def.patrol[1].x, z: def.patrol[1].z },
        patrolPoints: def.patrol,
        currentPatrolIdx: 1,
        speed: def.speed,
        facingLeft: false,
        animDistance: 0,
        whistleCooldown: 0,
        speechTimer: 0,
      });
    });
  }

  private createStylizedCharacter(
    shirtColor: number, 
    pantsColor: number, 
    isPlayer: boolean,
    spriteFrameName?: string
  ): THREE.Group {
    const group = new THREE.Group();

    // 2D Billboard Sprite using real Atlas Frame
    const frameKey = spriteFrameName || (isPlayer ? 'player_front_idle_0' : 'passenger_normal');
    const tex = spriteAtlasManager.getTexture(frameKey);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    const sprite = new THREE.Sprite(spriteMat);
    // Player uses larger scale for the new taller CÁÇA art. Scale proportionally
    // to the frame's real aspect ratio so the character never looks
    // squashed/stretched/cropped (this player's frames vary in width).
    if (isPlayer) {
      const { width: fw, height: fh } = spriteAtlasManager.getFrameSize(frameKey);
      const worldHeight = 2.8;
      const aspect = fh > 0 ? fw / fh : 0.4;
      sprite.scale.set(worldHeight * aspect, worldHeight, 1);
    } else if (spriteFrameName?.startsWith('obstacle_')) {
      sprite.scale.set(1.6, 2.4, 1);
    } else {
      sprite.scale.set(1.4, 2.2, 1);
    }
    sprite.position.y = isPlayer ? 1.35 : 1.1;
    group.add(sprite);

    if (isPlayer) {
      // Subtle directional billboard indicator accent (activates during movement)
      const indGeo = new THREE.PlaneGeometry(0.5, 0.08);
      const indMat = new THREE.MeshBasicMaterial({
        color: 0xfe6b00,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const billboardIndicator = new THREE.Mesh(indGeo, indMat);
      billboardIndicator.name = 'playerBillboardIndicator';
      billboardIndicator.position.set(0, 0.1, 0.05);
      group.add(billboardIndicator);
    }

    // Subtle base shadow
    const shadowGeo = new THREE.CircleGeometry(0.45, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    group.userData = {
      sprite,
      shadow,
      currentFrameKey: frameKey,
    };

    return group;
  }

  private spawnInitialEntities() {
    if (this.isTutorial) {
      // Spawn 1 Taxi directly at slot 0 with route VIANA
      this.spawnTaxi('VIANA');

      // Spawn 1 designated tutorial passenger in front of player
      this.spawnTutorialPassenger();

      // Spawn 2 extra ambient waiting passengers
      this.spawnPassenger();
      this.spawnPassenger();
      return;
    }

    // Spawn initial Taxis
    this.spawnTaxi('VIANA');
    this.spawnTaxi('TALATONA');

    // Spawn initial Passengers
    for (let i = 0; i < 6; i++) {
      this.spawnPassenger();
    }
  }

  public spawnTutorialPassenger(): Passenger {
    const id = 'tutorial_passenger';
    this.tutorialPassengerId = id;
    const startX = 2.0;
    const startZ = 4.2;

    const passenger: Passenger = {
      id,
      name: 'Passageiro de Viana',
      type: 'NORMAL',
      destination: 'VIANA',
      value: 150,
      urgency: 1,
      patience: 300, // Very generous patience for tutorial
      maxPatience: 300,
      speed: 4.5,
      state: 'WAITING',
      position: { x: startX, y: 0.6, z: startZ },
      targetPos: { x: startX, y: 0.6, z: startZ },
      followedBy: null,
      assignedTaxiId: null,
      color: '#ffd700',
      gender: 'M',
      animFrame: 0,
      animTimer: 0,
    };

    this.passengers.push(passenger);
    const pMesh = this.createStylizedCharacter(0x006399, 0x161c28, false, 'passenger_normal');
    pMesh.position.set(startX, 0.6, startZ);
    this.scene.add(pMesh);
    this.passengerMeshes.set(id, pMesh);
    this.spawnSpriteParticle('effect_passenger_ok', passenger.position, 1.4, 2.0);

    return passenger;
  }

  // 3D world position to 2D screen coordinate projection for tutorial pointers
  public toScreenPosition(pos: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    if (!this.camera || !this.container) return { x: 0, y: 0, visible: false };
    const v = new THREE.Vector3(pos.x, (pos.y || 0.6) + 1.2, pos.z);
    v.project(this.camera);
    const isBehind = v.z > 1;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const x = (v.x * 0.5 + 0.5) * width;
    const y = (-v.y * 0.5 + 0.5) * height;
    return {
      x,
      y,
      visible: !isBehind && x >= 0 && x <= width && y >= 0 && y <= height,
    };
  }

  public spawnTaxi(forcedRoute?: RouteType) {
    const emptySlotIndex = this.taxiSlots.findIndex((s) => !s.occupied);
    if (emptySlotIndex === -1) return;

    const routes: RouteType[] = ['VIANA', 'TALATONA', 'CENTRO'];
    const route = forcedRoute || routes[Math.floor(Math.random() * routes.length)];
    const id = 'taxi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    const slot = this.taxiSlots[emptySlotIndex];
    slot.occupied = true;
    slot.taxiId = id;

    const taxi: Taxi = {
      id,
      type: 'NORMAL',
      route,
      capacity: 4,
      currentPassengers: 0,
      maxWaitTime: 90,
      remainingWaitTime: 90,
      baseReward: 120,
      state: 'ARRIVING',
      position: { x: slot.x + 20, y: 0.0, z: slot.z }, // Starts offscreen right, wheels on road level (y=0)
      stopSlot: emptySlotIndex,
      color: '#ffd700',
    };

    this.taxis.push(taxi);

    // Create 3D Mesh for Taxi Van (Toyota HiAce GLB with roof route sign)
    const vanMesh = this.createTaxiVanMesh(route);
    vanMesh.position.set(taxi.position.x, taxi.position.y, taxi.position.z);
    this.scene.add(vanMesh);
    this.taxiMeshes.set(id, vanMesh);

    soundManager.playHorn();
  }

  /**
   * Creates the 3D Taxi Van for LOTADOR:
   * Uses the authentic Toyota HiAce GLB model with PBR materials,
   * Luanda Candongueiro livery (sky blue carpaint), wheels resting at ground level,
   * and an illuminated destination sign board mounted on the roof.
   */
  private createTaxiVanMesh(route: RouteType): THREE.Group {
    const group = new THREE.Group();

    // If GLB model is already cached, clone and attach immediately
    if (GameEngine.cachedTaxiModel) {
      this.attachHiaceModelToGroup(group, route);
    } else {
      // If async loading is still underway, attach as soon as resolved
      GameEngine.preloadTaxiModel()
        .then(() => {
          if (group.parent) {
            this.attachHiaceModelToGroup(group, route);
          }
        })
        .catch((err) => {
          console.warn('Fallback: procedural mesh used on model load fail', err);
          this.attachProceduralFallback(group, route);
        });
    }

    // Mount destination sign (VIANA / TALATONA / CENTRO) on top of the taxi
    this.addDestinationSignToGroup(group, route);

    return group;
  }

  /**
   * Clones and attaches the cached Toyota HiAce model into the taxi group.
   * Reuses shared geometries and materials for instant rendering without duplicate VRAM spikes.
   */
  private attachHiaceModelToGroup(group: THREE.Group, route: RouteType) {
    if (!GameEngine.cachedTaxiModel) return;

    // Clean up any non-sign children
    const toRemove: THREE.Object3D[] = [];
    group.children.forEach((c) => {
      if (c.name !== 'destinationSignGroup') {
        toRemove.push(c);
      }
    });
    toRemove.forEach((c) => group.remove(c));

    // Shared geometry and material clone (zero duplicate GPU buffers)
    const modelClone = GameEngine.cachedTaxiModel.clone(true);
    modelClone.name = 'hiaceVanModel';
    group.add(modelClone);
  }

  /**
   * Builds the illuminated destination sign board mounted on the taxi roof.
   * Features the route name (VIANA / TALATONA / CENTRO) with route accent lighting.
   */
  private addDestinationSignToGroup(group: THREE.Group, route: RouteType) {
    const signGroup = new THREE.Group();
    signGroup.name = 'destinationSignGroup';

    // Roof rack mount bars (sits right on the van roof at y=2.22)
    const rackGeo = new THREE.BoxGeometry(1.6, 0.08, 0.9);
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 2.24, 0);
    signGroup.add(rack);

    // Destination Sign Box Body
    const destKey =
      route === 'VIANA'
        ? 'destination_viana'
        : route === 'TALATONA'
        ? 'destination_talatona'
        : 'destination_centro';
    const destTex = spriteAtlasManager.getTexture(destKey);
    const routeColor =
      route === 'VIANA' ? 0xffd700 : route === 'TALATONA' ? 0x00d2ff : 0x00ff88;

    const boxGeo = new THREE.BoxGeometry(1.65, 0.46, 0.44);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1a2230,
      roughness: 0.3,
      metalness: 0.3,
    });
    const signBox = new THREE.Mesh(boxGeo, boxMat);
    signBox.position.set(0, 2.48, 0);
    signGroup.add(signBox);

    // Front Face decal (facing camera at -Z)
    const faceGeo = new THREE.PlaneGeometry(1.5, 0.38);
    const faceMat = new THREE.MeshBasicMaterial({
      map: destTex,
      transparent: true,
    });

    const faceCam = new THREE.Mesh(faceGeo, faceMat);
    faceCam.position.set(0, 2.48, -0.23);
    faceCam.rotation.y = Math.PI; // Look towards negative Z (camera)
    signGroup.add(faceCam);

    // Back Face decal (facing sidewalk at +Z)
    const faceSidewalk = new THREE.Mesh(faceGeo, faceMat);
    faceSidewalk.position.set(0, 2.48, 0.23);
    signGroup.add(faceSidewalk);

    // Top route accent neon glow bar
    const glowBarGeo = new THREE.BoxGeometry(1.62, 0.05, 0.42);
    const glowBarMat = new THREE.MeshBasicMaterial({ color: routeColor });
    const glowBar = new THREE.Mesh(glowBarGeo, glowBarMat);
    glowBar.position.set(0, 2.72, 0);
    signGroup.add(glowBar);

    group.add(signGroup);
  }

  /**
   * Lightweight procedural fallback if GLB network load fails
   */
  private attachProceduralFallback(group: THREE.Group, route: RouteType) {
    const bodyGeo = new THREE.BoxGeometry(4.6, 1.9, 2.2);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x006dae });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    group.add(body);

    const stripeGeo = new THREE.BoxGeometry(4.62, 0.35, 2.22);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 1.0;
    group.add(stripe);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    const wheelPositions = [
      [-1.4, 0.38, 1.12],
      [1.4, 0.38, 1.12],
      [-1.4, 0.38, -1.12],
      [1.4, 0.38, -1.12],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      group.add(w);
    });
  }

  public spawnPassenger() {
    if (this.passengers.length >= 12) return;

    const routes: RouteType[] = ['VIANA', 'TALATONA', 'CENTRO'];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const types: PassengerType[] = ['NORMAL', 'NORMAL', 'APRESSADO', 'INDECISO', 'OBSERVADOR', 'ESPECIAL'];
    const pType = types[Math.floor(Math.random() * types.length)];

    const id = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const startX = -18 + Math.random() * 36;
    const startZ = 2 + Math.random() * 7;

    const passenger: Passenger = {
      id,
      name: 'Passageiro',
      type: pType,
      destination: route,
      value: pType === 'ESPECIAL' ? 500 : pType === 'APRESSADO' ? 150 : 100,
      urgency: pType === 'APRESSADO' ? 5 : 2,
      patience: pType === 'APRESSADO' ? 25 : 45,
      maxPatience: pType === 'APRESSADO' ? 25 : 45,
      speed: 4.5,
      state: 'WAITING',
      position: { x: startX, y: 0.6, z: startZ },
      targetPos: { x: startX + (Math.random() - 0.5) * 4, y: 0.6, z: startZ + (Math.random() - 0.5) * 2 },
      followedBy: null,
      assignedTaxiId: null,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      gender: Math.random() > 0.5 ? 'M' : 'F',
      animFrame: 0,
      animTimer: 0,
    };

    this.passengers.push(passenger);

    // Map passenger type to real atlas sprite frame name
    const spriteFrameName = 
      pType === 'APRESSADO' ? 'passenger_apressado' :
      pType === 'INDECISO' ? 'passenger_indeciso' :
      pType === 'OBSERVADOR' ? 'passenger_observador' :
      pType === 'ESPECIAL' ? 'passenger_especial' :
      'passenger_normal';

    // Acquire mesh from pool or create if empty
    let pMesh = this.passengerMeshPool.pop();
    if (!pMesh) {
      pMesh = this.createStylizedCharacter(0xffffff, 0xffffff, false, spriteFrameName);
      this.scene.add(pMesh);
    } else {
      const spriteObj = pMesh.children.find((c) => c instanceof THREE.Sprite) as THREE.Sprite;
      if (spriteObj) {
        spriteObj.material.map = spriteAtlasManager.getTexture(spriteFrameName);
        spriteObj.material.needsUpdate = true;
      }
      pMesh.visible = true;
    }

    pMesh.position.set(startX, 0.6, startZ);
    this.passengerMeshes.set(id, pMesh);

    // Visual feedback particle on spawn ✨
    this.spawnSpriteParticle('effect_passenger_ok', passenger.position, 1.4, 2.0);
  }

  // Player Trigger: Call Passengers 📢
  public triggerCallAction() {
    // If a passenger dispute is currently active, pump persuasion minigame!
    if (this.activeDispute && !this.activeDispute.resolved) {
      this.pushDisputePersuasion();
      return;
    }

    this.isCalling = true;
    this.callPulseTimer = 0.3;
    soundManager.playCall();

    // Particle effect around player
    this.spawnSpriteParticle('effect_megaphone', this.playerPos, 2.2, 1.6);

    const radius = 5.0 + this.playerStats.upgradeVoice * 0.8;

    // Speak contextual phrase
    const phrases = ['Viana!', 'Talatona!', 'Centro!', 'Entra, entra!', 'Táxi a sair!'];
    soundManager.speakPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

    // Find waiting passengers within radius
    this.passengers.forEach((p) => {
      if (p.state === 'WAITING' || p.state === 'SEARCHING') {
        const dist = Math.hypot(p.position.x - this.playerPos.x, p.position.z - this.playerPos.z);
        if (dist <= radius) {
          // Check if an NPC is also near this passenger
          const nearbyRival = this.npcs.find(
            (n) =>
              (n.targetPassengerId === p.id || n.followingPassengerId === p.id) &&
              Math.hypot(n.position.x - p.position.x, n.position.z - p.position.z) <= 3.5
          );

          if (nearbyRival && (!this.activeDispute || this.activeDispute.resolved)) {
            // Trigger direct dispute minigame!
            this.startDispute(p, nearbyRival);
          } else if (!nearbyRival) {
            p.state = 'FOLLOWING';
            p.followedBy = 'PLAYER';
            this.callbacks.onFloatingText('Acompanhando!', '#ffd700', p.position);
            soundManager.playCoin();
            // Visual feedback on recruit
            this.spawnSpriteParticle('effect_passenger_ok', p.position, 1.4, 2.2);
            this.callbacks.onPassengerFollowed?.(p);
          }
        }
      }
    });
  }

  // Player Trigger: Interact / Board Passenger 🤝
  public triggerInteractAction() {
    // Find following passenger close to player
    const followingP = this.passengers.find((p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING');
    if (!followingP) return;

    // Check if player is near a matching taxi
    const matchingTaxi = this.taxis.find(
      (t) =>
        t.route === followingP.destination &&
        t.state === 'WAITING' &&
        t.currentPassengers < t.capacity &&
        Math.hypot(t.position.x - this.playerPos.x, t.position.z - this.playerPos.z) <= 4.0
    );

    if (matchingTaxi) {
      // Board passenger into taxi!
      followingP.state = 'BOARDING';
      followingP.assignedTaxiId = matchingTaxi.id;
      matchingTaxi.currentPassengers++;

      this.passengersServedCount++;
      this.callbacks.onPassengerServedCount(this.passengersServedCount);

      const reward = followingP.value * this.combo;
      this.matchKz += reward;
      this.matchXp += 15;

      this.callbacks.onScoreUpdate(this.matchKz, this.matchXp, this.combo);
      this.callbacks.onFloatingText(`+${reward} Kz`, '#ffd700', matchingTaxi.position);
      soundManager.playCoin();

      // Visual feedback particles on board 💰 ✨
      this.spawnSpriteParticle('effect_coin', matchingTaxi.position, 1.8, 2.4);
      this.spawnSpriteParticle('effect_xp', matchingTaxi.position, 1.8, 2.8);

      // Check if taxi is now full!
      if (matchingTaxi.currentPassengers >= matchingTaxi.capacity) {
        this.onTaxiFilled(matchingTaxi);
      }

      this.callbacks.onPassengerBoarded?.(followingP, matchingTaxi);
    }
  }

  private onTaxiFilled(taxi: Taxi) {
    taxi.state = 'FULL';
    this.taxisLoadedCount++;
    this.combo = Math.min(this.combo + 1, 5);
    this.comboTimer = 10; // 10 seconds to maintain combo

    const bonusKz = taxi.baseReward * this.combo;
    const bonusXp = 50;

    this.matchKz += bonusKz;
    this.matchXp += bonusXp;

    this.callbacks.onScoreUpdate(this.matchKz, this.matchXp, this.combo);
    this.callbacks.onTaxiLoaded(taxi, bonusKz, bonusXp);

    const roofPos = { x: taxi.position.x, y: 2.3, z: taxi.position.z };
    this.callbacks.onFloatingText(`🚐 TÁXI LOTADO! +${bonusKz} Kz`, '#fe6b00', roofPos);

    soundManager.playTaxiFull();
    soundManager.vibrate(100);

    // Particles on taxi filled
    this.spawnSpriteParticle('effect_taxi_full', roofPos, 2.6, 3.0);
    this.spawnSpriteParticle('effect_combo', roofPos, 2.2, 2.5);

    // Free slot after departure animation
    setTimeout(() => {
      taxi.state = 'DEPARTING';
    }, 1200);
  }

  public updateInputs(dir: { x: number; z: number }, isRunning: boolean) {
    this.inputDir = dir;
    this.isRunning = isRunning && (dir.x !== 0 || dir.z !== 0) && this.stamina > 0;
  }

  private animate = (timestamp: number) => {
    if (this._isPaused) {
      return;
    }

    if (!this.lastFrameTime) this.lastFrameTime = timestamp;
    const rawDelta = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    // Delta clamping: prevents physics explosion if tab was minimized/backgrounded
    const delta = Math.min(Math.max(rawDelta, 0.005), 0.05);

    // FPS Telemetry & Automatic Dynamic Downgrade for Low-End Smartphones
    this.frameCount++;
    if (timestamp - this.fpsUpdateTime > 500) {
      this.currentFps = (this.frameCount * 1000) / (timestamp - this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = timestamp;

      if (this.currentFps < 28) {
        this.lowFpsStreak++;
        if (this.lowFpsStreak >= 4 && this.graphicsQuality !== 'LOW') {
          console.warn('[GameEngine] Low FPS detected on mobile -> Auto-downgrading graphics quality to LOW');
          this.setGraphicsQuality('LOW');
        }
      } else {
        this.lowFpsStreak = Math.max(0, this.lowFpsStreak - 1);
      }
    }

    this.updatePlayer(delta);
    this.updateObstacles(delta);
    this.updateDispute(delta);
    this.updateNPCs(delta);
    this.updatePassengers(delta);
    this.updateTaxis(delta);
    this.updateParticles(delta);
    this.updateDepthSorting();
    this.updateCamera();
    this.updateTimers(delta);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public getFps(): number {
    return Math.round(this.currentFps);
  }

  public getEntitiesCount() {
    return {
      passengers: this.passengers.length,
      taxis: this.taxis.length,
      particles: this.particles.length,
    };
  }

  public setGraphicsQuality(quality: 'LOW' | 'MEDIUM' | 'HIGH') {
    this.graphicsQuality = quality;
    if (!this.renderer) return;

    const baseDpr = window.devicePixelRatio || 1;
    const targetDpr = quality === 'LOW' ? 1.0 : quality === 'HIGH' ? Math.min(baseDpr, 1.75) : Math.min(baseDpr, 1.25);
    this.renderer.setPixelRatio(targetDpr);

    if (quality === 'LOW') {
      this.renderer.shadowMap.enabled = false;
      if (this.dirLight) this.dirLight.castShadow = false;
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = quality === 'HIGH' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
      if (this.dirLight) {
        this.dirLight.castShadow = true;
        const res = quality === 'HIGH' ? 1024 : 512;
        this.dirLight.shadow.mapSize.width = res;
        this.dirLight.shadow.mapSize.height = res;
      }
    }
  }

  private updatePlayer(delta: number) {
    // Stamina drain / recovery
    if (this.isRunning) {
      this.stamina = Math.max(0, this.stamina - this.staminaDrainRate * delta);
      if (this.stamina <= 0) this.isRunning = false;
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRecoveryRate * delta);
    }
    
    // Stamina throttling: Only notify React when the change is noticeable (>= 1.5) or at extremes (0 / full), capped at ~10x/sec
    const now = performance.now();
    const staminaDelta = Math.abs(this.stamina - this.lastReportedStamina);
    const isExtreme = (this.stamina <= 0 && this.lastReportedStamina > 0) ||
                      (this.stamina >= this.maxStamina && this.lastReportedStamina < this.maxStamina);
    const timeSinceLastReport = now - this.lastStaminaReportTime;

    if (isExtreme || (staminaDelta >= 1.5 && timeSinceLastReport >= 100)) {
      this.lastReportedStamina = this.stamina;
      this.lastStaminaReportTime = now;
      this.callbacks.onStaminaChange(this.stamina, this.maxStamina);
    }

    // Calculate desired input velocity
    let targetSpeed = this.isRunning ? this.playerSpeed * 1.5 : this.playerSpeed;
    if (this.playerStumbleTimer > 0) {
      this.playerStumbleTimer -= delta;
      targetSpeed *= 0.35; // Stumbled by zungueira / crowd collision
    }
    const isInputMoving = this.inputDir.x !== 0 || this.inputDir.z !== 0;

    // Camera looks toward +Z, so world +X renders on the LEFT of the screen
    // (screen-right = world -X). Invert the horizontal input so pressing right
    // moves the player to the right on screen.
    const targetVelX = isInputMoving ? -this.inputDir.x * targetSpeed : 0;
    const targetVelZ = isInputMoving ? this.inputDir.z * targetSpeed : 0;

    // Smooth physics: acceleration vs braking lerp
    const lerpSpeed = isInputMoving ? 12 : 16;
    this.playerVel.x = THREE.MathUtils.lerp(this.playerVel.x, targetVelX, lerpSpeed * delta);
    this.playerVel.z = THREE.MathUtils.lerp(this.playerVel.z, targetVelZ, lerpSpeed * delta);

    const speedScalar = Math.hypot(this.playerVel.x, this.playerVel.z);

    // Detect sudden stopping skid
    if (this.wasInputMoving && !isInputMoving && speedScalar > 2.5) {
      this.playerSkidTimer = 0.2;
      soundManager.playSkid();
      this.spawnDustParticle(this.playerPos.x, 0.02, this.playerPos.z, 0.5);
      this.spawnDustParticle(this.playerPos.x, 0.02, this.playerPos.z, 0.4);
    }
    this.wasInputMoving = isInputMoving;

    const oldX = this.playerPos.x;
    const oldZ = this.playerPos.z;

    this.playerPos.x += this.playerVel.x * delta;
    this.playerPos.z += this.playerVel.z * delta;

    // Clamp player within map boundaries
    this.playerPos.x = Math.max(-26, Math.min(26, this.playerPos.x));
    this.playerPos.z = Math.max(-2, Math.min(11, this.playerPos.z));

    const actualDx = this.playerPos.x - oldX;
    const actualDz = this.playerPos.z - oldZ;
    const actualDist = Math.hypot(actualDx, actualDz);
    const isMoving = actualDist > 0.002;

    this.playerMovedDistance += actualDist;
    if (this.isTutorial && this.callbacks.onPlayerMove && isMoving) {
      if (Math.abs(this.playerMovedDistance - this.lastMoveReportDist) >= 0.25) {
        this.lastMoveReportDist = this.playerMovedDistance;
        this.callbacks.onPlayerMove(this.playerMovedDistance);
      }
    }
    if (this.isRunning && !this.wasRunningLastFrame && isMoving && this.callbacks.onPlayerRunStart) {
      this.callbacks.onPlayerRunStart();
    }
    this.wasRunningLastFrame = this.isRunning && isMoving;

    // Direction & Facing flip with Turn Lean
    if (actualDx < -0.01) {
      if (!this.playerFacingLeft && speedScalar > 2.0) {
        this.playerTurnTilt = 0.22; // Turn lean angle
        soundManager.playSkid();
        this.spawnDustParticle(this.playerPos.x, 0.02, this.playerPos.z, 0.4);
      }
      this.playerFacingLeft = true;
    } else if (actualDx > 0.01) {
      if (this.playerFacingLeft && speedScalar > 2.0) {
        this.playerTurnTilt = -0.22; // Turn lean angle
        soundManager.playSkid();
        this.spawnDustParticle(this.playerPos.x, 0.02, this.playerPos.z, 0.4);
      }
      this.playerFacingLeft = false;
    }

    // Decay turn tilt smoothly back to 0
    this.playerTurnTilt = THREE.MathUtils.lerp(this.playerTurnTilt, 0, 10 * delta);

    // =========================================================================
    // DIRECTION STATE MACHINE & ANTI-FLICKER HYSTERESIS
    // =========================================================================
    // Camera is positioned at negative Z looking along +Z:
    // - Screen-RIGHT is world -X (actualDx < 0)
    // - Screen-LEFT is world +X (actualDx > 0)
    // - Screen-UP (away into depth) is world +Z (actualDz > 0) -> 'back'
    // - Screen-DOWN (towards camera) is world -Z (actualDz < 0) -> 'front'
    //
    // Hysteresis deadzone: Only update direction when moving decisively (above 0.25 speed)
    // with a 15% hysteresis bias against changing axes. When slowing down or stopped,
    // the state machine NEVER switches direction, completely eliminating flicker!
    const absDx = Math.abs(actualDx);
    const absDz = Math.abs(actualDz);
    const isActivelyMoving = isMoving && speedScalar > 0.25 && actualDist > 0.005;

    if (isActivelyMoving) {
      const currentAxisIsHorizontal = this.playerFacingDir === 'left' || this.playerFacingDir === 'right';
      const horizontalDominates = currentAxisIsHorizontal
        ? absDx >= absDz * 0.85
        : absDx > absDz * 1.15;

      if (horizontalDominates) {
        this.playerFacingDir = actualDx < 0 ? 'right' : 'left';
      } else {
        this.playerFacingDir = actualDz > 0 ? 'back' : 'front';
      }
    }

    // Always preserve the last locked facing direction
    const direction = this.playerFacingDir || 'front';

    let frameKey = `player_${direction}_idle_0`;
    let yBob = 0;
    let shadowScale = 1.0;
    let shadowOpacity = 0.3;

    if ((isMoving && speedScalar > 0.2) || this.isCalling) {
      const isRunning = this.isRunning && isMoving;
      const strideLength = isRunning ? 0.32 : 0.48;

      this.playerAnimDistance += actualDist;
      const frameCount = 2; // real player1_spritesheet.png only has run_0/run_1
      const currentStep = Math.floor(this.playerAnimDistance / strideLength);
      const frameIndex = currentStep % frameCount;

      if (currentStep !== this.prevPlayerAnimStep) {
        this.prevPlayerAnimStep = currentStep;
        if (frameIndex === 0 || frameIndex === 2) {
          soundManager.playStep(isRunning);
          this.spawnDustParticle(
            this.playerPos.x,
            0.02,
            this.playerPos.z,
            isRunning ? 0.45 : 0.28
          );
        }
      }

      frameKey = `player_${direction}_run_${frameIndex}`;

      const stepPhase = (this.playerAnimDistance / strideLength) * Math.PI;
      yBob = Math.abs(Math.sin(stepPhase)) * (isRunning ? 0.10 : 0.06);
      shadowScale = 1.0 - yBob * 0.8;
      shadowOpacity = 0.35 - yBob * 0.15;
    } else if (this.playerSkidTimer > 0) {
      this.playerSkidTimer -= delta;
      frameKey = `player_${direction}_run_1`;
      yBob = -0.04;
      this.playerTurnTilt = this.playerFacingLeft ? -0.12 : 0.12;
      if (Math.random() < 0.3) {
        this.spawnDustParticle(this.playerPos.x, 0.02, this.playerPos.z, 0.35);
      }
    } else {
      // Neutral / Idle frame – smoothly holds the last facing direction
      this.idleBreathTimer += delta;
      frameKey = `player_${direction}_idle_0`;
      yBob = Math.sin(this.idleBreathTimer * 3) * 0.012;
    }

    if (!this.playerSprite && this.playerMesh) {
      this.playerSprite = (this.playerMesh.userData.sprite || this.playerMesh.children.find((c) => c instanceof THREE.Sprite)) as THREE.Sprite;
    }
    if (!this.playerShadow && this.playerMesh) {
      this.playerShadow = (this.playerMesh.userData.shadow || this.playerMesh.children.find(
        (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CircleGeometry
      )) as THREE.Mesh;
    }

    const spriteObj = this.playerSprite;
    const shadowMesh = this.playerShadow;

    if (spriteObj) {
      if (this.lastPlayerFrameKey !== frameKey) {
        const newTex = spriteAtlasManager.getTexture(frameKey);
        if (spriteObj.material.map !== newTex) {
          spriteObj.material.map = newTex;
          spriteObj.material.needsUpdate = true;
        }
        this.lastPlayerFrameKey = frameKey;
      }
      const { width: fw, height: fh } = spriteAtlasManager.getFrameSize(frameKey);
      const worldHeight = 2.8;
      const aspect = fh > 0 ? fw / fh : 0.4;

      // REFACTORED FLIP LOGIC:
      // The profile frames in player1_spritesheet.png (row 3) face LEFT in the raw sprite.
      // - To look RIGHT on screen: flip horizontally (-sx)
      // - To look LEFT on screen: normal orientation (+sx)
      // - Front and Back: normal orientation (+sx)
      // flipX depends strictly and solely on direction === 'right'
      const flipX = direction === 'right';
      const sx = worldHeight * aspect;
      spriteObj.scale.set(flipX ? -sx : sx, worldHeight, 1);
      spriteObj.position.y = 1.35 + yBob;
      spriteObj.rotation.z = this.playerTurnTilt;
    }

    if (shadowMesh) {
      shadowMesh.scale.set(shadowScale, shadowScale, 1);
      (shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, shadowOpacity);
    }

    // Billboard visual orientation indicator (subtle accent that aligns with facing side)
    const billboardIndicator = this.playerMesh.children.find(
      (c) => c.name === 'playerBillboardIndicator'
    ) as THREE.Mesh;
    if (billboardIndicator) {
      const mat = billboardIndicator.material as THREE.MeshBasicMaterial;
      const targetOp = isActivelyMoving ? 0.8 : 0;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOp, 10 * delta);
      // Shift toward facing direction (+X is screen-left, -X is screen-right)
      const targetX = direction === 'right' ? -0.35 : direction === 'left' ? 0.35 : 0;
      billboardIndicator.position.x = THREE.MathUtils.lerp(billboardIndicator.position.x, targetX, 12 * delta);
    }

    // Ground directional chevron arrow indicator (shows true world movement angle)
    if (this.playerDirArrowGroup && this.playerDirArrowMesh) {
      this.playerDirArrowGroup.position.set(this.playerPos.x, 0.425, this.playerPos.z);
      const arrowMat = this.playerDirArrowMesh.material as THREE.MeshBasicMaterial;
      if (isActivelyMoving && speedScalar > 0.2) {
        const moveAngle = Math.atan2(this.playerVel.x, this.playerVel.z);
        this.playerDirArrowGroup.rotation.y = moveAngle;
        arrowMat.opacity = THREE.MathUtils.lerp(arrowMat.opacity, 0.85, 12 * delta);
      } else {
        arrowMat.opacity = THREE.MathUtils.lerp(arrowMat.opacity, 0, 8 * delta);
      }
    }

    this.playerMesh.position.copy(this.playerPos);
    this.playerRingMesh.position.set(this.playerPos.x, 0.42, this.playerPos.z);
    this.callRadiusMesh.position.set(this.playerPos.x, 0.43, this.playerPos.z);

    // Call pulse visual
    if (this.callPulseTimer > 0) {
      this.callPulseTimer -= delta;
      const opacity = Math.max(0, this.callPulseTimer / 0.3);
      (this.callRadiusMesh.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
      if (this.callPulseTimer <= 0) {
        this.isCalling = false;
      }
    }
  }

  // Urban Obstacles of Luanda (Zungueiras & Fiscal da Paragem)
  private updateObstacles(delta: number) {
    const isPlayerMoving = Math.hypot(this.playerVel.x, this.playerVel.z) > 0.5;

    this.urbanObstacles.forEach((obs) => {
      const mesh = this.obstacleMeshes.get(obs.id);
      if (!mesh) return;

      // Waypoint patrol navigation
      const target = obs.patrolPoints[obs.currentPatrolIdx];
      const dx = target.x - obs.position.x;
      const dz = target.z - obs.position.z;
      const distToTarget = Math.hypot(dx, dz);

      if (distToTarget < 0.6) {
        obs.currentPatrolIdx = (obs.currentPatrolIdx + 1) % obs.patrolPoints.length;
      } else {
        const velX = (dx / distToTarget) * obs.speed;
        const velZ = (dz / distToTarget) * obs.speed;

        obs.position.x += velX * delta;
        obs.position.z += velZ * delta;
        obs.facingLeft = velX < 0;
        obs.animDistance = (obs.animDistance || 0) + Math.hypot(velX, velZ) * delta;
      }

      // Sprite walk cycle
      const frameIdx = Math.floor((obs.animDistance || 0) / 0.45) % 4;
      const frameKey = `obstacle_${obs.type.toLowerCase()}_walk_${frameIdx}`;
      const spriteObj = (mesh.userData.sprite || mesh.children.find((c) => c instanceof THREE.Sprite)) as THREE.Sprite;
      if (spriteObj) {
        if (mesh.userData.currentFrameKey !== frameKey) {
          const newTex = spriteAtlasManager.getTexture(frameKey);
          if (spriteObj.material.map !== newTex) {
            spriteObj.material.map = newTex;
            spriteObj.material.needsUpdate = true;
          }
          mesh.userData.currentFrameKey = frameKey;
        }
        spriteObj.scale.set(obs.facingLeft ? -1.6 : 1.6, 2.4, 1);
        const yBob = Math.abs(Math.sin(((obs.animDistance || 0) / 0.45) * Math.PI)) * 0.05;
        spriteObj.position.y = 1.2 + yBob;
      }

      mesh.position.set(obs.position.x, 0.6, obs.position.z);

      // Decrement timers
      if (obs.whistleCooldown && obs.whistleCooldown > 0) {
        obs.whistleCooldown -= delta;
      }
      if (obs.speechTimer && obs.speechTimer > 0) {
        obs.speechTimer -= delta;
      }

      // Proximity to Player interactions
      const distToPlayer = Math.hypot(this.playerPos.x - obs.position.x, this.playerPos.z - obs.position.z);

      if (obs.type === 'ZUNGUEIRA') {
        // Physical collision: Stumble penalty and Angolan street vendor voice line
        if (distToPlayer < 1.35) {
          if (this.playerStumbleTimer <= 0) {
            this.playerStumbleTimer = 1.25;
            soundManager.playStumble();
            soundManager.vibrate(90);

            const zungueiraPhrases = [
              'Eish! Cuidado com a bacia, moço!',
              'Olha a fruta! Quase entornas a manga!',
              'Moço, vais pagar este abacate!',
              'Calma, aqui tem negócio!',
            ];
            const phrase = zungueiraPhrases[Math.floor(Math.random() * zungueiraPhrases.length)];
            obs.speechText = phrase;
            obs.speechTimer = 2.5;

            this.callbacks.onFloatingText(`🥭 ${phrase}`, '#e65100', obs.position);
            this.spawnSpriteParticle('effect_passenger_lost', obs.position, 1.4, 1.8);
          }
        }
      } else if (obs.type === 'FISCAL') {
        // Fiscal Warning: If player sprints/runs near him!
        if (distToPlayer < 3.0 && this.isRunning && isPlayerMoving) {
          if (!obs.whistleCooldown || obs.whistleCooldown <= 0) {
            obs.whistleCooldown = 4.0;
            soundManager.playWhistle();
            soundManager.vibrate(120);

            // Stamina drain penalty
            this.stamina = Math.max(0, this.stamina - 25);
            this.lastReportedStamina = this.stamina;
            this.callbacks.onStaminaChange(this.stamina, this.maxStamina);

            const fiscalPhrases = [
              'Ei, moço! Calma na paragem!',
              'Não corre na zona dos passageiros!',
              'Respeita a ordem da circulação!',
              'Muita pressa dá multa!',
            ];
            const phrase = fiscalPhrases[Math.floor(Math.random() * fiscalPhrases.length)];
            obs.speechText = phrase;
            obs.speechTimer = 3.0;

            this.callbacks.onFloatingText(`👮 FISCAL: ${phrase} (-25 Stamina)`, '#ba1a1a', obs.position);
            this.spawnSpriteParticle('effect_turbo', obs.position, 1.5, 2.0);
          }
        }
      }
    });
  }

  // Direct Passenger Dispute ("É MEU!") Minigame Logic
  public startDispute(passenger: Passenger, npc: NPCLotador) {
    if (this.activeDispute && !this.activeDispute.resolved) return;

    const rivalPhrases = [
      'É MEU! Já vi primeiro!',
      'Sai da frente, novato!',
      'Viana direto, cliente é meu!',
      'Nem tentes, já chamei!',
    ];
    const speech = rivalPhrases[Math.floor(Math.random() * rivalPhrases.length)];

    this.activeDispute = {
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerDestination: passenger.destination,
      npcId: npc.id,
      npcName: npc.name,
      npcSpeech: speech,
      timer: 3.5,
      maxDuration: 3.5,
      playerProgress: 35,
      resolved: false,
      position: { x: passenger.position.x, y: 1.5, z: passenger.position.z },
    };

    npc.state = 'DISPUTING' as any;
    passenger.state = 'WAITING';

    soundManager.playDisputeAlert();
    soundManager.speakPhrase('É meu!');

    this.callbacks.onFloatingText(`⚔️ ${npc.name}: "${speech}"`, '#fe6b00', passenger.position);
    this.callbacks.onDisputeUpdate?.(this.activeDispute);
  }

  public pushDisputePersuasion() {
    if (!this.activeDispute || this.activeDispute.resolved) return;

    const voiceBoost = (this.playerStats.upgradeVoice || 0) * 3.5;
    const persuasionBoost = (this.playerStats.upgradePersuasion || 0) * 4.5;
    const boost = 22 + voiceBoost + persuasionBoost;

    this.activeDispute.playerProgress = Math.min(100, this.activeDispute.playerProgress + boost);

    soundManager.playCall();
    this.spawnSpriteParticle('effect_megaphone', this.playerPos, 1.6, 1.5);
    this.callbacks.onFloatingText('+PERSUASÃO! 📢', '#ffd700', this.playerPos);

    if (this.activeDispute.playerProgress >= 100) {
      this.winDispute();
    } else {
      this.callbacks.onDisputeUpdate?.(this.activeDispute);
    }
  }

  public winDispute() {
    if (!this.activeDispute) return;

    const dispute = this.activeDispute;
    dispute.resolved = true;

    soundManager.playDisputeWin();
    soundManager.playCombo(3);

    const passenger = this.passengers.find((p) => p.id === dispute.passengerId);
    if (passenger) {
      passenger.followedBy = 'PLAYER';
      passenger.state = 'FOLLOWING';
      this.spawnSpriteParticle('effect_passenger_ok', passenger.position, 1.8, 2.5);
    }

    const npc = this.npcs.find((n) => n.id === dispute.npcId);
    if (npc) {
      npc.followingPassengerId = null;
      npc.targetPassengerId = null;
      npc.state = 'IDLE';
      npc.disputeCooldown = 3.5;
    }

    const bonusKz = 150;
    const bonusXp = 50;
    this.matchKz += bonusKz;
    this.matchXp += bonusXp;

    this.callbacks.onScoreUpdate(this.matchKz, this.matchXp, this.combo);
    this.callbacks.onFloatingText('🏆 PERSUASÃO VENCEU! +150 Kz (+50 XP)', '#ffd700', dispute.position);

    setTimeout(() => {
      this.activeDispute = null;
      this.callbacks.onDisputeUpdate?.(null);
    }, 400);
  }

  public loseDispute() {
    if (!this.activeDispute) return;

    const dispute = this.activeDispute;
    dispute.resolved = true;

    soundManager.playStumble();

    const passenger = this.passengers.find((p) => p.id === dispute.passengerId);
    const npc = this.npcs.find((n) => n.id === dispute.npcId);

    if (passenger && npc) {
      passenger.followedBy = npc.id;
      passenger.state = 'FOLLOWING';
      npc.followingPassengerId = passenger.id;
      npc.state = 'LEADING';
      npc.targetPassengerId = null;
    }

    this.callbacks.onFloatingText(`❌ ${dispute.npcName} levou o passageiro!`, '#ba1a1a', dispute.position);

    setTimeout(() => {
      this.activeDispute = null;
      this.callbacks.onDisputeUpdate?.(null);
    }, 400);
  }

  private updateDispute(delta: number) {
    if (!this.activeDispute || this.activeDispute.resolved) return;

    const dispute = this.activeDispute;
    dispute.timer -= delta;

    const npc = this.npcs.find((n) => n.id === dispute.npcId);
    const pullRate = npc?.specialty === 'ESTRATEGIA' ? 22 : 16;
    dispute.playerProgress = Math.max(5, dispute.playerProgress - pullRate * delta);

    if (dispute.timer <= 0) {
      this.loseDispute();
    } else {
      this.callbacks.onDisputeUpdate?.(dispute);
    }
  }

  private updateNPCs(delta: number) {
    this.npcs.forEach((npc) => {
      const mesh = this.npcMeshes.get(npc.id);
      if (!mesh) return;

      let targetVelX = 0;
      let targetVelZ = 0;

      // Handle dispute state and cooldown
      if (npc.disputeCooldown && npc.disputeCooldown > 0) {
        npc.disputeCooldown -= delta;
        targetVelX = 0;
        targetVelZ = 0;
      } else if (this.activeDispute && this.activeDispute.npcId === npc.id) {
        targetVelX = 0;
        targetVelZ = 0;
      } else {
        // AI Logic: Find nearest unserviced passenger
        if (!npc.targetPassengerId) {
          const target = this.passengers.find((p) => p.state === 'WAITING' || p.state === 'SEARCHING');
          if (target) {
            npc.targetPassengerId = target.id;
            npc.state = 'CHASING';
          }
        }

        if (npc.targetPassengerId) {
          const targetP = this.passengers.find((p) => p.id === npc.targetPassengerId);
          if (targetP && targetP.state === 'WAITING') {
            const dx = targetP.position.x - npc.position.x;
            const dz = targetP.position.z - npc.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 1.0) {
              targetVelX = (dx / dist) * npc.speed;
              targetVelZ = (dz / dist) * npc.speed;
            } else {
              const distToPlayer = Math.hypot(targetP.position.x - this.playerPos.x, targetP.position.z - this.playerPos.z);
              if (distToPlayer <= 3.8 && (!this.activeDispute || this.activeDispute.resolved)) {
                // Player is close enough to contest! Trigger Passenger Dispute!
                this.startDispute(targetP, npc);
              } else {
                // Claim passenger
                targetP.state = 'FOLLOWING';
                targetP.followedBy = npc.id;
                npc.followingPassengerId = targetP.id;
                npc.targetPassengerId = null;
                npc.state = 'LEADING';
              }
            }
          } else {
            npc.targetPassengerId = null;
            npc.state = 'IDLE';
          }
        }

        // If leading a passenger, move towards matching taxi
        if (npc.followingPassengerId) {
          const p = this.passengers.find((p) => p.id === npc.followingPassengerId);
          if (p) {
            const matchingTaxi = this.taxis.find(
              (t) => t.route === p.destination && t.state === 'WAITING' && t.currentPassengers < t.capacity
            );
            if (matchingTaxi) {
              const dx = matchingTaxi.position.x - npc.position.x;
              const dz = matchingTaxi.position.z - npc.position.z;
              const dist = Math.hypot(dx, dz);

              if (dist > 2.0) {
                targetVelX = (dx / dist) * npc.speed;
                targetVelZ = (dz / dist) * npc.speed;
              } else {
                // Board passenger
                p.state = 'BOARDING';
                p.assignedTaxiId = matchingTaxi.id;
                matchingTaxi.currentPassengers++;
                npc.followingPassengerId = null;
                npc.state = 'IDLE';

                if (matchingTaxi.currentPassengers >= matchingTaxi.capacity) {
                  this.onTaxiFilled(matchingTaxi);
                }
              }
            }
          }
        }
      }

      // Smooth inertia velocity
      npc.velocity = npc.velocity || { x: 0, z: 0 };
      npc.velocity.x = THREE.MathUtils.lerp(npc.velocity.x, targetVelX, 14 * delta);
      npc.velocity.z = THREE.MathUtils.lerp(npc.velocity.z, targetVelZ, 14 * delta);

      const oldX = npc.position.x;
      const oldZ = npc.position.z;

      npc.position.x += npc.velocity.x * delta;
      npc.position.z += npc.velocity.z * delta;

      const actualDx = npc.position.x - oldX;
      const actualDz = npc.position.z - oldZ;
      const actualDist = Math.hypot(actualDx, actualDz);
      const isMoving = actualDist > 0.002;

      if (actualDx < -0.01) {
        npc.facingLeft = true;
      } else if (actualDx > 0.01) {
        npc.facingLeft = false;
      }

      const npcTypeKey = `npc_${npc.id}`;
      let frameKey = npcTypeKey;
      let yBob = 0;
      let shadowScale = 1.0;
      let shadowOpacity = 0.3;

      if (isMoving) {
        npc.animDistance = (npc.animDistance || 0) + actualDist;
        const strideLength = 0.42;
        const frameIndex = Math.floor(npc.animDistance / strideLength) % 4;

        frameKey = `${npcTypeKey}_walk_${frameIndex}`;

        const stepPhase = (npc.animDistance / strideLength) * Math.PI;
        yBob = Math.abs(Math.sin(stepPhase)) * 0.07;
        shadowScale = 1.0 - yBob * 0.7;
        shadowOpacity = 0.3 - yBob * 0.12;
      } else {
        frameKey = npcTypeKey;
      }

      const spriteObj = (mesh.userData.sprite || mesh.children.find((c) => c instanceof THREE.Sprite)) as THREE.Sprite;
      const shadowMesh = (mesh.userData.shadow || mesh.children.find(
        (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CircleGeometry
      )) as THREE.Mesh;

      if (spriteObj) {
        if (mesh.userData.currentFrameKey !== frameKey) {
          const newTex = spriteAtlasManager.getTexture(frameKey);
          if (spriteObj.material.map !== newTex) {
            spriteObj.material.map = newTex;
            spriteObj.material.needsUpdate = true;
          }
          mesh.userData.currentFrameKey = frameKey;
        }
        spriteObj.scale.set(npc.facingLeft ? -1.4 : 1.4, 2.2, 1);
        spriteObj.position.y = 1.1 + yBob;
      }

      if (shadowMesh) {
        shadowMesh.scale.set(shadowScale, shadowScale, 1);
        (shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, shadowOpacity);
      }

      mesh.position.set(npc.position.x, 0.6, npc.position.z);
    });
  }

  private updatePassengers(delta: number) {
    for (let i = this.passengers.length - 1; i >= 0; i--) {
      const p = this.passengers[i];
      const pMesh = this.passengerMeshes.get(p.id);
      if (!pMesh) continue;

      const spriteObj = (pMesh.userData.sprite || pMesh.children.find((c) => c instanceof THREE.Sprite)) as THREE.Sprite;
      const shadowMesh = (pMesh.userData.shadow || pMesh.children.find(
        (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CircleGeometry
      )) as THREE.Mesh;

      const pTypeKey = 
        p.type === 'APRESSADO' ? 'passenger_apressado' :
        p.type === 'INDECISO' ? 'passenger_indeciso' :
        p.type === 'OBSERVADOR' ? 'passenger_observador' :
        p.type === 'EXIGENTE' ? 'passenger_exigente' :
        p.type === 'CORRERIA' ? 'passenger_correria' :
        p.type === 'ESPECIAL' ? 'passenger_especial' :
        'passenger_normal';

      let targetVelX = 0;
      let targetVelZ = 0;

      // Patience timer
      if (p.state === 'WAITING' || p.state === 'SEARCHING') {
        p.patience -= delta;
        if (p.patience <= 0) {
          // Passenger leaves in frustration ⌛
          this.spawnSpriteParticle('effect_passenger_lost', p.position, 1.6, 2.0);
          this.removePassenger(p, i);
          continue;
        }
      }

      // Following state
      if (p.state === 'FOLLOWING') {
        let leaderPos = this.playerPos;
        if (p.followedBy !== 'PLAYER') {
          const npc = this.npcs.find((n) => n.id === p.followedBy);
          if (npc) leaderPos = new THREE.Vector3(npc.position.x, 0.6, npc.position.z);
        }

        const dx = leaderPos.x - p.position.x;
        const dz = leaderPos.z - p.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 1.2) {
          targetVelX = (dx / dist) * (p.speed * 1.15);
          targetVelZ = (dz / dist) * (p.speed * 1.15);
        }
      }

      // Boarding state
      if (p.state === 'BOARDING') {
        // Disappear into taxi
        this.removePassenger(p, i);
        continue;
      }

      // Smooth inertia velocity
      p.velocity = p.velocity || { x: 0, z: 0 };
      p.velocity.x = THREE.MathUtils.lerp(p.velocity.x, targetVelX, 15 * delta);
      p.velocity.z = THREE.MathUtils.lerp(p.velocity.z, targetVelZ, 15 * delta);

      const oldX = p.position.x;
      const oldZ = p.position.z;

      p.position.x += p.velocity.x * delta;
      p.position.z += p.velocity.z * delta;

      const actualDx = p.position.x - oldX;
      const actualDz = p.position.z - oldZ;
      const actualDist = Math.hypot(actualDx, actualDz);
      const isMoving = actualDist > 0.002;

      if (actualDx < -0.01) {
        p.facingLeft = true;
      } else if (actualDx > 0.01) {
        p.facingLeft = false;
      }

      let frameKey = pTypeKey;
      let yBob = 0;
      let shadowScale = 1.0;
      let shadowOpacity = 0.3;

      if (isMoving) {
        p.animDistance = (p.animDistance || 0) + actualDist;
        const strideLength = 0.42;
        const frameIndex = Math.floor(p.animDistance / strideLength) % 4;

        frameKey = `${pTypeKey}_walk_${frameIndex}`;

        const stepPhase = (p.animDistance / strideLength) * Math.PI;
        yBob = Math.abs(Math.sin(stepPhase)) * 0.07;
        shadowScale = 1.0 - yBob * 0.7;
        shadowOpacity = 0.3 - yBob * 0.12;
      } else {
        // Idle / Rest pose when stationary
        frameKey = pTypeKey;
        p.animTimer = (p.animTimer || 0) + delta;
        yBob = Math.sin((p.animTimer || 0) * 2.5) * 0.01;
      }

      if (spriteObj) {
        if (pMesh.userData.currentFrameKey !== frameKey) {
          const newTex = spriteAtlasManager.getTexture(frameKey);
          if (spriteObj.material.map !== newTex) {
            spriteObj.material.map = newTex;
            spriteObj.material.needsUpdate = true;
          }
          pMesh.userData.currentFrameKey = frameKey;
        }
        spriteObj.scale.set(p.facingLeft ? -1.4 : 1.4, 2.2, 1);
        spriteObj.position.y = 1.1 + yBob;
      }

      if (shadowMesh) {
        shadowMesh.scale.set(shadowScale, shadowScale, 1);
        (shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, shadowOpacity);
      }

      pMesh.position.set(p.position.x, 0.6, p.position.z);
    }
  }

  private removePassenger(p: Passenger, index: number) {
    const mesh = this.passengerMeshes.get(p.id);
    if (mesh) {
      mesh.visible = false;
      this.passengerMeshPool.push(mesh);
      this.passengerMeshes.delete(p.id);
    }
    this.passengers.splice(index, 1);
  }

  private updateTaxis(delta: number) {
    this.taxis.forEach((t) => {
      const vanMesh = this.taxiMeshes.get(t.id);
      if (!vanMesh) return;

      const slot = this.taxiSlots[t.stopSlot];

      if (t.state === 'ARRIVING') {
        // Drive in from right to slot position
        if (t.position.x > slot.x) {
          t.position.x -= 12 * delta;
        } else {
          t.position.x = slot.x;
          t.state = 'WAITING';
        }
      } else if (t.state === 'DEPARTING') {
        // Drive off to left
        t.position.x -= 16 * delta;
        if (t.position.x < -32) {
          t.state = 'GONE';
          slot.occupied = false;
          slot.taxiId = null;
        }
      }

      vanMesh.position.set(t.position.x, t.position.y, t.position.z);
    });

    // Cleanup GONE taxis
    for (let i = this.taxis.length - 1; i >= 0; i--) {
      const t = this.taxis[i];
      if (t.state === 'GONE') {
        const mesh = this.taxiMeshes.get(t.id);
        if (mesh) {
          this.scene.remove(mesh);
          this.taxiMeshes.delete(t.id);
        }
        this.taxis.splice(i, 1);
      }
    }
  }

  private updateTimers(delta: number) {
    // Combo decay
    if (this.combo > 1) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.callbacks.onScoreUpdate(this.matchKz, this.matchXp, this.combo);
      }
    }

    // Spawn new passengers periodically
    this.passengerSpawnTimer += delta;
    const spawnRate = this.isRushHour ? 2.5 : 5.0;
    if (this.passengerSpawnTimer >= spawnRate) {
      this.passengerSpawnTimer = 0;
      this.spawnPassenger();
    }

    // Spawn new taxis periodically
    this.taxiSpawnTimer += delta;
    if (this.taxiSpawnTimer >= 8.0) {
      this.taxiSpawnTimer = 0;
      this.spawnTaxi();
    }
  }

  private updateCamera() {
    // Smooth camera target following player
    const targetX = this.playerPos.x * 0.6;
    const targetY = 16;
    const targetZ = this.playerPos.z - 16;

    this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(this.playerPos.x * 0.6, 0.8, this.playerPos.z + 2);
  }

  public toggleRushHour(enable: boolean) {
    this.isRushHour = enable;
    this.callbacks.onRushHourState(enable);
    soundManager.startBackgroundRhythm(enable);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public destroy() {
    this._isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.onWindowResize);
    soundManager.stopBackgroundRhythm();

    // Comprehensive WebGL and Three.js Memory Cleanup
    if (this.scene) {
      this.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          // Do not dispose geometries of global cached templates
          if (mesh.geometry && mesh.name !== 'hiaceVanModel') {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              // Note: Never dispose m.map here, as it belongs to shared SpriteAtlasManager or HiAce cache!
              m.dispose();
            });
          }
        }
      });
    }

    // Clean up pools
    this.dustMeshPool.length = 0;
    this.spriteParticlePool.length = 0;
    this.passengerMeshPool.length = 0;
    this.particles.length = 0;
    this.passengerMeshes.clear();
    this.taxiMeshes.clear();
    this.npcMeshes.clear();
    this.obstacleMeshes.clear();

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.forceContextLoss();
    }
  }
}
