import instance from "../axios";

export const craeteReview = async (data) => {
  const response = await instance.post(`photo-results/customer-reviews`, data);
  return response.data;
};