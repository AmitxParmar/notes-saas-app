import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
    baseURL:
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:5000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
})

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login on unauthorized
            /*   if (typeof window !== "undefined") {
                  window.location.href = "/login"
              } */
        }
        return Promise.reject(error)
    },
)

export default api
