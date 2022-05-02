<!--
 * @Author: qin
 * @Date: 2022-05-01 12:46:22
 * @LastEditTime: 2022-05-01 21:34:15
 * @FilePath: \vueProject\p-demo\src\App.vue
 *  -> The best way to explain it is to do it
-->
<template>
  <div id="nav">
    <router-link to="/login">Login</router-link> |
    <router-link to="/register">Register</router-link> |
    <router-link to="/uc">UserCenter</router-link> |
    <!-- <router-link to="/upload">Upload</router-link> | -->
  </div>
  <router-view />
</template>

<style lang="scss">
#app {
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
