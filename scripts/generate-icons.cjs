const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

fs.mkdirSync('public/icons', { recursive: true });

function createPNG(width, height, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function drawAppIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.44;
  const dist = Math.hypot(x - cx, y - cy);

  if (dist > r) return [0, 0, 0, 0];

  const t = y / h;
  const bgR = Math.round(10 + t * (0 - 10));
  const bgG = Math.round(25 + t * (99 - 25));
  const bgB = Math.round(47 + t * (153 - 47));

  if (dist > r - (w * 0.04)) {
    return [255, 215, 0, 255];
  }

  const stripeTop = h * 0.48;
  const stripeBottom = h * 0.58;
  if (y >= stripeTop && y <= stripeBottom && Math.abs(x - cx) < w * 0.32) {
    return [255, 215, 0, 255];
  }

  const bodyTop = h * 0.34;
  const bodyBottom = h * 0.68;
  const bodyLeft = cx - w * 0.32;
  const bodyRight = cx + w * 0.32;
  if (x >= bodyLeft && x <= bodyRight && y >= bodyTop && y <= bodyBottom) {
    if (y >= h * 0.36 && y <= h * 0.46) {
      if (x >= cx - w * 0.28 && x <= cx + w * 0.28) {
        return [220, 240, 255, 255];
      }
    }
    return [0, 99, 153, 255];
  }

  const wheelY = h * 0.68;
  const wheelR = w * 0.08;
  const wheel1X = cx - w * 0.20;
  const wheel2X = cx + w * 0.20;
  if (Math.hypot(x - wheel1X, y - wheelY) < wheelR || Math.hypot(x - wheel2X, y - wheelY) < wheelR) {
    return [20, 24, 32, 255];
  }

  return [bgR, bgG, bgB, 255];
}

function drawMaskableIcon(x, y, w, h) {
  const t = y / h;
  const bgR = Math.round(10 + t * (0 - 10));
  const bgG = Math.round(25 + t * (99 - 25));
  const bgB = Math.round(47 + t * (153 - 47));

  const cx = w / 2;
  const cy = h / 2;

  const stripeTop = h * 0.48;
  const stripeBottom = h * 0.56;
  if (y >= stripeTop && y <= stripeBottom && Math.abs(x - cx) < w * 0.26) {
    return [255, 215, 0, 255];
  }

  const bodyTop = h * 0.36;
  const bodyBottom = h * 0.64;
  const bodyLeft = cx - w * 0.26;
  const bodyRight = cx + w * 0.26;
  if (x >= bodyLeft && x <= bodyRight && y >= bodyTop && y <= bodyBottom) {
    if (y >= h * 0.38 && y <= h * 0.46 && x >= cx - w * 0.22 && x <= cx + w * 0.22) {
      return [220, 240, 255, 255];
    }
    return [0, 99, 153, 255];
  }

  const wheelY = h * 0.64;
  const wheelR = w * 0.07;
  const wheel1X = cx - w * 0.16;
  const wheel2X = cx + w * 0.16;
  if (Math.hypot(x - wheel1X, y - wheelY) < wheelR || Math.hypot(x - wheel2X, y - wheelY) < wheelR) {
    return [20, 24, 32, 255];
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Generating PWA icons...');
fs.writeFileSync('public/icons/icon-192x192.png', createPNG(192, 192, drawAppIcon));
fs.writeFileSync('public/icons/icon-512x512.png', createPNG(512, 512, drawAppIcon));
fs.writeFileSync('public/icons/icon-maskable-512x512.png', createPNG(512, 512, drawMaskableIcon));
fs.writeFileSync('public/icons/apple-touch-icon.png', createPNG(180, 180, drawAppIcon));
fs.writeFileSync('public/favicon.ico', createPNG(64, 64, drawAppIcon));
console.log('PWA icons created successfully in public/icons!');
