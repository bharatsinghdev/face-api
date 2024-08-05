import axios from "axios"

const API_BASE = "http://localhost:5000"
const faceApi = {
    get: () => axios.get(API_BASE + '/api/face'),
    upload: (value) => axios.post(API_BASE + '/api/face', value),
}

export default faceApi