import { imagesHost } from "./index.js";

export const getImage = async (imageCID) => {
  const response = await imagesHost.get(`/api/download/${imageCID}`,
    {
      headers: {
        'Content-Type': 'image/jpeg',
      },
      withCredentials: true
    }
  );
  return response;
}
