/*
 * @Author: qin
 * @Date: 2022-05-01 12:47:42
 * @LastEditTime: 2022-05-03 00:21:28
 * @FilePath: \p-demo\vue.config.js
 *  -> The best way to explain it is to do it
 */

module.exports = {
  devServer: {
    port: 3001,
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:7001',
        pathRewrite: {
          '^/api': '',
        },
        secure: false,
        changeOrigin: true,
      },
    },
  },

  configureWebpack: config => {
    config.module.rules.push({
      test: /\.worker.js$/,
      use: {
        loader: 'worker-loader',
        // 允许将内联的 web worker 作为 BLOB
        // options: { inline: 'no-fallback' },
        
      },
    });
  },
};
