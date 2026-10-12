import axios from "axios";

const Axios = axios.create({ baseURL: import.meta.env.PUBLIC_API_URL });

export default Axios;
