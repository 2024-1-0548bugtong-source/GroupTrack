// @ts-nocheck
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  const ihdr = makeChunk('IHDR', ihdrData);
  const rawData = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 3);
    rawData[rowOffset] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 3;
      const m = Math.floor(size * 0.15);
      const isBorder = x < m || x >= size-m || y < m || y >= size-m;
      if (isBorder) {
        rawData[px] = 190; rawData[px+1] = 30; rawData[px+2] = 120;
      } else {
        rawData[px] = 219; rawData[px+1] = 39; rawData[px+2] = 119;
      }
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return ~crc;
}

const dir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

[16, 48, 128].forEach(s => {
  const png = createPNG(s);
  fs.writeFileSync(path.join(dir, 'icon-' + s + '.png'), png);
  console.log('Created icon-' + s + '.png (' + png.length + ' bytes)');
});
