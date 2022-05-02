/*
 * @Author: qin
 * @Date: 2022-05-01 12:51:26
 * @LastEditTime: 2022-05-03 03:34:45
 * @FilePath: \p-demo\src\http\index.js
 *  -> The best way to explain it is to do it
 */
import Request from './request';

const request = new Request({
  baseURL: '/api',
  timeout: 20000,
});


export default request;
