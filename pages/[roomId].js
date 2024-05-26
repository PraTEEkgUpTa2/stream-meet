import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import { useEffect } from "react";

import useMediaStream from "@/hooks/useMediaStream";
import Player from "@/component/player";
import usePlayer from "@/hooks/usePlayer";

import styles from '@/styles/room.module.css'

const Room = () => {
  const socket = useSocket()
  const {peer, myId} = usePeer();
  const {stream} = useMediaStream()
  const {players,setPlayers, playersHighlighted, nonHighlighted} = usePlayer(myId);
  
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
                    muted : false,
                    playing : true
                }
            }))
        })
    }
    socket?.on('user-connected', handleUserConnected)

    return () => {
        socket.off('user-connected', handleUserConnected)
    }
  }, [socket, peer, stream, setPlayers])

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
                    muted : false,
                    playing : true
                }
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
    </>
  )

 
}

export default Room;