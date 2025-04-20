import { host } from "./index.js";

export const fetchRecords = async (limit, page) => {
  const response = await host.get('/api/records', {params: {
    limit, page
  }});
  return response;
}

