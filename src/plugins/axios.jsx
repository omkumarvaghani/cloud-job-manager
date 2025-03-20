import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    return adminToken;
  }
  const workerToken = localStorage.getItem("workerToken");
  if (workerToken) {
    return workerToken;
  }
  const customerToken = localStorage.getItem("customerToken");
  if (customerToken) {
    return customerToken;
  }
};

const getId = () => {
  const adminId = localStorage.getItem("admin_id");
  if (adminId) {
    return adminId;
  }
  const companyId = localStorage.getItem("CompanyId");
  if (companyId) {
    return companyId;
  }
  const workerId = localStorage.getItem("worker_id");
  if (workerId) {
    return workerId;
  }
  const clientId = localStorage.getItem("CustomerId");
  if (clientId) {
    return clientId;
  }
};

AxiosInstance.interceptors.request.use(async (config) => {
  const token = getToken();
  const id = getId();
  if (token && id) {
    config.headers["authorization"] = `CMS ${token}`;
    config.headers["id"] = `CMS ${id}`;
  }
  return config;
});

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorResponse = "";
    if (error?.response?.data?.data?.error)
      errorResponse = error.response?.data?.data?.error;
    else if (error?.response?.data?.message)
      errorResponse = error.response?.data.message;
    else errorResponse = "Network Problem";
    return Promise.reject(errorResponse);
  }
);

export default AxiosInstance;
