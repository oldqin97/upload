/*
 * @Author: qin
 * @Date: 2022-05-02 23:50:38
 * @LastEditTime: 2022-05-03 01:14:32
 * @FilePath: \p-demo\public\hash.worker.js
 *  -> The best way to explain it is to do it
 */
self.importScripts(
  'https://cdn.bootcdn.net/ajax/libs/spark-md5/3.0.2/spark-md5.min.js',
);

self.onmessage = e => {
  const { chunks } = e.data;
  console.log(chunks);
  const spark = new self.SparkMD5.ArrayBuffer();

  let progress = 0;
  let count = 0;

  const loadNext = index => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(chunks[index].file);
    reader.onload = e => {
      count++;
      spark.append(e.target.result);

      if (count == chunks.length) {
        self.postMessage({
          progress: 100,
          hash: spark.end(),
        });
      } else {
        progress += 100 / chunks.length;
        self.postMessage({
          progress,
        });
        loadNext(count);
      }
    };
  };
  loadNext(0);
};
