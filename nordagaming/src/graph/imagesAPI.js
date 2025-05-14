import { imagesHost } from "./index.js";

export const getImage = async (imageCID) => {
  const response = await imagesHost.get(`${imageCID}`,
    {
      responseType: 'blob'
    }
  );
  return response;
}
