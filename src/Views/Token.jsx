import axios from "axios";


const decodeToken = async () => {
    const baseUrl = process.env.REACT_APP_BASE_API;
    const token = localStorage.getItem("workerToken");
    try {
        const res = await axios.post(`${baseUrl}/company/token_data`, {token,});
        return res.data.data;
    } catch (error) {
        console.error("Error:", error.message);
    }
};

export { decodeToken }