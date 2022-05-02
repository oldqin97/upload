/*
 * @Author: qin
 * @Date: 2022-05-02 14:22:31
 * @LastEditTime: 2022-05-03 01:32:55
 * @FilePath: \p-demo\src\utils\index.js
 *  -> The best way to explain it is to do it
 */

async function blobToString(blob) {
  return new Promise(resolve => {
    const reader = new FileReader(blob);

    reader.onload = function () {
      const res = reader.result
        .split('')
        .map(v => v.charCodeAt())
        .map(v => v.toString(16).toUpperCase())
        .map(v => v.padStart(2, '0'))
        .join(' ');
      resolve(res);
    };

    reader.readAsBinaryString(blob);
  });
}

async function isGif(file) {
  // 前面6个16进制 '47 49 46 38 39 61' '47 49 46 38 37 61'
  const res = await blobToString(file.slice(0, 6));
  console.log(res);
  const isGif =
    res == '47 49 46 38 39 61' || res == '47 49 46 38 37 61';

  return isGif;
}

async function isPng(file) {
  const ret = await blobToString(file.slice(0, 8));
  console.log(ret);
  const isPng = ret == '89 50 4E 47 0D 0A 1A 0A';
  return isPng;
}

async function isJpg(file) {
  const len = file.size;
  const start = await blobToString(file.slice(0, 2));
  const tail = await blobToString(file.slice(-2, len));
  console.log(start, tail);
  const isJpg = start == 'FF D8' && tail == 'FF D9';
  return isJpg;
}

async function isImage(file) {
  // isGif
  const res =
    (await isGif(file)) || (await isPng(file)) || isJpg(file);

  return res;
}

const CHUNK_SIZE = 1 * 1024 * 1024;
const createFileChunk = (file, size = CHUNK_SIZE) => {
  const chunks = [];
  let cur = 0;

  while (cur < file.size) {
    chunks.push({
      index: cur,
      file: file.slice(cur, cur + size),
    });

    cur += size;
  }

  return chunks;
};

export { isImage, createFileChunk };
