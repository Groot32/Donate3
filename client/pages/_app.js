import Head from "next/head"
import { NotificationProvider } from "@web3uikit/core"
import "../styles/globals.css"
import { sequence } from "0xsequence"
import { AuthContextProvider } from "../context/authContext"
import Sidebar from "../components/Sidebar"
import { useState } from "react"

// Configure Sequence wallet
if (typeof window !== "undefined") {
    // Client-side-only code
    const walletAppURL = process.env.REACT_APP_WALLET_APP_URL || "https://sequence.app"
    const network = "mumbai"
    sequence.initWallet(network, { walletAppURL })
}
function MyApp({ Component, pageProps }) {
    const [componentWidth, setComponentWidth] = useState("pl-36 md:pl-64 lg:pl-80")
    return (
        <div>
            <Head>
                <title>Donate3</title>
                <meta name="Donate3" content="Donate using decentralized platform" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <AuthContextProvider>
                <NotificationProvider>
                    <div className="h-screen flex flex-row justify-start">
                        <Sidebar setComponentWidth={setComponentWidth} />
                        <div
                            className={"bg-primary flex-1 p-4 " + componentWidth}
                            style={{ transition: "padding 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
                        >
                            <Component {...pageProps} />
                        </div>
                    </div>
                </NotificationProvider>
            </AuthContextProvider>
        </div>
    )
}

export default MyApp
