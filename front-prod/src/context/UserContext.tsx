"use client";
import React, {createContext, useContext, useEffect, useState} from "react";
import {useUser} from "@clerk/nextjs";

interface UserContextType {
    userId: string | null;
    username: string | null;
}

const UserContext = createContext<UserContextType>({
    userId: null,
    username: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {user} = useUser();
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        setUserId(user?.id || null);
        setUsername(user?.username || user?.primaryEmailAddress?.emailAddress || null);
    }, [user]);

    return (
        <UserContext.Provider value={{userId, username}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
