<!--
 * @Author: qin
 * @Date: 2022-05-01 18:07:27
 * @LastEditTime: 2022-05-03 03:48:51
 * @FilePath: \p-demo\src\views\Uc.vue
 *  -> The best way to explain it is to do it
-->

<template>
  <div>
    <h1>用户中心</h1>
    <h2>{{ info.email }}</h2>
    <h3>{{ info.nickname }}</h3>
    <div id="drag" ref="dragRef" draggable="true">
      <input type="file" name="file" @change="handleFilerChange" />
    </div>
    <div>
      <el-progress
        :text-inside="true"
        :stroke-width="20"
        :percentage="uploadProgress"
      />
    </div>
    <div>
      <el-progress
        :text-inside="true"
        :stroke-width="20"
        :percentage="hashProgress"
      />
    </div>

    <div>
      <div
        class="cube-container"
        :style="{ width: cubeWidth + 'px' }"
      >
        <div class="cube" v-for="chunk in chunks" :key="chunks.name">
          <div
            :class="{
              uploading: chunk.progress > 0 && chunk.progress < 100,
              success: chunk.progress === 100,
              error: chunk.progress < 0,
            }"
            :style="{ height: chunk.progress + '%' }"
          >
            <i
              class="is-loading"
              style="color: #f56c6c"
              v-if="chunk.progress < 100 && chunk.progress > 0"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button @click="uploadFile">上传</button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  reactive,
  ref,
  computed,
} from 'vue';

import sparkMD5 from 'spark-md5';

import { isImage, createFileChunk } from '../utils';
import request from '../http';
import Worker from '../../public/hash.worker';
import { async } from 'q';

