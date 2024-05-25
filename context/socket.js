import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket;
}

export const SocketProvider = (props) => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const connection = io()
        setSocket(connection);
    }, []);

    socket?.on('connect_error', async (err) => {
        console.log("socket error establishing", err)
        await fetch('/api/socket')
    })

    return(
        <SocketContext.Provider value = {socket}>
            {props.children}
        </SocketContext.Provider>
    )

}