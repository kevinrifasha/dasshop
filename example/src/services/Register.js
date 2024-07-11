import instance from "../axios";

export const createUser = async (data) => {
  const response = await instance.post(`membership/auth/register`, data);
  return response.data;
};