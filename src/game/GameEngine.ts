/**
 * LOTADOR 3D Game Engine (Three.js Low-Poly Arcade)
 */

import * as THREE from 'three';
import { 
  Passenger, 
  Taxi, 
  NPCLotador, 
  RouteType, 
  PassengerType, 
  TaxiType, 
  PlayerStats,
  FloatingText 
} from '../types/game';
import { soundManager } from '../utils/audio';
import { spriteAtlasManager } from '../utils/spriteAtlas';

export interface GameEngineCallbacks {
  onScoreUpdate: (kz: number, xp: number, combo: number) => void;
  onTaxiLoaded: (taxi: Taxi, reward: number, xp: number) => void;
  onFloatingText: (text: string, color: string, pos: { x: number; y: number; z: number }) => void;
  onRushHourState: (isRush: boolean) => void;
  onStaminaChange: (current: number, max: number) => void;
  onPassengerServedCount: (count: number) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

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
  
  // Game Collections
  public passengers: Passenger[] = [];
  public taxis: Taxi[] = [];
  public npcs: NPCLotador[] = [];
  
  // Meshes
  private playerMesh!: THREE.Group;
  private playerRingMesh!: THREE.Mesh;
  private passengerMeshes: Map<string, THREE.Group> = new Map();
  private taxiMeshes: Map<string, THREE.Group> = new Map();
  private npcMeshes: Map<string, THREE.Group> = new Map();

  // Match State
  public combo = 1;
  public comboTimer = 0;
  public matchKz = 0;
  public matchXp = 0;
  public taxisLoadedCount = 0;
  public passengersServedCount = 0;
  public isRushHour = false;

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

