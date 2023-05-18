import React, { useState } from "react"
const AuthContext = React.createContext({
    isWalletConnected: false,
    setIsWalletConnected: () => {},
})

export const AuthContextProvider = (props) => {
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    return (
        <AuthContext.Provider
            value={{
                isWalletConnected: isWalletConnected,
                setIsWalletConnected: setIsWalletConnected,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContext
