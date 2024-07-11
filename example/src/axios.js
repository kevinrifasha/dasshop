import ls from 'local-storage';
import axios from 'axios';
const API_KEY =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_DEV_API_URL
    : process.env.REACT_APP_PROD_API_URL;
const instance = axios.create({
  baseURL: API_KEY
});
async function reFetch(originalRequest) {
  const response = await axios({
    method: originalRequest.method,
    url: API_KEY + originalRequest.url,
    headers: originalRequest.headers
  });
  return response;
}
async function reFetchData(originalRequest) {
  const response = await axios({
    method: originalRequest.method,
    url: API_KEY + originalRequest.url,
    data: originalRequest.data,
    headers: originalRequest.headers
  });
  return response;
}

async function reFetchToken(response) {
  const responseT = await axios({
    method: 'POST',
    url: API_KEY + 'auth/reCreate',
    headers: { Authorization: 'Bearer ' + ls.get('skBOToken') }
  });

  if (responseT.data.status === 200) {
    ls.remove('skBOToken');
    ls.set('skBOToken', responseT.data.token);
    const originalRequest = response.config;
    originalRequest.headers['Authorization'] = 'Bearer ' + responseT.data.token;
    if (typeof originalRequest.data === 'undefined') {
      const response = await reFetch(originalRequest);
      return response;
    } else {
      const response = await reFetchData(originalRequest);
      return response;
    }
  }
}

instance.defaults.timeout = 1000000;
instance.interceptors.request.use((config) => {
  config.headers = {};
  if (ls.get('skBOToken')) {
    config.headers['Authorization'] = 'Bearer ' + ls.get('skBOToken');
  } else {
    config.headers['Authorization'] =
      'Bearer QXRvelhmeW54bHUvOWRJLzJ5S04zMTNiV3kzVUNoa00vRVcxNENXQk0yOWNBMlM3Wlk4QlNNU1lhb243VVZqK0tsVmlrYUx0amtDNU9pSzZ2cUh3QU1PSTB0eGtHblFhaTA4YWcvRDl0cnJQV0FaZVNvVWxuSmdXVVQ4a04vTlg';
  }

  return config;
});
instance.interceptors.response.use(
  async function (response) {
    if (
      response.data.status === 401 ||
      response.status !== 200 ||
      typeof response === 'undefined'
    ) {
      // console.log(response)
      const ress = await reFetchToken(response);
      return ress;
    } else {
      return response;
    }
  },
  async function (error) {
    console.log(error);
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      const ress = await reFetchToken(error);
      return ress;
    } else if (error.response.status === 500) {
      console.log(error.response.data.message);
      ls.set("errorMessage", error.response.data.message)
    }
  }
);
export default instance;
