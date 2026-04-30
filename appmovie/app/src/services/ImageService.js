import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "image";

class ImageService {
    createImage(formData) {
        return axios.post(BASE_URL, formData);
    }
}

export default new ImageService();