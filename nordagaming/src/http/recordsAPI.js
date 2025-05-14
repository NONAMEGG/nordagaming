import { host } from "./index.js";

export const fetchRecords = async (limit, page) => {
  const response = await host.get('/api/records', {params: {
    limit, page
  }});
  return response;
}

export const fetchUserRecords = async (id) => {
  const response = await host.get(`/api/records/${id}`);
  return response;
}

export const updateUserRecords = async (user_id, total_score) => {
  const response = await host.put(`/api/records/${user_id}`, { total_score: total_score }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

