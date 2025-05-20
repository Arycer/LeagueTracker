"use client";
import React, {createContext, useContext, useEffect, useState} from "react";
import {useAuth,useUser} from "@clerk/nextjs";

interface UserContextType {
    userId: string | null;
    username: string | null;
    jwt: string | null;
}

const UserContext = createContext<UserContextType>({
    userId: null,
    username: null,
    jwt: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useUser();
    const {getToken} = useAuth();
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);

    const fetchToken = async () => {
        const token = await getToken({template: 'DefaultJWT'});
        setJwt(token);
    }

    useEffect(() => {
        setUserId(user?.id || null);
        setUsername(user?.username || user?.primaryEmailAddress?.emailAddress || null);
        fetchToken();
    }, [user]);

    return (
        <UserContext.Provider value={{userId, username, jwt}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
