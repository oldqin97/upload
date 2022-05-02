<!--
 * @Author: qin
 * @Date: 2022-05-01 13:09:13
 * @LastEditTime: 2022-05-01 18:03:22
 * @FilePath: \vueProject\p-demo\src\views\Login.vue
 *  -> The best way to explain it is to do it
-->
<template>
  <div>
    <el-form :model="form">
      <el-form-item>
        <el-input v-model="form.email" placeholder="email" />
      </el-form-item>
      <el-form-item>
        <el-input
          type="password"
          v-model="form.password"
          placeholder="密码"
        />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.verifyCode" placeholder="验证码" />
        <img @click="updateCaptcha" :src="captchaUrl" alt="" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.emailCode" placeholder="邮箱验证码" />
        <el-button
          @click="sendEmailCode"
          :disabled="timer > 0"
          type="primary"
          >{{ sendText }}</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-button @click="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref } from 'vue';
import md5 from 'md5';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import request from '../http';
import { computed } from '@vue/reactivity';
export default defineComponent({
  name: 'Login',
  setup() {
    const captchaUrl = ref('/api/captcha');

    const timer = ref(0);
    const timeout = ref();
    const form = reactive({
      email: 'oldqin@163.com',
      password: 'qwe123',
      verifyCode: '',
      emailCode: '',
    });
    const router = useRouter();

    const sendText = computed(() => {
      if (timer.value === 0) {
        return '发送';
      } else {
        return `${timer.value}s后发送`;
      }
    });

    onMounted(() => {
      updateCaptcha();
    });

    const updateCaptcha = () => {
      captchaUrl.value = `/api/captcha?_t=${new Date().getTime()}`;
    };
    const handleLogin = async () => {
      let info = {
        email: form.email,
        passwd: md5(form.password),
        captcha: form.verifyCode,
        emailcode: form.emailCode,
      };

      let res = await request.post({
        url: '/user/login',
        data: info,
      });
      if (res.code === 0) {
        ElMessage.success('登录成功');
        console.log(res)
        localStorage.setItem('token', res.data.token);
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        console.log(res);
        ElMessage.warning(res.message);
      }
    };

    const sendEmailCode = async () => {
      await request.get({
        url: `/sendcode?email=${form.email}`,
      });
      timer.value = 5;
      timeout.value = setInterval(() => {
        timer.value -= 1;
        if (timer.value === 0) clearInterval(timeout.value);
      }, 1000);
    };

    return {
      form,
      captchaUrl,
      sendText,
      timer,
      updateCaptcha,
      handleLogin,
      sendEmailCode,
    };
  },
});
</script>

<style lang="scss" scoped></style>
