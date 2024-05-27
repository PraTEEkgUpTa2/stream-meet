import { useSocket } from "@/context/socket"
import { cloneDeep } from "lodash"
import { useRouter } from "next/navigation"
import { useState } from "react"

const usePlayer = (myId, roomId,peer) => {
    const [players, setPlayers] = useState({})
    const playersCopy = cloneDeep(players)
    const socket = useSocket()
    const router = useRouter()

    const playersHighlighted = playersCopy[myId]
    delete playersCopy[myId]

    const nonHighlighted = playersCopy

    const leaveRoom = () => {
        socket.emit('user-leave', myId, roomId)
        console.log("leaving room", roomId)
        peer?.disconnect();
        router.push('/')
    }

    const toggleAudio = () => {
        console.log('I toggled my audio')
        setPlayers((prev) => {
          const copy = cloneDeep(prev)
          copy[myId].muted = !copy[myId].muted 
          return {...copy}
        })

        socket.emit('user-toggle-audio', myId, roomId)
    }

    const toggleVideo = () => {
        console.log('I toggled my video')
        setPlayers((prev) => {
          const copy = cloneDeep(prev)
          if (!copy[myId]) {
            copy[myId] = { muted: false, playing: true }; // Initialize if not present
        }
          copy[myId].playing = !copy[myId].playing
          return {...copy}
        })

        socket.emit('user-toggle-video', myId, roomId)
    }
    
    return {players,setPlayers, playersHighlighted, nonHighlighted, toggleAudio, toggleVideo, leaveRoom}
}

export default usePlayer;