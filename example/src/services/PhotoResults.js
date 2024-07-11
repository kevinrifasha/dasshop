import instance from "../axios";

export const getResult = async (id) => {
  const response = await instance.get(`photo-results/?id=${id}`);
  return response.data;
};