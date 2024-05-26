import { useSocket } from "@/context/socket"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"


const usePeer = () => {
    const socket = useSocket()
    const [peer, setPeer] = useState(null)
    const roomId = useRouter().query.roomId;
    
    // whenever we log on peer we get some id 
    const [myId, setMyId] = useState('')
    const isPeerSet = useRef(false)

    useEffect(() => {
        if(isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;
        let myPeer;
     (async function initPeer(){
        myPeer = new (await import('peerjs')).default()
        setPeer(myPeer)

        myPeer.on('open', (id) => {
            console.log(`your peer id is ${id}`)
            setMyId(id)
            socket?.emit('join-room', roomId, id )
        })
     })()  
    }, [roomId, socket])

    return {
        peer,
        myId
    }
}

export default usePeer;