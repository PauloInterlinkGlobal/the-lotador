/**
 * LOTADOR - Building & Urban Background Manager
 *
 * Procedural and architectural rendering of Angolan urban establishments
 * and buildings along the Luanda paragem (street background):
 * - Cantinas de bairro ("Cantina do Mamadou", "Cantina da Mamã", "Cantina Tio Zé")
 * - Lojas & Armazéns ("Armazém de Alimentos", "Loja de Peças Luanda")
 * - Supermercados ("Supermercado Nosso Super", "Kero Express")
 * - Prédios residenciais com andares, janelas alinhadas, e ar condicionado
 *
 * Provides pixel-perfect Canvas 2D facade rendering with authentic drop shadows,
 * detailed window grids with glass reflections, commercial awnings (toldos),
 * illuminated store signage, and 3D geometric depth (awnings, signs, roof tanks).
 */

import * as THREE from 'three';

export type BuildingType = 'cantina' | 'armazem' | 'supermercado' | 'residencial';

export type DoorType = 'metal_roller' | 'glass_double' | 'wood' | 'warehouse_gate';

export type AwningStyle = 'striped' | 'solid' | 'canopy' | 'none';

export interface BuildingData {
  id: string;
  type: BuildingType;
  name: string;
  subtitle?: string;
  x: number;
  width: number;
  height: number;
  depth: number;
  floors: number;
  windowCols: number;
  wallColorHex: number;
  wallColorCss: string;
  trimColorCss: string;
  plinthColorCss: string;
  doorType: DoorType;
  awningStyle: AwningStyle;
  awningColor1: string;
  awningColor2: string;
  signBgColor: string;
  signTextColor: string;
  signBorderColor: string;
  hasAcUnits?: boolean;
  hasWaterTank?: boolean;
  hasSatelliteDish?: boolean;
}

