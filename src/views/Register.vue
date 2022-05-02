<!--
 * @Author: qin
 * @Date: 2022-05-01 14:13:54
 * @LastEditTime: 2022-05-01 17:47:27
 * @FilePath: \vueProject\p-demo\src\views\Register.vue
 *  -> The best way to explain it is to do it
-->
<!--
 * @Author: qin
 * @Date: 2022-05-01 14:13:54
 * @LastEditTime: 2022-05-01 15:10:39
 * @FilePath: \vueProject\p-demo\src\views\Register.vue
 *  -> The best way to explain it is to do it
-->

<template>
  <div>
    <el-form :model="form">
      <el-form-item>
        <el-input placeholder="请输入邮箱" v-model="form.email" />
      </el-form-item>
      <el-form-item>
        <el-input placeholder="请输入昵称" v-model="form.nickname" />
      </el-form-item>
      <el-form-item>
        <img @click="updateCaptcha" :src="captchaUrl" alt="" />
        <el-input placeholder="请输入验证码" v-model="form.code" />
      </el-form-item>
      <el-form-item>
        <el-input
          type="password"
          placeholder="请输入密码"
          v-model="form.password"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click.native.prevent="handleRegister(form)"
          >注册</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import md5 from 'md5';

import request from '../http';

export default defineComponent({
  name: 'Register',
  setup() {
    const captchaUrl = ref('/api/captcha');
    const form = reactive({
      password: 'qwe123',
      email: 'oldqin@163.com',
      nickname: 'qwe',
      code: '',
    });
    const router = useRouter();
    onMounted(() => {
      updateCaptcha();
    });

    const updateCaptcha = () => {
      captchaUrl.value = `/api/captcha?_t=${new Date().getTime()}`;
    };
    const handleRegister = async value => {
      let info = {
        email: value.email,
        nickname: value.nickname,
        passwd: md5(value.password),
        captcha: value.code,
      };

      let res = await request.post({
        url: '/user/register',
        data: info,
      });
      if (res.code === 0) {
        console.log(res);
        ElMessage(res.message);
        router.push('/');
      } else {
        console.log(res.data);
        ElMessage(res.message);
      }
    };
    return {
      form,
      captchaUrl,
      handleRegister,
      updateCaptcha,
    };
  },
});
</script>

<style lang="scss" scoped></style>