export default defineComponent({
  name: 'Uc',
  setup() {
    const info = reactive({
      email: '',
      nickname: '',
    });

    const fileInfo = ref();
    const dragRef = ref();
    const uploadProgress = ref(0);
    const chunks = ref([]);
    const worker = ref();
    const hashProgress = ref(0);
    const hash = ref(0);

    const cubeWidth = computed(
      () => Math.ceil(Math.sqrt(chunks.value.length)) * 16,
    );

    const newUploadProgress = computed(() => {
      if (!fileInfo.value || chunks.value.length) {
        return 0;
      }
      const loaded = chunks.value
        .map(item => item.chunk.size * item.progress)
        .reduce((acc, cur) => acc + cur, 0);
      return parseInt(
        ((loaded * 100) / fileInfo.value.size).toFixed(2),
      );
    });

    const bindEvent = () => {
      const drag = dragRef.value;

      drag.addEventListener('dragover', e => {
        drag.style.borderColor = 'orange';
        e.preventDefault();
      });
      drag.addEventListener('dragleave', e => {
        drag.style.borderColor = '#eee';
        e.preventDefault();
      });
      drag.addEventListener('drop', e => {
        e.preventDefault();
        const fileList = e.dataTransfer.files;
        fileInfo.value = fileList[0];
      });
    };
    onMounted(async () => {
      bindEvent();
      try {
        const res = await request.get({
          url: 'user/info',
        });
        info.email = res.data.email;
        info.nickname = res.data.nickname;
      } catch (error) {
        console.log(error);
      }
    });

    const handleFilerChange = e => {
      const [file] = e.target.files;

      if (!file) return;

      fileInfo.value = file;
      console.log(fileInfo.value);
    };
    const calculateHashWorker = async chunks => {
      return new Promise(resolve => {
        worker.value = new Worker();
        worker.value.postMessage({ chunks });
        worker.value.onmessage = e => {
          const { progress, hash } = e.data;
          hashProgress.value = Number(progress.toFixed(2));
          if (hash) {
            resolve(hash);
          }
        };
      });
    };

    const calculateHashIdle = async chunks => {
      // const chunks = chunks;
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        let count = 0;

        const appendToSpark = async file => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = e => {
              spark.append(e.target.result);
              resolve();
            };
          });
        };
        const workLoop = async deadline => {
          // timeRemaining获取当前帧的剩余时间
          while (
            count < chunks.length &&
            deadline.timeRemaining() > 1
          ) {
            // 空闲时间，且有任务
            await appendToSpark(chunks[count].file);
            count++;
            if (count < chunks.length) {
              hashProgress.value = Number(
                ((100 * count) / chunks.length).toFixed(0),
              );
            } else {
              hashProgress.value = 100;
              resolve(spark.end());
            }
          }
          window.requestIdleCallback(workLoop);
        };
        // 浏览器一旦空闲，就会调用workLoop
        window.requestIdleCallback(workLoop);
      });
    };

    const calculateHashSample = async () => {
      // 布隆过滤器  判断一个数据存在与否
      // 1个G的文件，抽样后5M以内
      // hash一样，文件不一定一样
      // hash不一样，文件一定不一样
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer();
        const reader = new FileReader();

        const file = fileInfo.value;
        const size = file.size;
        const offset = 2 * 1024 * 1024;
        // 第一个2M，最后一个区块数据全要
        let chunks = [file.slice(0, offset)];

        let cur = offset;
        while (cur < size) {
          if (cur + offset >= size) {
            // 最后一个区快
            chunks.push(file.slice(cur, cur + offset));
          } else {
            // 中间的区块
            const mid = cur + offset / 2;
            const end = cur + offset;
            chunks.push(file.slice(cur, cur + 2));
            chunks.push(file.slice(mid, mid + 2));
            chunks.push(file.slice(end - 2, end));
          }
          cur += offset;
        }
        // 中间的，取前中后各2各字节
        reader.readAsArrayBuffer(new Blob(chunks));
        reader.onload = e => {
          spark.append(e.target.result);
          hashProgress.value = 100;
          resolve(spark.end());
        };
      });
    };

    const uploadChunks = async (uploadList = []) => {
      const AllRequest = chunks.value
        // .filter(chunk => uploadList.indexOf(chunk.name) === -1)
        .map(chunk => {
          const form = new FormData();
          form.append('chunk', chunk.chunk);
          form.append('hash', chunk.hash);
          form.append('name', chunk.name);
          return form;
        })
        .map((form, index) =>
          request.post({
            url: '/uploadfile',
            data: form,
            onUploadProgress: progress => {
              chunks.value[index].progress = Number(
                ((progress.loaded / progress.total) * 100).toFixed(2),
              );
              console.log(chunks.value[index].progress);
            },
          }),
        );

      await Promise.all(AllRequest);
      await mergeRequest();
    };
    const mergeRequest = async () => {
      const res = await request.post({
        url: '/mergefile',
        data: {
          ext: fileInfo.value.name.split('.').pop(),
          size: 1 * 1024 * 1024,
          hash: hash.value,
        },
      });
      // const url = res.data.url
      console.log(res.data);
    };

    const uploadFile = async () => {
      // 格式限制
      // if (!(await isImage(fileInfo.value))) {
      //   ElMessage.warning('不是gif/png/jpg文件');
      //   return;
      // }
      const chunksData = createFileChunk(fileInfo.value);

      // chunks.value = chunksData;

      // console.log(chunks);
      // const hashRes = await calculateHashWorker(chunksData);
      // hash.value = hashRes;
      const hashRes = await calculateHashIdle(chunksData);
      // const hashRes = await calculateHashSample();
      hash.value = hashRes;

      chunks.value = chunksData.map((chunk, index) => {
        const name = hash.value + '-' + index;
        return {
          hash: hash.value,
          name,
          index,
          chunk: chunk.file,
          progress: 0,
        };
      });
      await uploadChunks();
      

      // const form = new FormData();
      // form.append('name', 'file');
      // form.append('file', fileInfo.value);

      // const res = await request.post({
      //   url: '/uploadfile',
      //   data: form,
      //   onUploadProgress: progress => {
      //     uploadProgress.value = Number(
      //       ((progress.loaded / progress.total) * 100).toFixed(2),
      //     );
      //   },
      // });
    };

    return {
      info,
      dragRef,
      uploadProgress,
      hashProgress,
      chunks,
      cubeWidth,
      newUploadProgress,
      handleFilerChange,
      uploadFile,
    };
  },
});
</script>

<style lang="scss" scoped>
#drag {
  height: 100px;

  border: 2px dashed #eee;
  line-height: 100px;
  text-align: center;
  vertical-align: middle;
}

.cube-container {
  .cube {
    width: 15px;
    height: 15px;
    line-height: 12px;
    border: 1px solid #666;
    background-color: #eee;
    float: left;
    .success {
      background-color: green;
    }
    .uploading {
      background-color: blue;
    }
    .error {
      background-color: orangered;
    }
  }
}
</style>
