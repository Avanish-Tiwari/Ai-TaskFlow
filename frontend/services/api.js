import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ,
    headers: {
        "Content-Type": "application/json"
    }
});

//attaching JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

// auth

export const registerUser = (data) => API.post("/auth/register", data);

export const loginUser = (data) => API.post("/auth/login", data);




//tasks 

export const getTasks = () => API.get("/tasks");

export const createTask = (data) => API.post("/tasks", data);

export const updateTask=(id,data)=>API.patch(`/tasks/${id}`,data);

export const deleteTask=(id)=>API.delete(`/tasks/${id}`)

//ai 

export const categorizeTask=(text)=>API.post("/ai/categorize",{text});
export const suggestTasks=()=>API.post("/ai/suggest");
export const getTaskTip=(taskId)=>API.post("/ai/tip",{taskId});
export const analyzeTasks=()=>API.post("/ai/analyze")


export default API;