// Preset library of authentic Luanda street establishments
export const ANGOLAN_BUILDING_PRESETS: Omit<BuildingData, 'id' | 'x'>[] = [
  {
    type: 'cantina',
    name: 'CANTINA DO MAMADOU',
    subtitle: 'Bebidas Frescas • Pão Quente • Salgados',
    width: 7.2,
    height: 7.5,
    depth: 6.0,
    floors: 2,
    windowCols: 3,
    wallColorHex: 0xfe6b00, // Vibrant Luanda terracotta orange
    wallColorCss: '#fe6b00',
    trimColorCss: '#ffd700',
    plinthColorCss: '#3c2310',
    doorType: 'metal_roller',
    awningStyle: 'striped',
    awningColor1: '#d62828',
    awningColor2: '#fdf0d5',
    signBgColor: '#161c28',
    signTextColor: '#ffd700',
    signBorderColor: '#ffd700',
    hasAcUnits: true,
    hasWaterTank: true,
  },
  {
    type: 'supermercado',
    name: 'NOSSO SUPER',
    subtitle: 'Frescos • Mercearia • Padaria • Talho',
    width: 8.0,
    height: 9.0,
    depth: 6.0,
    floors: 3,
    windowCols: 4,
    wallColorHex: 0x006399, // Supermarket blue
    wallColorCss: '#006399',
    trimColorCss: '#ffd700',
    plinthColorCss: '#1a2332',
    doorType: 'glass_double',
    awningStyle: 'solid',
    awningColor1: '#004369',
    awningColor2: '#ffd700',
    signBgColor: '#ffd700',
    signTextColor: '#006399',
    signBorderColor: '#ffffff',
    hasAcUnits: true,
    hasWaterTank: true,
  },
  {
    type: 'armazem',
    name: 'ARMAZÉM DE ALIMENTOS',
    subtitle: 'Comércio Geral • Venda a Grosso & Retalho',
    width: 7.6,
    height: 6.8,
    depth: 6.0,
    floors: 2,
    windowCols: 3,
    wallColorHex: 0x705d00, // Industrial warm ochre
    wallColorCss: '#b3951f',
    trimColorCss: '#161c28',
    plinthColorCss: '#262000',
    doorType: 'warehouse_gate',
    awningStyle: 'canopy',
    awningColor1: '#262a33',
    awningColor2: '#ffd700',
    signBgColor: '#161c28',
    signTextColor: '#ffffff',
    signBorderColor: '#fe6b00',
    hasAcUnits: false,
    hasWaterTank: true,
  },
  {
    type: 'cantina',
    name: 'CANTINA DA MAMÃ',
    subtitle: 'Comida Caseira • Sumos Naturais • Recargas',
    width: 7.0,
    height: 7.0,
    depth: 6.0,
    floors: 2,
    windowCols: 3,
    wallColorHex: 0xffd700, // Sunny warm yellow
    wallColorCss: '#f4c430',
    trimColorCss: '#ba1a1a',
    plinthColorCss: '#543b00',
    doorType: 'wood',
    awningStyle: 'striped',
    awningColor1: '#008751',
    awningColor2: '#ffffff',
    signBgColor: '#ba1a1a',
    signTextColor: '#ffffff',
    signBorderColor: '#ffd700',
    hasAcUnits: true,
    hasWaterTank: false,
    hasSatelliteDish: true,
  },
  {
    type: 'residencial',
    name: 'EDIFÍCIO MUTAMBA',
    subtitle: 'Habitação & Comércio',
    width: 7.8,
    height: 10.5,
    depth: 6.0,
    floors: 3,
    windowCols: 4,
    wallColorHex: 0xd97757, // Pastel salmon terracotta
    wallColorCss: '#d97757',
    trimColorCss: '#f8eedb',
    plinthColorCss: '#4a251a',
    doorType: 'wood',
    awningStyle: 'none',
    awningColor1: '#4a251a',
    awningColor2: '#ffffff',
    signBgColor: '#3c1d15',
    signTextColor: '#f8eedb',
    signBorderColor: '#ffd700',
    hasAcUnits: true,
    hasWaterTank: true,
    hasSatelliteDish: true,
  },
  {
    type: 'armazem',
    name: 'LOJA DE PEÇAS LUANDA',
    subtitle: 'Auto • Acessórios • Baterias • Pneus',
    width: 7.4,
    height: 7.2,
    depth: 6.0,
    floors: 2,
    windowCols: 3,
    wallColorHex: 0xba1a1a, // Crimson red
    wallColorCss: '#ba1a1a',
    trimColorCss: '#161c28',
    plinthColorCss: '#400000',
    doorType: 'metal_roller',
    awningStyle: 'canopy',
    awningColor1: '#161c28',
    awningColor2: '#fe6b00',
    signBgColor: '#161c28',
    signTextColor: '#ffd700',
    signBorderColor: '#ffffff',
    hasAcUnits: true,
    hasWaterTank: true,
  },
  {
    type: 'supermercado',
    name: 'KERO EXPRESS',
    subtitle: 'Conveniência 24h • Padaria • Take Away',
    width: 8.2,
    height: 9.6,
    depth: 6.0,
    floors: 3,
    windowCols: 4,
    wallColorHex: 0x008751, // Green corporate
    wallColorCss: '#008751',
    trimColorCss: '#ffd700',
    plinthColorCss: '#0a3821',
    doorType: 'glass_double',
    awningStyle: 'solid',
    awningColor1: '#005a36',
    awningColor2: '#ffd700',
    signBgColor: '#ffffff',
    signTextColor: '#ba1a1a',
    signBorderColor: '#ffd700',
    hasAcUnits: true,
    hasWaterTank: true,
  },
  {
    type: 'cantina',
    name: 'CANTINA TIO ZÉ',
    subtitle: 'Gelo • Bebidas • Tabacaria • Carvão',
    width: 7.0,
    height: 7.2,
    depth: 6.0,
    floors: 2,
    windowCols: 3,
    wallColorHex: 0x1f77b4, // Vibrant Luanda Blue
    wallColorCss: '#1f77b4',
    trimColorCss: '#ffd700',
    plinthColorCss: '#0f3856',
    doorType: 'metal_roller',
    awningStyle: 'striped',
    awningColor1: '#fe6b00',
    awningColor2: '#ffffff',
    signBgColor: '#161c28',
    signTextColor: '#ffd700',
    signBorderColor: '#ffd700',
    hasAcUnits: true,
    hasWaterTank: false,
    hasSatelliteDish: true,
  },
];

