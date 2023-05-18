import { useRouter } from "next/router"
import { useNotification } from "@web3uikit/core"
import { sequence } from "0xsequence"
import { ethers } from "ethers"
import { donateEntryAbi, tableName } from "../../../constants/index.js"
import { useEffect, useState, useContext } from "react"
import Slider from "../../../components/Slider/Slider.js"
import { connect } from "@tableland/sdk"
import AuthContext from "../../../context/authContext"
import Loading from "../../../components/Loading.js"
import ThreeDots from "../../../components/ThreeDots.js"

export default function EntryDetail(props) {
    const ctx = useContext(AuthContext)
    const router = useRouter()
    const [title, setTitle] = useState(router.query.title)
    const [goal, setGoal] = useState(router.query.goal)
    const [amountReceived, setAmountReceived] = useState(router.query.amountReceived)
    const [contractAddress, setContractAddress] = useState(router.query.contractAddress)
    const [cid, setCid] = useState(router.query.cid)
    const [owner, setOwner] = useState(router.query.owner)
    const [description, setDescription] = useState("")
    const [imagesCid, setImagesCid] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdateUIStarted, setIsUpdateUIStarted] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [contractBalance, setContractBalance] = useState("0")
    const [donateAmount, setDonateAmount] = useState()
    const [isDonationInProcess, setIsDonationInProcess] = useState(false)
    const dispatch = useNotification()
    useEffect(() => {
        console.log("useEffect")

        setContractAddress(router.query.contractAddress)
        if (!isUpdateUIStarted && contractAddress) {
            updateUI()
        }
    }, [router.query, contractAddress])

    useEffect(() => {
        if (owner) {
            checkOwner()
        }
    }, [owner])

    const checkOwner = async () => {
        const wallet = sequence.getWallet()
        const userAddress = await wallet.getAddress()
        if (owner == userAddress) {
            setIsOwner(true)
            const provider = wallet.getProvider()
            const balance = await provider.getBalance(contractAddress)
            setContractBalance(ethers.utils.formatEther(balance).toString())
        }
    }

    const updateUI = async () => {
        setIsUpdateUIStarted(true)
        const wallet = sequence.getWallet()
        const signer = wallet.getSigner()
        const cidFinal = ""
        if (!title) {
            console.log("title undefined")
            const tableland = await connect({
                network: "testnet",
                chain: "polygon-mumbai",
                signer: signer,
            })
            const name = tableName.name
            const { columns, rows } = await tableland.read(
                `SELECT * FROM ${name} WHERE contractAddress='${contractAddress}';`
            )
            console.log(columns)
            console.log(rows)
            setCid(rows[0][0])
            cidFinal = rows[0][0]
            setTitle(rows[0][2])
            setGoal(rows[0][3])
            setAmountReceived(rows[0][4])
            setOwner(rows[0][5])
        }

        if (cid) {
            cidFinal = cid
        }

        let response = await fetch("https://ipfs.io/ipfs/" + cidFinal + "/donate.json")
        console.log("------------------")
        console.log(response)
        console.log("------------------")
        if (!response.ok) {
            throw new Error(`failed to get ${cid}`)
        }
        const data = await response.json()
        console.log("------------------")
        console.log(data)
        setDescription(data.description)
        setImagesCid(data.images)
        setIsLoading(false)
    }
    function isValidAmount(amount) {
        if (
            !isNumeric(amount) ||
            !amount ||
            amount == "" ||
            isNaN(amount) ||
            amount.toString().indexOf(".") == -1
        ) {
            return false
        }
        return true
    }

    function isNumeric(num) {
        let value1 = num.toString()
        let value2 = parseFloat(num).toString()
        return value1 === value2
    }

    const donateEntry = async (data) => {
        if (!isValidAmount(donateAmount)) {
            dispatch({
                type: "error",
                message: "Inavalid donate amount!",
                position: "topR",
            })
            return
        }
        setIsDonationInProcess(true)
        try {
            const wallet = sequence.getWallet()
            const signer = wallet.getSigner()

            // Contract Instance
            console.log("Creating Contract Instance")
            console.log("-----------------------------")
            let contractInstance = new ethers.Contract(contractAddress, donateEntryAbi, signer)

            console.log("Donating Entry")
            console.log("-----------------------------")
            const parsedAmount = ethers.utils.parseUnits(donateAmount, "ether")
            console.log(parsedAmount)
            const amountToDonate = ethers.utils.formatEther(parsedAmount).toString()
            console.log(amountToDonate)

            // For view function
            var tx = await contractInstance.fund({ value: parsedAmount })
            console.log(tx.hash)

            const addAmountReceivedTable = await fetch("/api/update-donateAmount-table", {
                method: "POST",
                body: JSON.stringify({
                    contractAddress: contractAddress,
                    amountToDonate: amountToDonate,
                }),
                headers: { "Content-Type": "application/json" },
            })

            console.log("addAmountReceivedTable hash")
            console.log(addAmountReceivedTable)

            console.log("Donated!!")

            dispatch({
                type: "success",
                message: "Donated!",
                position: "topR",
            })
            await tx.wait()
            router.reload()
        } catch (err) {
            setIsDonationInProcess(false)
            throw err
        }
        setIsDonationInProcess(false)
    }
    const withdraw = async () => {
        if (contractBalance == "0.0" || parseFloat(contractBalance) == 0) {
            dispatch({
                type: "error",
                message: "Can't Withdraw 0 matic!",
                position: "topR",
            })
            return
        }
        const wallet = sequence.getWallet()
        const signer = wallet.getSigner()
        const provider = wallet.getProvider()
        // Contract Instance
        console.log("Creating Contract Instance")
        console.log("-----------------------------")
        let contractInstance = new ethers.Contract(contractAddress, donateEntryAbi, signer)

        console.log("Donating Entry")
        console.log("-----------------------------")
        // For view function
        var tx = await contractInstance.withdraw()
        console.log(tx.hash)
        await tx.wait()

        dispatch({
            type: "success",
            message: "Withdrawn!",
            position: "topR",
        })
        const balance = await provider.getBalance(contractAddress)
        setContractBalance(ethers.utils.formatEther(balance).toString())
    }

    const handleDonateAmount = async (event) => {
        setDonateAmount(event.target.value)
    }

    return (
        <div>
            {ctx.isWalletConnected ? (
                isLoading ? (
                    <Loading />
                ) : (
                    <div className="p-4">
                        <div className="text-center flex justify-between flex-col md:flex-row mb-4">
                            <div>
                                {isOwner && (
                                    <button
                                        onClick={withdraw}
                                        className=" relative inline-flex items-center justify-center p-0.5 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                                    >
                                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                            Withdraw: {contractBalance}
                                        </span>
                                    </button>
                                )}
                            </div>
                            <div className="text-center flex justify-center mt-2 md:mt-0">
                                <input
                                    type="text"
                                    onChange={handleDonateAmount}
                                    placeholder="matic"
                                    className="block p-2 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                                <button
                                    onClick={donateEntry}
                                    className="relative inline-flex items-center justify-center p-0.5 ml-4 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
                                >
                                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                        Donate
                                    </span>
                                </button>
                            </div>
                        </div>
                        {isDonationInProcess && (
                            <div className="flex justify-center">
                                <span className="bg-red-100 text-red-800 text-xs font-semibold mr-5 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
                                    Donation in process
                                </span>
                                <div className=" self-center">
                                    <ThreeDots />
                                </div>
                            </div>
                        )}
                        <h1 className="text-center mb-8 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                            {title}
                        </h1>
                        <div className="text-center mb-2">
                            <span className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                Owner : {owner}
                            </span>
                        </div>

                        <div className="text-center mb-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                                Contract Address: {contractAddress}
                            </span>
                        </div>

                        <div className="text-center mb-2">
                            <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
                                Goal : {goal} Matic
                            </span>
                        </div>

                        <div className="w-48 m-auto bg-gray-200 rounded-full dark:bg-gray-700  h-2.5 mb-2">
                            <div
                                className={
                                    (amountReceived != 0
                                        ? "bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl"
                                        : "") +
                                    " h-2.5 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                                }
                                style={{ width: (amountReceived / goal) * 100 + "%" }}
                            ></div>
                        </div>

                        <div className="text-center mb-2">
                            <span className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
                                Received: {amountReceived} Matic
                            </span>
                        </div>
                        <div className="my-5 editor-box">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: description,
                                }}
                            />
                        </div>
                        <hr className="my-4 mx-auto w-48 h-1 bg-gray-100 rounded border-0 md:my-10 dark:bg-gray-700"></hr>

                        {imagesCid && imagesCid.length != 0 && (
                            <Slider
                                images={imagesCid.map(
                                    (imageCid) => "https://ipfs.io/ipfs/" + imageCid + "/image"
                                )}
                            />
                        )}
                    </div>
                )
            ) : (
                <div className="text-center m-auto my-16">
                    <span className="bg-red-100 text-red-800 lg:text-5xl md:text-3xl sm:text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
                        Please connect the wallet
                    </span>
                </div>
            )}
        </div>
    )
}
