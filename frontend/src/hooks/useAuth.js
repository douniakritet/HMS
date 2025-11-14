import axios from "axios";

export const useAuth = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8081/api/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    console.log({data: response.data});
    return { user: response?.data }
}