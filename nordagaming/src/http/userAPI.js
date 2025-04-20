import { host } from "./index.js";

export const registration = async (name, email, password) => {
  const response = await host.post('/api/user/registr', {name, email, password});
  return response;
}

export const login = async (email, password) => {
  const response = await host.post('/api/user/login', {email, password});
  return response;
}
