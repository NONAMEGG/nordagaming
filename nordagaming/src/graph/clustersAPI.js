import { grapHost } from "./index.js";

export const getCluster = async () => {
  const query = `
  {
    cluster(id: "5612") {
      id
      areas {
        id
        imageCID
        x
        y
      }
    }
  }
  `;

  const response = await grapHost.post("", {query}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      }
  )
  return response.data.data;
}