export class BuildingManager {
  private static textureCache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates a complete city block of styled Angolan buildings for LOTADOR.
   * Returns an array of Three.js Groups ready to be added to the scene.
   */
  public static generateCityBackground(
    startX = -27,
    endX = 29,
    stepX = 8.0,
    zPos = 12.0
  ): THREE.Group[] {
    const groups: THREE.Group[] = [];
    let presetIdx = 0;

    for (let x = startX; x <= endX; x += stepX) {
      const preset = ANGOLAN_BUILDING_PRESETS[presetIdx % ANGOLAN_BUILDING_PRESETS.length];
      presetIdx++;

      const buildingData: BuildingData = {
        ...preset,
        id: `building_${preset.type}_${Math.round(x)}`,
        x,
      };

      const buildingGroup = this.createBuildingMeshGroup(buildingData, zPos);
      groups.push(buildingGroup);
    }

    return groups;
  }

  /**
   * Creates the 3D Group for a building:
   * - Main structural block
   * - Front facade textured via Canvas 2D with windows, doors, signs and awnings
   * - Projecting 3D awning canopy extending over sidewalk with shadow
   * - Projecting 3D signboard with trim
   * - Parapet roof capping and rooftop props (water tanks, antennas)
   */
  public static createBuildingMeshGroup(data: BuildingData, zPos: number): THREE.Group {
    const group = new THREE.Group();
    group.name = data.id;

    const { width, height, depth } = data;
    const yCenter = height / 2 + 0.4; // 0.4 is sidewalk surface offset

    // 1. Base Building Geometry
    const bGeo = new THREE.BoxGeometry(width, height, depth);

    // Front face faces -Z in this Three.js coordinate system (towards camera and sidewalk)
    // BoxGeometry material order: [right (+X), left (-X), top (+Y), bottom (-Y), back (+Z), front (-Z)]
    const sideWallMat = new THREE.MeshLambertMaterial({
      color: data.wallColorHex,
    });
    const roofTopMat = new THREE.MeshLambertMaterial({
      color: 0x4a5568,
    });
    const floorBottomMat = new THREE.MeshBasicMaterial({
      color: 0x1a202c,
    });

    const frontFacadeTex = this.getBuildingFacadeTexture(data);
    const frontFacadeMat = new THREE.MeshLambertMaterial({
      map: frontFacadeTex,
    });

    const materials: THREE.Material[] = [
      sideWallMat, // +X right
      sideWallMat, // -X left
      roofTopMat,  // +Y top
      floorBottomMat, // -Y bottom
      sideWallMat, // +Z back
      frontFacadeMat, // -Z front (faces sidewalk & camera!)
    ];

    const buildingMesh = new THREE.Mesh(bGeo, materials);
    buildingMesh.position.set(0, yCenter, 0);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    group.add(buildingMesh);

    // 2. Roof Trim Parapet
    const roofGeo = new THREE.BoxGeometry(width + 0.4, 0.45, depth + 0.4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, height + 0.6, 0);
    roof.castShadow = true;
    group.add(roof);

    // 3. 3D Projecting Awning (Toldo com volume e sombra)
    if (data.awningStyle !== 'none') {
      const awning3D = this.create3DAwning(data);
      awning3D.position.set(0, 0, -depth / 2); // At the front facade surface
      group.add(awning3D);
    }

    // 4. 3D Rooftop Props (Water Tank / Caixa d'água / Satellite Dish)
    const roofProps = this.createRooftopProps(data, height + 0.8);
    group.add(roofProps);

    // Position entire building group in world
    group.position.set(data.x, 0, zPos);

    return group;
  }

