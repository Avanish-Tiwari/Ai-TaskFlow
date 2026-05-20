import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext=createContext();


export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [token,setToken]=useState(localStorage.getItem("token"));
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        const savedUSer=localStorage.getItem("user");
        if(savedUSer) setUser(JSON.parse(savedUSer));
        setLoading(false);
    },[]);
    const login=(userData,tokenData)=>{
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("user",JSON.stringify(userData));
        localStorage.setItem("token",tokenData);
    }
    const logout=()=>{
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token")
    }
    return(
        <AuthContext.Provider value={{user,token,loading,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth=()=>useContext(AuthContext);
