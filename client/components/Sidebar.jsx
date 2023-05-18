import classNames from "classnames"
import Link from "next/link"
import React, { useState, useEffect, useContext } from "react"
import { sequence } from "0xsequence"
import AuthContext from "../context/authContext"
import {
    CollapsIcon,
    SequenceIcon,
    HomeIcon,
    LogoIcon,
    LogoutIcon,
    MyEntriesIcon,
    CreateIcon,
} from "./icons"

const menuItems = [
    { id: 1, label: "Home", icon: HomeIcon, link: "/" },
    { id: 2, label: "My Entries", icon: MyEntriesIcon, link: "/my-entries" },
    { id: 3, label: "Create Entry", icon: CreateIcon, link: "/create-entry" },
]

const Sidebar = ({ setComponentWidth }) => {
    const [toggleCollapse, setToggleCollapse] = useState(false)
    const [isCollapsible, setIsCollapsible] = useState(false)
    const ctx = useContext(AuthContext)
    const [isWalletConnected, setIsWalletConnected] = useState(ctx.isWalletConnected)

    useEffect(() => {
        isConnected()
    }, [])

    const isConnected = async () => {
        console.log("isConnected checking")
        const wallet = sequence.getWallet()
        console.log("isConnected?", wallet.isConnected())
        setIsWalletConnected(wallet.isConnected())
        ctx.setIsWalletConnected(wallet.isConnected())
    }

    async function connectToWallet() {
        let wallet = sequence.getWallet()
        console.log("isConnected?", wallet.isConnected())

        const connectDetails = await wallet.connect({
            app: "donate3",
            authorize: true,
            // And pass settings if you would like to customize further
            // settings: {
            //   theme: "light",
            //   bannerUrl: "https://yoursite.com/banner-image.png",  // 3:1 aspect ratio, 1200x400 works best
            //   includedPaymentProviders: ["moonpay", "ramp"],
            //   defaultFundingCurrency: "matic",
            //   lockFundingCurrencyToDefault: false,
            // }
        })

        console.log("user accepted connect?", connectDetails.connected)
        console.log(
            "users signed connect proof to valid their account address:",
            connectDetails.proof
        )
        console.log("isConnected?", wallet.isConnected())
        setIsWalletConnected(wallet.isConnected())
        ctx.setIsWalletConnected(wallet.isConnected())
    }

    const getChainID = async () => {
        const wallet = sequence.getWallet()
        console.log("chainId:", await wallet.getChainId())

        const provider = wallet.getProvider()
        console.log("provider.getChainId()", await provider.getChainId())

        const signer = wallet.getSigner()
        console.log("signer.getChainId()", await signer.getChainId())
        console.log("accounts")
        console.log(await wallet.getAddress())
    }

    const disconnect = () => {
        console.log("disconnecting")
        const wallet = sequence.getWallet()
        wallet.disconnect()
        setIsWalletConnected(false)
        ctx.setIsWalletConnected(false)
    }

    const wrapperClasses = classNames(
        "h-screen px-4 pt-8 pb-4 bg-slate-600 flex justify-between flex-col fixed",
        {
            ["w-36 md:w-64 lg:w-80"]: !toggleCollapse,
            ["w-20"]: toggleCollapse,
        }
    )

    const collapseIconClasses = classNames("p-4 rounded bg-light-lighter absolute right-0", {
        "rotate-180": toggleCollapse,
    })

    const onMouseEnter = () => {
        setIsCollapsible(true)
    }

    const onMouseLeave = () => {
        setIsCollapsible(false)
    }

    const handleSidebarToggle = () => {
        if (toggleCollapse) {
            setComponentWidth("pl-36 md:pl-64 lg:pl-80")
        } else {
            setComponentWidth("pl-20")
        }
        setToggleCollapse(!toggleCollapse)
    }

    return (
        <div
            className={wrapperClasses}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between relative">
                    <div className="flex items-center pl-1 gap-2 md:gap-4">
                        <LogoIcon />
                        <span
                            className={classNames("mt-2 text-lg font-medium text-text", {
                                hidden: toggleCollapse,
                            })}
                        >
                            Donate3
                        </span>
                    </div>
                    {isCollapsible && (
                        <button className={collapseIconClasses} onClick={handleSidebarToggle}>
                            <CollapsIcon />
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-start mt-24">
                    {!isWalletConnected && (
                        <div
                            onClick={() => connectToWallet()}
                            className={
                                "flex items-center cursor-pointer hover:bg-slate-700 rounded w-full overflow-hidden border border-slate-800 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                            }
                        >
                            <Link href="">
                                <div className="flex py-4 px-3 items-center w-full h-full md:flex-row flex-col">
                                    <div className={"md:w-10 "}>
                                        <SequenceIcon />
                                    </div>
                                    {!toggleCollapse && (
                                        <span
                                            className={classNames(
                                                "text-md font-medium text-text-light text-center md:text-left"
                                            )}
                                        >
                                            Connect with Sequence
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    )}
                    {menuItems.map(({ icon: Icon, ...menu }, index) => {
                        return (
                            <div
                                key={index}
                                className={
                                    "flex items-center cursor-pointer hover:bg-slate-700 rounded w-full overflow-hidden whitespace-nowrap"
                                }
                            >
                                <Link href={menu.link}>
                                    <a className="flex py-4 px-3 items-center w-full h-full md:flex-row flex-col">
                                        <div className={"md:w-10"}>
                                            <Icon />
                                        </div>
                                        {!toggleCollapse && (
                                            <span
                                                className={classNames(
                                                    "text-md font-medium text-text-light"
                                                )}
                                            >
                                                {menu.label}
                                            </span>
                                        )}
                                    </a>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div
                onClick={() => disconnect()}
                className={
                    "flex items-center hover:bg-slate-700 cursor-pointer hover:bg-light-lighter rounded w-full overflow-hidden whitespace-nowrap px-3 py-4"
                }
            >
                {isWalletConnected && (
                    <div className="flex py-4 px-3 items-center w-full h-full md:flex-row flex-col">
                        <div className={"md:w-10"}>
                            <LogoutIcon />
                        </div>
                        {!toggleCollapse && (
                            <span className={classNames("text-md font-medium text-text-light")}>
                                Disconnect
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sidebar
