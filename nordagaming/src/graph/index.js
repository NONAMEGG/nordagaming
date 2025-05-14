import axios from "axios"

const grapHost = axios.create({
  baseURL: import.meta.env.VITE_GRAPH_URL
})

const imagesHost = axios.create({
  baseURL: import.meta.env.VITE_THEWALL_DOWNLOAD_URL
})

export {grapHost, imagesHost};
