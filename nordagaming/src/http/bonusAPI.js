import { host } from "./index.js";

export const validateSpin = async (user_id) => {
  const response = await host.get('/api/bonus/validate', {params: {user_id: user_id}});
  return response;
}

export const bonusSave = async (user_id, bonus) => {
  const response = await host.put('/api/bonus/update', {user_id: user_id, bonus: bonus});
  return response;
}
