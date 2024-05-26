import { cloneDeep } from "lodash"
import { useState } from "react"

const usePlayer = (myId) => {
    const [players, setPlayers] = useState({})
    const playersCopy = cloneDeep(players)

    const playersHighlighted = playersCopy[myId]
    delete playersCopy[myId]

    const nonHighlighted = playersCopy
    
    return {players,setPlayers, playersHighlighted, nonHighlighted}
}

export default usePlayer;