  /**
   * Generates or retrieves the cached Canvas 2D texture for the building facade.
   */
  public static getBuildingFacadeTexture(data: BuildingData): THREE.CanvasTexture {
    const cacheKey = `${data.type}_${data.name}_${data.width}_${data.height}_${data.floors}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    // High-resolution texture for crisp display
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.drawBuildingFacade(ctx, canvas.width, canvas.height, data);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Master Canvas 2D facade drawing routine:
   * 1. Wall plaster & stucco background
   * 2. Ground floor plinth & commercial storefront (doors, shopfront vitrines)
   * 3. Architectural floor mouldings
   * 4. Multi-floor window grids with glass reflections and frames
   * 5. Commercial signage board with typography
   * 6. 2D awning with shadow and highlights
   * 7. Rooftop decorative cornice
   */
  public static drawBuildingFacade(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    ctx.clearRect(0, 0, w, h);

    // 1. Base Wall Background with vertical stucco gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
    wallGrad.addColorStop(0, this.adjustBrightness(data.wallColorCss, 1.15));
    wallGrad.addColorStop(0.6, data.wallColorCss);
    wallGrad.addColorStop(1, this.adjustBrightness(data.wallColorCss, 0.82));
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle architectural column trims on left & right building edges
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, 16, h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w - 16, 0, 16, h);

    // 2. Concrete Plinth / Rodapé na base (street contact)
    const plinthH = h * 0.05;
    ctx.fillStyle = data.plinthColorCss;
    ctx.fillRect(0, h - plinthH, w, plinthH);
    // Plinth bevel highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, h - plinthH, w, 3);

    // Determine vertical layout:
    // Ground floor takes bottom 36% of the height
    const groundFloorTop = h * 0.62;
    const groundFloorH = h - groundFloorTop - plinthH;

    // 3. Storefront (Rés-do-Chão)
    this.drawStorefront(ctx, 0, groundFloorTop, w, groundFloorH, data);

    // 4. Floor dividing cornice (Friso entre rés-do-chão e pisos superiores)
    const corniceY = groundFloorTop - 12;
    ctx.fillStyle = '#161c28';
    ctx.fillRect(0, corniceY, w, 12);
    ctx.fillStyle = data.trimColorCss;
    ctx.fillRect(0, corniceY + 2, w, 6);
    // Cornice shadow onto wall below
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, corniceY + 12, w, 8);

    // 5. Commercial Signboard (Letreiro principal)
    this.drawSignboard(ctx, w, corniceY - 50, data);

    // 6. Upper Floors Windows (`drawWindows`)
    this.drawWindows(ctx, 0, 45, w, corniceY - 100, data);

    // 7. Roof Parapet Cornice
    this.drawRoofCornice(ctx, w, 38, data);
  }

  /**
   * Draws the commercial storefront / rés-do-chão:
   * Doors, metal roller shutters, display glass vitrines, and storefront pillar framing.
   */
  public static drawStorefront(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    const padX = 36;
    const storeW = w - padX * 2;

    // Storefront backdrop frame
    ctx.fillStyle = '#161c28';
    ctx.fillRect(padX - 8, y, storeW + 16, h);
    ctx.fillStyle = '#262f3f';
    ctx.fillRect(padX - 4, y + 4, storeW + 8, h - 4);

    if (data.type === 'cantina') {
      // CANTINA:
      // Left side: Metal roller shutter entrance
      // Right side: Small service window with display of cold drinks & bread
      const doorW = storeW * 0.44;
      const winW = storeW * 0.44;
      const gap = storeW * 0.12;

      const doorX = padX + 12;
      const winX = doorX + doorW + gap;

      this.drawDoor(ctx, doorX, y + 16, doorW, h - 16, data.doorType);
      this.drawShopDisplayWindow(ctx, winX, y + 26, winW, h * 0.65, 'cantina');

      // Hand-painted specials sign ("PÃO QUENTE", "BEBIDAS FRESCAS")
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PÃO QUENTE • GELO', winX + winW / 2, y + 18);
    } else if (data.type === 'supermercado') {
      // SUPERMERCADO:
      // Center: Double automatic sliding glass doors
      // Left and Right: Large illuminated vitrines with supermarket shelves
      const winW = storeW * 0.28;
      const doorW = storeW * 0.36;
      const leftWinX = padX + 6;
      const doorX = leftWinX + winW + 10;
      const rightWinX = doorX + doorW + 10;

      this.drawShopDisplayWindow(ctx, leftWinX, y + 14, winW, h - 18, 'super_promo');
      this.drawDoor(ctx, doorX, y + 14, doorW, h - 14, 'glass_double');
      this.drawShopDisplayWindow(ctx, rightWinX, y + 14, winW, h - 18, 'super_grocery');

      // Entrance overhead welcoming LED sign
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(doorX + 8, y + 4, doorW - 16, 8);
    } else if (data.type === 'armazem') {
      // LOJA / ARMAZÉM:
      // Wide corrugated industrial gate with yellow/black hazard trim,
      // and side pedestrian entry door.
      const gateW = storeW * 0.68;
      const sideDoorW = storeW * 0.24;
      const gateX = padX + 8;
      const sideX = gateX + gateW + 12;

      this.drawDoor(ctx, gateX, y + 14, gateW, h - 14, 'warehouse_gate');
      this.drawDoor(ctx, sideX, y + 28, sideDoorW, h - 28, 'metal_roller');
    } else {
      // RESIDENCIAL:
      // Elegant residential arched wooden entrance door with transom glass and intercom panel
      const doorW = storeW * 0.40;
      const doorX = padX + (storeW - doorW) / 2;

      // Outer stone portal surround
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(doorX - 10, y + 8, doorW + 20, h - 8);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(doorX - 6, y + 12, doorW + 12, h - 12);

      this.drawDoor(ctx, doorX, y + 18, doorW, h - 18, 'wood');

      // Mailbox / Intercom buzzer panel
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(doorX - 24, y + h * 0.45, 12, 28);
      ctx.fillStyle = '#475569';
      ctx.fillRect(doorX - 22, y + h * 0.45 + 3, 8, 22);

      // Entrance lantern / porch light
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(doorX + doorW / 2, y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draws doors: metal roller shutter, glass sliding doors, wood, or industrial gate.
   */
  public static drawDoor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    type: DoorType
  ): void {
    if (type === 'metal_roller') {
      // Corrugated steel slats
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, y, w, h);

      // Slats
      const slatH = 8;
      for (let sy = y; sy < y + h - 8; sy += slatH) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, sy, w, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x, sy + 2, w, 2);
      }

      // Bottom bar with lift handle and padlock
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 2, y + h - 12, w + 4, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x + w / 2 - 8, y + h - 10, 16, 4);
    } else if (type === 'warehouse_gate') {
      // Heavy warehouse security gate with hazard warning stripes
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, w, h);

      // Corrugated vertical ribs
      for (let rx = x; rx < x + w; rx += 14) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx, y, 3, h - 16);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rx + 3, y, 3, h - 16);
      }

      // Yellow/Black diagonal safety stripes on bottom beam
      const stripeH = 16;
      const stripeY = y + h - stripeH;
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, stripeY, w, stripeH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, stripeY, w, stripeH);
      ctx.clip();
      ctx.strokeStyle = '#161c28';
      ctx.lineWidth = 8;
      for (let sx = x - stripeH; sx < x + w + stripeH; sx += 18) {
        ctx.beginPath();
        ctx.moveTo(sx, stripeY + stripeH);
        ctx.lineTo(sx + stripeH, stripeY);
        ctx.stroke();
      }
      ctx.restore();
    } else if (type === 'glass_double') {
      // Modern double sliding glass doors
      const halfW = w / 2;
      // Dark interior
      ctx.fillStyle = '#09101d';
      ctx.fillRect(x, y, w, h);

      // Glass door panels with blue tint
      for (let i = 0; i < 2; i++) {
        const dx = x + i * halfW + 2;
        const dw = halfW - 4;

        ctx.fillStyle = '#0f2744';
        ctx.fillRect(dx, y + 2, dw, h - 4);

        // Glass reflection highlight
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, y + 2, dw, h - 4);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.moveTo(dx - 10, y + h);
        ctx.lineTo(dx + dw + 10, y);
        ctx.lineTo(dx + dw - 10, y);
        ctx.lineTo(dx - 30, y + h);
        ctx.fill();
        ctx.restore();

        // Aluminum frame
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.strokeRect(dx, y + 2, dw, h - 4);

        // Vertical steel handle bar
        const handleX = i === 0 ? dx + dw - 8 : dx + 8;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(handleX, y + h * 0.35, 4, h * 0.3);
      }
    } else {
      // Wooden door
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x, y, w, h);

      // Decorative raised panels
      const panelW = w * 0.38;
      const panelH = (h - 24) / 3;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const px = x + 6 + col * (panelW + 6);
          const py = y + 6 + row * (panelH + 6);
          ctx.fillStyle = '#3f1d0e';
          ctx.fillRect(px, py, panelW, panelH);
          ctx.fillStyle = '#7a3e20';
          ctx.fillRect(px + 2, py + 2, panelW - 4, panelH - 4);
        }
      }

      // Brass door handle
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x + w * 0.85, y + h * 0.55, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draws a storefront display glass window (vitrine) with internal merchandise silhouettes.
   */
  public static drawShopDisplayWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    theme: 'cantina' | 'super_promo' | 'super_grocery'
  ): void {
    // Dark shop interior
    ctx.fillStyle = '#0b1424';
    ctx.fillRect(x, y, w, h);

    // Interior shelves and silhouette items
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + h * 0.45, w, 4);
    ctx.fillRect(x, y + h * 0.75, w, 4);

    if (theme === 'cantina') {
      // Bottle silhouettes on upper shelf
      ctx.fillStyle = '#ffd700';
      for (let bx = x + 6; bx < x + w - 8; bx += 10) {
        ctx.fillRect(bx, y + h * 0.45 - 14, 6, 14);
      }
      // Bread / crate silhouettes on lower shelf
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 6, y + h * 0.75 - 16, w - 12, 16);
    } else {
      // Supermarket items
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 4, y + h * 0.45 - 12, 12, 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 20, y + h * 0.45 - 12, 14, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 4, y + h * 0.75 - 14, w - 8, 14);
    }

    // Glass reflection diagonal glare
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(x - 20, y + h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - 24, y);
    ctx.lineTo(x - 44, y + h);
    ctx.fill();
    ctx.restore();

    // Aluminum window frame
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Promotional sticker
    if (theme === 'super_promo') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.3, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROMO', x + w * 0.5, y + h * 0.3 + 3);
    }
  }

  /**
   * Draws upper floors window grids (`drawWindows`):
   * Detailed multi-pane windows with molded outer sills, glass glare reflections,
   * curtains, and air conditioner (AC) compressor units.
   */
  public static drawWindows(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    totalW: number,
    availH: number,
    data: BuildingData
  ): void {
    const floors = Math.max(1, data.floors - 1); // Floors above ground floor
    const cols = data.windowCols;

    const floorH = availH / floors;
    const colW = totalW / cols;

    const winW = colW * 0.56;
    const winH = floorH * 0.55;

    for (let f = 0; f < floors; f++) {
      const rowY = startY + f * floorH + (floorH - winH) / 2;

      for (let c = 0; c < cols; c++) {
        const colX = startX + c * colW + (colW - winW) / 2;

        // Window Frame Sill (Peitoril em relevo com sombra)
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(colX - 4, rowY + winH, winW + 8, 5); // Sill shadow
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(colX - 4, rowY + winH - 2, winW + 8, 4); // Sill stone

        // Outer molded lintel / header
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(colX - 2, rowY - 4, winW + 4, 4);

        // Window Glass background (dark with sky reflections)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(colX, rowY, winW, winH);

        // Glass pane blue gradient
        const glassGrad = ctx.createLinearGradient(colX, rowY, colX, rowY + winH);
        glassGrad.addColorStop(0, '#38bdf8');
        glassGrad.addColorStop(0.35, '#0284c7');
        glassGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = glassGrad;
        ctx.fillRect(colX + 2, rowY + 2, winW - 4, winH - 4);

        // Curtains / blinds on some windows
        if ((f + c) % 2 === 0) {
          ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
          ctx.fillRect(colX + 3, rowY + 3, (winW - 6) * 0.35, winH - 6);
        } else if ((f * 2 + c) % 3 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(colX + winW - (winW - 6) * 0.35 - 3, rowY + 3, (winW - 6) * 0.35, winH - 6);
        }

        // Glass reflection diagonal slash
        ctx.save();
        ctx.beginPath();
        ctx.rect(colX + 2, rowY + 2, winW - 4, winH - 4);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(colX - 10, rowY + winH);
        ctx.lineTo(colX + winW, rowY);
        ctx.lineTo(colX + winW - 14, rowY);
        ctx.lineTo(colX - 24, rowY + winH);
        ctx.fill();
        ctx.restore();

        // Window Mullions (Grades / Caixilharia 2x2)
        ctx.fillStyle = '#ffffff';
        // Vertical mullion
        ctx.fillRect(colX + winW / 2 - 1.5, rowY + 2, 3, winH - 4);
        // Horizontal transom
        ctx.fillRect(colX + 2, rowY + winH * 0.45 - 1.5, winW - 4, 3);

        // External AC Compressor unit under select windows (iconic for Luanda buildings!)
        if (data.hasAcUnits && (f === floors - 1 && (c === 0 || c === cols - 1))) {
          const acW = winW * 0.65;
          const acH = 14;
          const acX = colX + (winW - acW) / 2;
          const acY = rowY + winH + 5;

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(acX - 1, acY + acH, acW + 2, 3);
          // Unit casing
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(acX, acY, acW, acH);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(acX, acY, acW, acH);
          // Fan grill circle
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(acX + acW * 0.3, acY + acH / 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /**
   * Draws commercial signboard with high contrast typography, border trim, and sub-banner.
   */
  public static drawSignboard(
    ctx: CanvasRenderingContext2D,
    w: number,
    y: number,
    data: BuildingData
  ): void {
    const signW = w - 48;
    const signH = 46;
    const signX = (w - signW) / 2;

    // Sign drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(signX + 4, y + 4, signW, signH);

    // Signboard panel body
    ctx.fillStyle = data.signBgColor;
    ctx.fillRect(signX, y, signW, signH);

    // Decorative neon / metallic border
    ctx.strokeStyle = data.signBorderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(signX + 2, y + 2, signW - 4, signH - 4);

    // Mounting bolts on corners
    ctx.fillStyle = '#ffd700';
    [
      [signX + 6, y + 6],
      [signX + signW - 6, y + 6],
      [signX + 6, y + signH - 6],
      [signX + signW - 6, y + signH - 6],
    ].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Primary Store Name Typography
    ctx.fillStyle = data.signTextColor;
    ctx.textAlign = 'center';
    ctx.font = '900 18px "Anybody", "Space Grotesk", sans-serif';
    ctx.fillText(data.name, w / 2, y + 24);

    // Subtitle banner / services
    if (data.subtitle) {
      ctx.fillStyle = data.trimColorCss || '#ffffff';
      ctx.font = 'bold 9px "Work Sans", sans-serif';
      ctx.fillText(data.subtitle.toUpperCase(), w / 2, y + 38);
    }
  }

  /**
   * Draws the decorative roof cornice at the top edge of the building facade.
   */
  public static drawRoofCornice(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    // Heavy parapet wall
    ctx.fillStyle = '#161c28';
    ctx.fillRect(0, 0, w, h);

    // Cornice bands
    ctx.fillStyle = data.trimColorCss;
    ctx.fillRect(0, h - 8, w, 8);

    // Decorative dentils along cornice
    ctx.fillStyle = '#f8fafc';
    const dentilW = 12;
    const dentilGap = 8;
    for (let dx = 10; dx < w - 10; dx += dentilW + dentilGap) {
      ctx.fillRect(dx, h - 16, dentilW, 6);
    }

    // Shadow underneath cornice
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, h, w, 10);
  }

  /**
   * Creates physical 3D Awning / Toldo geometry extending out from the building front face.
   * This gives genuine depth, perspective angle, and real Three.js shadow casting.
   */
  public static create3DAwning(data: BuildingData): THREE.Group {
    const awningGroup = new THREE.Group();
    awningGroup.name = 'building_awning_3d';

    const awningW = data.width * 0.88;
    const awningExt = 1.1; // Extends 1.1m outward towards sidewalk
    const awningDrop = 0.45; // Slants downward

    // Slanted Awning Plane
    const awningGeo = new THREE.PlaneGeometry(awningW, Math.hypot(awningExt, awningDrop));

    // Dynamic procedural striped / solid canvas texture for the awning surface
    const awningCanvas = document.createElement('canvas');
    awningCanvas.width = 256;
    awningCanvas.height = 64;
    const actx = awningCanvas.getContext('2d');

    if (actx) {
      if (data.awningStyle === 'striped') {
        const stripeW = 256 / 10;
        for (let i = 0; i < 10; i++) {
          actx.fillStyle = i % 2 === 0 ? data.awningColor1 : data.awningColor2;
          actx.fillRect(i * stripeW, 0, stripeW, 64);
        }
      } else {
        actx.fillStyle = data.awningColor1;
        actx.fillRect(0, 0, 256, 64);
      }
      // Top edge highlight & bottom edge shade
      actx.fillStyle = 'rgba(255,255,255,0.25)';
      actx.fillRect(0, 0, 256, 6);
      actx.fillStyle = 'rgba(0,0,0,0.3)';
      actx.fillRect(0, 58, 256, 6);
    }

    const awningTex = new THREE.CanvasTexture(awningCanvas);
    awningTex.colorSpace = THREE.SRGBColorSpace;

    const awningMat = new THREE.MeshLambertMaterial({
      map: awningTex,
      side: THREE.DoubleSide,
    });

    const awningMesh = new THREE.Mesh(awningGeo, awningMat);
    // Position at ground floor top
    const awningY = data.height * 0.38 + 0.4;
    // Slant downwards towards street: rotate X
    const angle = Math.atan2(awningDrop, awningExt);
    awningMesh.rotation.x = Math.PI / 2 + angle;
    awningMesh.position.set(0, awningY, -awningExt / 2);
    awningMesh.castShadow = true;
    awningMesh.receiveShadow = true;
    awningGroup.add(awningMesh);

    // Front Valance Flap (Borda drapeada com ondas)
    const valanceGeo = new THREE.PlaneGeometry(awningW, 0.25);
    const valanceMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(data.awningColor1),
      side: THREE.DoubleSide,
    });
    const valanceMesh = new THREE.Mesh(valanceGeo, valanceMat);
    valanceMesh.position.set(0, awningY - awningDrop - 0.12, -awningExt);
    valanceMesh.castShadow = true;
    awningGroup.add(valanceMesh);

    // Support metal struts (hastes de suporte metálicas na parede)
    const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2);
    const strutMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });

    [-awningW * 0.45, 0, awningW * 0.45].forEach((sx) => {
      const strut = new THREE.Mesh(strutGeo, strutMat);
      strut.rotation.x = Math.PI / 4;
      strut.position.set(sx, awningY - 0.4, -awningExt * 0.5);
      awningGroup.add(strut);
    });

    return awningGroup;
  }

  /**
   * Creates authentic rooftop props:
   * - Blue plastic water tank (tanque de água típico de Luanda)
   * - Satellite dish (antena parabólica)
   */
  public static createRooftopProps(data: BuildingData, roofY: number): THREE.Group {
    const propsGroup = new THREE.Group();

    if (data.hasWaterTank) {
      // Iconic Luanda blue water tank (cilindro azul com tampa preta)
      const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16);
      const tankMat = new THREE.MeshLambertMaterial({ color: 0x0055aa });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(-data.width * 0.28, roofY + 0.7, 0.5);
      tank.castShadow = true;
      propsGroup.add(tank);

      // Tank lid
      const lidGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.15, 16);
      const lidMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(-data.width * 0.28, roofY + 1.45, 0.5);
      propsGroup.add(lid);
    }

    if (data.hasSatelliteDish) {
      // Satellite dish
      const dishGroup = new THREE.Group();
      const dishGeo = new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const dishMat = new THREE.MeshLambertMaterial({ color: 0xdde2eb, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = -Math.PI / 3;
      dish.rotation.y = Math.PI / 4;
      dishGroup.add(dish);

      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, -0.4, 0);
      dishGroup.add(pole);

      dishGroup.position.set(data.width * 0.3, roofY + 0.8, -0.5);
      dishGroup.castShadow = true;
      propsGroup.add(dishGroup);
    }

    return propsGroup;
  }

  /**
   * Helper utility to lighten or darken a CSS hex/rgb color string.
   */
  private static adjustBrightness(col: string, factor: number): string {
    const c = new THREE.Color(col);
    c.r = Math.min(1, Math.max(0, c.r * factor));
    c.g = Math.min(1, Math.max(0, c.g * factor));
    c.b = Math.min(1, Math.max(0, c.b * factor));
    return `#${c.getHexString()}`;
  }
}