  constructor(container: HTMLElement, playerStats: PlayerStats, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.playerStats = playerStats;
    this.callbacks = callbacks;

    // Apply Upgrades to Player
    this.playerSpeed = 7.5 + playerStats.upgradeSpeed * 0.6;
    this.maxStamina = 100 + playerStats.upgradeStamina * 15;
    this.stamina = this.maxStamina;

    this.initThree();
    this.buildMap();
    this.initPlayer();
    this.initNPCs();
    this.spawnInitialEntities();

    window.addEventListener('resize', this.onWindowResize);
    this.animate(0);
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdde2f3); // Soft sky light blue
    this.scene.fog = new THREE.FogExp2(0xdde2f3, 0.015);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 18, 18);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear container and append
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    this.scene.add(dirLight);
  }

  private buildMap() {
    // 1. Main Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(60, 10);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x353a45 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -4);
    road.receiveShadow = true;
    this.scene.add(road);

    // Road Stripes
    for (let x = -28; x <= 28; x += 4) {
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
    const sidewalkGeo = new THREE.BoxGeometry(60, 0.4, 16);
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f9 });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(0, 0.2, 5);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    // Curb edge yellow line
    const curbGeo = new THREE.BoxGeometry(60, 0.42, 0.3);
    const curbMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.21, -2.85);
    this.scene.add(curb);

    // 3. Buildings & Props in Background
    const buildingColors = [0xfe6b00, 0x006399, 0xffd700, 0xba1a1a, 0x705d00];
    for (let x = -25; x <= 25; x += 9) {
      const h = 6 + Math.random() * 6;
      const bGeo = new THREE.BoxGeometry(7, h, 6);
      const color = buildingColors[Math.abs(x) % buildingColors.length];
      const bMat = new THREE.MeshLambertMaterial({ color });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(x, h / 2 + 0.4, 12);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Roof trim
      const roofGeo = new THREE.BoxGeometry(7.4, 0.4, 6.4);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x, h + 0.6, 12);
      this.scene.add(roof);
    }

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
    this.playerMesh = this.createStylizedCharacter(0xffd700, 0x006399, true, 'player_male_idle_0');
    this.playerMesh.position.copy(this.playerPos);
    this.scene.add(this.playerMesh);

    // Player position ring under feet
    const ringGeo = new THREE.RingGeometry(0.6, 0.75, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    this.playerRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.playerRingMesh.rotation.x = Math.PI / 2;
    this.playerRingMesh.position.set(0, 0.42, 0);
    this.scene.add(this.playerRingMesh);

    // Call Voice Radius Circle (shows when pressing CHAMAR)
    const callGeo = new THREE.RingGeometry(0.1, 5.0, 32);
    const callMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0 });
    this.callRadiusMesh = new THREE.Mesh(callGeo, callMat);
    this.callRadiusMesh.rotation.x = Math.PI / 2;
    this.callRadiusMesh.position.set(0, 0.43, 0);
    this.scene.add(this.callRadiusMesh);
  }

  private initNPCs() {
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

  private createStylizedCharacter(
    shirtColor: number, 
    pantsColor: number, 
    isPlayer: boolean,
    spriteFrameName?: string
  ): THREE.Group {
    const group = new THREE.Group();

    // 2D Billboard Sprite using real Atlas Frame
    const frameKey = spriteFrameName || (isPlayer ? 'player_male_idle_0' : 'passenger_normal');
    const tex = spriteAtlasManager.getTexture(frameKey);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 2.2, 1);
    sprite.position.y = 1.1;
    group.add(sprite);

    // Subtle base shadow
    const shadowGeo = new THREE.CircleGeometry(0.45, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    return group;
  }

  private spawnInitialEntities() {
    // Spawn initial Taxis
    this.spawnTaxi('VIANA');
    this.spawnTaxi('TALATONA');

    // Spawn initial Passengers
    for (let i = 0; i < 6; i++) {
      this.spawnPassenger();
    }
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
      position: { x: slot.x + 20, y: 0.6, z: slot.z }, // Starts offscreen right
      stopSlot: emptySlotIndex,
      color: '#ffd700',
    };

    this.taxis.push(taxi);

    // Create 3D Mesh for Taxi Van
    const vanMesh = this.createTaxiVanMesh(route);
    vanMesh.position.set(taxi.position.x, taxi.position.y, taxi.position.z);
    this.scene.add(vanMesh);
    this.taxiMeshes.set(id, vanMesh);

    soundManager.playHorn();
  }

  private createTaxiVanMesh(route: RouteType): THREE.Group {
    const group = new THREE.Group();

    // Main Body (Blue Kandongueiro)
    const bodyGeo = new THREE.BoxGeometry(4.2, 1.8, 2.0);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x006399 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    group.add(body);

    // Yellow Stripe along side
    const stripeGeo = new THREE.BoxGeometry(4.22, 0.35, 2.02);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 1.0;
    group.add(stripe);

    // Real Taxi Side Decal from Atlas on Both Sides
    const taxiTex = spriteAtlasManager.getTexture('taxi_normal');
    const decalGeo = new THREE.PlaneGeometry(3.6, 1.6);
    const decalMat = new THREE.MeshBasicMaterial({ map: taxiTex, transparent: true, alphaTest: 0.1 });
    
    const decalFront = new THREE.Mesh(decalGeo, decalMat);
    decalFront.position.set(0, 1.1, 1.02);
    group.add(decalFront);

    const decalBack = new THREE.Mesh(decalGeo, decalMat);
    decalBack.position.set(0, 1.1, -1.02);
    decalBack.rotation.y = Math.PI;
    group.add(decalBack);

    // Destination Sign overlay
    const destKey = route === 'VIANA' ? 'destination_viana' : route === 'TALATONA' ? 'destination_talatona' : 'destination_centro';
    const destTex = spriteAtlasManager.getTexture(destKey);
    const signGeo = new THREE.BoxGeometry(1.6, 0.5, 0.6);
    const signMat = new THREE.MeshBasicMaterial({ map: destTex, transparent: true });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.2, 0);
    group.add(sign);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    const wheelPositions = [
      [-1.3, 0.4, 1.05],
      [1.3, 0.4, 1.05],
      [-1.3, 0.4, -1.05],
      [1.3, 0.4, -1.05],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      group.add(w);
    });

    return group;
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
    };

    this.passengers.push(passenger);

    // Map passenger type to real atlas sprite frame name
    const spriteFrameName = 
      pType === 'APRESSADO' ? 'passenger_apressado' :
      pType === 'INDECISO' ? 'passenger_indeciso' :
      pType === 'OBSERVADOR' ? 'passenger_observador' :
      pType === 'ESPECIAL' ? 'passenger_especial' :
      'passenger_normal';

    const shirtCol = Math.floor(Math.random() * 0xffffff);
    const pantsCol = Math.floor(Math.random() * 0xffffff);
    const pMesh = this.createStylizedCharacter(shirtCol, pantsCol, false, spriteFrameName);
    pMesh.position.set(startX, 0.6, startZ);
    this.scene.add(pMesh);
    this.passengerMeshes.set(id, pMesh);
  }

  // Player Trigger: Call Passengers 📢
  public triggerCallAction() {
    this.isCalling = true;
    this.callPulseTimer = 0.3;
    soundManager.playCall();

    const radius = 5.0 + this.playerStats.upgradeVoice * 0.8;

    // Speak contextual phrase
    const phrases = ['Viana!', 'Talatona!', 'Centro!', 'Entra, entra!', 'Táxi a sair!'];
    soundManager.speakPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

    // Find waiting passengers within radius
    this.passengers.forEach((p) => {
      if (p.state === 'WAITING' || p.state === 'SEARCHING') {
        const dist = Math.hypot(p.position.x - this.playerPos.x, p.position.z - this.playerPos.z);
        if (dist <= radius) {
          p.state = 'FOLLOWING';
          p.followedBy = 'PLAYER';
          this.callbacks.onFloatingText('Acompanhando!', '#ffd700', p.position);
          soundManager.playCoin();
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

      // Check if taxi is now full!
      if (matchingTaxi.currentPassengers >= matchingTaxi.capacity) {
        this.onTaxiFilled(matchingTaxi);
      }
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
    this.callbacks.onFloatingText(`🚐 TÁXI LOTADO! +${bonusKz} Kz`, '#fe6b00', taxi.position);

    soundManager.playTaxiFull();
    soundManager.vibrate(100);

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
    const delta = 0.016; // ~60fps target

    this.updatePlayer(delta);
    this.updateNPCs(delta);
    this.updatePassengers(delta);
    this.updateTaxis(delta);
    this.updateCamera();
    this.updateTimers(delta);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updatePlayer(delta: number) {
    // Stamina drain / recovery
    if (this.isRunning) {
      this.stamina = Math.max(0, this.stamina - this.staminaDrainRate * delta);
      if (this.stamina <= 0) this.isRunning = false;
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRecoveryRate * delta);
    }
    this.callbacks.onStaminaChange(this.stamina, this.maxStamina);

    // Speed calculation
    const currentSpeed = this.isRunning ? this.playerSpeed * 1.5 : this.playerSpeed;

    if (this.inputDir.x !== 0 || this.inputDir.z !== 0) {
      this.playerPos.x += this.inputDir.x * currentSpeed * delta;
      this.playerPos.z += this.inputDir.z * currentSpeed * delta;

      // Clamp player within map boundaries
      this.playerPos.x = Math.max(-26, Math.min(26, this.playerPos.x));
      this.playerPos.z = Math.max(-2, Math.min(11, this.playerPos.z));

      // Rotation
      this.playerRotation = Math.atan2(this.inputDir.x, this.inputDir.z);
      this.playerMesh.rotation.y = this.playerRotation;

      // Leg walk animation
      const legL = this.playerMesh.getObjectByName('legL');
      const legR = this.playerMesh.getObjectByName('legR');
      if (legL && legR) {
        const swing = Math.sin(Date.now() * 0.012) * 0.5;
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
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
    }
  }

  private updateNPCs(delta: number) {
    this.npcs.forEach((npc) => {
      const mesh = this.npcMeshes.get(npc.id);
      if (!mesh) return;

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
          // Move towards passenger
          const dx = targetP.position.x - npc.position.x;
          const dz = targetP.position.z - npc.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 1.0) {
            npc.position.x += (dx / dist) * npc.speed * delta;
            npc.position.z += (dz / dist) * npc.speed * delta;
            mesh.rotation.y = Math.atan2(dx, dz);
          } else {
            // Claim passenger
            targetP.state = 'FOLLOWING';
            targetP.followedBy = npc.id;
            npc.followingPassengerId = targetP.id;
            npc.targetPassengerId = null;
            npc.state = 'LEADING';
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
              npc.position.x += (dx / dist) * npc.speed * delta;
              npc.position.z += (dz / dist) * npc.speed * delta;
              mesh.rotation.y = Math.atan2(dx, dz);
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

      mesh.position.set(npc.position.x, 0.6, npc.position.z);
    });
  }

  private updatePassengers(delta: number) {
    for (let i = this.passengers.length - 1; i >= 0; i--) {
      const p = this.passengers[i];
      const pMesh = this.passengerMeshes.get(p.id);
      if (!pMesh) continue;

      // Patience timer
      if (p.state === 'WAITING' || p.state === 'SEARCHING') {
        p.patience -= delta;
        if (p.patience <= 0) {
          // Passenger leaves in frustration
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
          p.position.x += (dx / dist) * (p.speed * 1.2) * delta;
          p.position.z += (dz / dist) * (p.speed * 1.2) * delta;
          pMesh.rotation.y = Math.atan2(dx, dz);
        }
      }

      // Boarding state
      if (p.state === 'BOARDING') {
        // Disappear into taxi
        this.removePassenger(p, i);
        continue;
      }

      pMesh.position.set(p.position.x, 0.6, p.position.z);
    }
  }

  private removePassenger(p: Passenger, index: number) {
    const mesh = this.passengerMeshes.get(p.id);
    if (mesh) {
      this.scene.remove(mesh);
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
    const targetZ = this.playerPos.z + 18;

    this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.05;
    this.camera.lookAt(this.playerPos.x * 0.6, 0.8, this.playerPos.z - 2);
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
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    soundManager.stopBackgroundRhythm();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
