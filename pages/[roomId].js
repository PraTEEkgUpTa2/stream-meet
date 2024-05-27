import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import { useEffect, useState } from "react";

import useMediaStream from "@/hooks/useMediaStream";
import Player from "@/component/player";
import usePlayer from "@/hooks/usePlayer";

import styles from '@/styles/room.module.css'
import { useRouter } from "next/router";
import Bottom from "@/component/Bottom";
import { cloneDeep } from "lodash";

const Room = () => {
  const socket = useSocket()
  const {roomId} = useRouter().query;
  const {peer, myId} = usePeer();
  const {stream} = useMediaStream()
  const {players,setPlayers, playersHighlighted, nonHighlighted , toggleAudio , toggleVideo, leaveRoom} = usePlayer(myId,roomId, peer);

  const [user, setUser] = useState([])
  
  useEffect(() => {
    if(!socket || !peer || !stream) return;
    const handleUserConnected = (newUser) => {
        console.log(`user connected in room with userId ${newUser}`)

        const call = peer.call(newUser, stream)
        call.on('stream', (incomingStream) => {
            console.log(`incoming call from ${newUser}`)
            setPlayers((prev) => ({
                ...prev,
                [newUser] : {
                    url : incomingStream,
                    muted : true,
                    playing : true
                }
            }));

            setUser((prev) => ({
                ...prev,
                [newUser] : call
            }))
        })
    }
    socket?.on('user-connected', handleUserConnected)

    return () => {
        socket.off('user-connected', handleUserConnected)
    }
  }, [socket, peer, stream, setPlayers])

  useEffect(() => {
    if(!socket) return 
    const handleToggleAudio = (userId) => {
        console.log(`user with id ${userId} toggled audio`)
        setPlayers((prev) => {
            const copy = cloneDeep(prev)
           
            copy[userId].muted = !copy[userId].muted;
            return {...copy};
        })
    }

    const handleToggleVideo = (userId) => {
        console.log(`user with id ${userId} toggled audio`)
        setPlayers((prev) => {
            const copy = cloneDeep(prev)
            if (!copy[myId]) {
                copy[myId] = { playing: true }; // Initialize if not present
            }
            copy[userId].playing = !copy[userId].playing;
            return {...copy};
        })
    }

    const handleUserLeave = (userId) => {
        console.log(`user ${userId} is leaving the room`);
        user[userId]?.close()
        const playerCopy = cloneDeep(players);
        delete playerCopy[userId];
        setPlayers(playerCopy)

    }
    socket.on('user-toggle-audio', handleToggleAudio)
    socket.on('user-toggle-video', handleToggleVideo)
    socket.on('user-leave', handleUserLeave)

    return () => {
        socket.off('user-toggle-audio', handleToggleAudio)
        socket.off('user-toggle-video', handleToggleVideo)
        socket.off('user-leave', handleUserLeave)
    }
  }, [socket, setPlayers, user])

  useEffect(() => {
    if(!peer || !stream) return;
    peer.on('call', (call) => {
        const {peer : callerId} = call;
        call.answer(stream);

        call.on('stream', (incomingStream) => {
            console.log(`incoming call from ${callerId}`)
            setPlayers((prev) => ({
                ...prev,
                [callerId] : {
                    url : incomingStream,
                    muted : true,
                    playing : true
                }
            }));

            setUser((prev) => ({
                ...prev,
                [callerId] : call
            }))
        })
    })
  },[peer,stream,setPlayers])

  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  return (
    <>
    <div className={styles.ActivePlayerContainer}>
        {playersHighlighted && (
            <Player 
            url={playersHighlighted.url} 
            muted = {playersHighlighted.muted} 
            playing = {playersHighlighted.playing}  
            isActive    
            />)}
    </div>
    <div className={styles.inActivePlayerContainer}>
    {players && Object.keys(nonHighlighted).map((playerId) => {
        const {url, muted, playing} = nonHighlighted[playerId]
        return <Player 
        url={url} 
        muted = {muted} 
        playing = {playing} 
        key={playerId} 
        isActive = {false}    
        />
    })}
    
    </div>
    <Bottom muted={playersHighlighted?.muted} playing = {playersHighlighted?.playing} toggleAudio = {toggleAudio} toggleVideo = {toggleVideo} leaveRoom = {leaveRoom}/>
    </>
  )

 
}

export default Room;