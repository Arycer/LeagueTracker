"use client";
import React, {createContext, useContext, useEffect, useState, useCallback} from "react";
import {useAuth,useUser} from "@clerk/nextjs";

interface UserContextType {
    userId: string | null;
    username: string | null;
    lolVersion: string | null;
}

const UserContext = createContext<UserContextType>({
    userId: null,
    username: null,
    lolVersion: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useUser();
    const {getToken} = useAuth();
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    // Eliminamos la variable jwt que no se usa
    const [, setJwt] = useState<string | null>(null);
    const [lolVersion, setLolVersion] = useState<string | null>(null);

    const fetchToken = useCallback(async () => {
        const token = await getToken({template: 'DefaultJWT'});
        setJwt(token);
    }, [getToken, setJwt]);

    useEffect(() => {
        console.log("Updating user context");
        setUserId(user?.id || null);
        setUsername(user?.username || user?.primaryEmailAddress?.emailAddress || null);
        fetchToken();
    }, [user, getToken, fetchToken]);

    // Obtener la versión de LoL solo una vez
    useEffect(() => {
        let mounted = true;
        fetch('http://localhost:8080/api/lol/version/latest')
            .then(res => res.json())
            .then((data) => {
                if (mounted) setLolVersion(typeof data === 'string' ? data : data.version || null);
            })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    return (
        <UserContext.Provider value={{userId, username, lolVersion}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
