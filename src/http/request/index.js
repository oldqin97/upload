/*
 * @Author: qin
 * @Date: 2022-05-01 12:51:35
 * @LastEditTime: 2022-05-01 18:35:24
 * @FilePath: \vueProject\p-demo\src\http\request\index.js
 *  -> The best way to explain it is to do it
 */
import axios from 'axios';

class Request {
  constructor(config) {
    this.instance = axios.create(config);

    // + token
    this.instance.interceptors.request.use(
      config => {
        // console.log(config);
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      err => {
        return err;
      },
    );

    this.instance.interceptors.response.use(
      res => {
        // console.log(res);
        return res.data;
      },
      err => {
        return err;
      },
    );
  }

  request(config) {
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  get(config) {
    return this.request({ ...config, method: 'GET' });
  }
  post(config) {
    return this.request({ ...config, method: 'POST' });
  }
  delete(config) {
    return this.request({ ...config, method: 'DELETE' });
  }
  patch(config) {
    return this.request({ ...config, method: 'PATCH' });
  }
}

export default Request;
