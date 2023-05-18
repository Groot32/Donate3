import styles from "../styles/Home.module.css"
import { sequence } from "0xsequence"
import { ethers } from "ethers"
import { donate3ContractAddress, donate3Abi } from "../constants/index.js"
import { useNotification } from "@web3uikit/core"
import { useRouter } from "next/router"
import { useEffect, useState, useContext } from "react"
import Slider from "../components/Slider/Slider.js"
import AuthContext from "../context/authContext"
import { EditorState, convertToRaw } from "draft-js"
import dynamic from "next/dynamic" // (if using Next.js or use own dynamic loader)
const Editor = dynamic(() => import("react-draft-wysiwyg").then((mod) => mod.Editor), {
    ssr: false,
})
// import { Editor } from "react-draft-wysiwyg"
import draftToHtml from "draftjs-to-html"
const htmlToDraft = dynamic(() => import("html-to-draftjs").then((mod) => mod.htmlToDraft), {
    ssr: false,
})
// import htmlToDraft from "html-to-draftjs"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

export default function Home() {
    const ctx = useContext(AuthContext)
    const router = useRouter()
    const dispatch = useNotification()
    const [images, setImages] = useState([])
    const [imagesInput, setImagesInput] = useState([])
    const [title, setTitle] = useState()
    const [description, setDescription] = useState("")
    const [goal, setGoal] = useState()
    const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false)
    const [loading, setLoading] = useState(0)
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    const [hasSubmitClicked, setHadSubmitClicked] = useState(false)

    const createEntry = async () => {
        try {
            const imagesCid = []
            for (let i = 0; i < imagesInput.length; i++) {
                const body = new FormData()
                body.append("file", imagesInput[i])
                const resForImageCid = await fetch("/api/create-image-cid", {
                    method: "POST",
                    body: body,
                })
                const jsonOfResForImageCid = await resForImageCid.json()
                const imageCid = jsonOfResForImageCid.cid
                imagesCid.push(imageCid)
                console.log("stored image with cid:", imageCid)
                setLoading((loading) => loading + 1)
            }
            console.log("imagesCid")
            console.log(imagesCid)

            console.log(title)
            console.log(description)
            console.log(
                JSON.stringify({
                    title: title,
                    description: description,
                    images: imagesCid,
                })
            )
            const resForJsonCid = await fetch("/api/create-json-cid", {
                method: "POST",
                body: JSON.stringify({
                    title: title,
                    description: description,
                    images: imagesCid,
                }),
                headers: { "Content-Type": "application/json" },
            })
            const jsonOfResForJsonCid = await resForJsonCid.json()
            setLoading((loading) => loading + 1)
            const jsonCid = jsonOfResForJsonCid.cid
            console.log("stored json with cid:", jsonCid)

            const wallet = sequence.getWallet()
            const signer = wallet.getSigner()

            // Contract Instance
            console.log("Creating Contract Instance")
            console.log("-----------------------------")
            let contractInstance = new ethers.Contract(donate3ContractAddress, donate3Abi, signer)

            console.log("Creating Entry")
            console.log("-----------------------------")

            const parsedAmount = ethers.utils.parseUnits(goal, "ether")
            var tx = await contractInstance.createEntry(jsonCid, parsedAmount)
            setLoading((loading) => loading + 1)

            console.log("tx hash")
            console.log(tx.hash)
            console.log("-----------------------------")

            console.log("tx")
            console.log(tx)
            console.log("-----------------------------")

            const response = await tx.wait()

            console.log("response hash")
            console.log(response.hash)
            console.log("-----------------------------")

            console.log("response")
            console.log(response)
            console.log("-----------------------------")
            const donateEntryEncodedAddress = response.events[1].data
            console.log("-----------------------------")
            console.log("donateEntryEncodedAddress")
            console.log(donateEntryEncodedAddress)
            console.log("-----------------------------")

            const abi = ["event EntryCreated(address donateEntry, address owner)"]
            const iface = new ethers.utils.Interface(abi)
            const donateEntryAddress = iface.decodeEventLog(
                "EntryCreated",
                donateEntryEncodedAddress
            )[0]
            console.log("-----------------------------")

            const createTableEntry = await fetch("/api/create-table-entry", {
                method: "POST",
                body: JSON.stringify({
                    title: title,
                    cid: jsonCid,
                    goal: goal,
                    contractAddress: donateEntryAddress.toString(),
                    owner: await wallet.getAddress(),
                }),
                headers: { "Content-Type": "application/json" },
            })

            console.log("createTableEntry hash")
            console.log(createTableEntry)
            setLoading((loading) => loading + 1)

            dispatch({
                type: "success",
                message: "Entry created with address : " + donateEntryAddress.toString(),
                position: "topR",
            })
            router.push("/")
        } catch (err) {
            throw err
        }
    }

    const handleImageUploads = async (event) => {
        setImages([])
        setImagesInput([])
        const files = event.target.files
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!(file && file["type"].split("/")[0] === "image")) {
                console.log("Invalid image!")
            }
            setImages((oldImages) => [...oldImages, URL.createObjectURL(file)])
        }
        setImagesInput(files)
        console.log(images)
    }

    const handleTitle = async (event) => {
        setTitle(event.target.value)
    }

    const handleDescription = async (event) => {
        setDescription(event.target.value)
    }

    const handleGoal = async (event) => {
        console.log(goal)
        setGoal(event.target.value)
    }
    const handleSubmit = async (event) => {
        if (!ctx.isWalletConnected) {
            dispatch({
                type: "error",
                message: "Please connect the wallet!",
                position: "topR",
            })
            return
        }
        setHadSubmitClicked(true)
        if (
            !(
                !title ||
                title == "" ||
                !description ||
                description == "" ||
                description
                    .replace(/<[^>]+>/g, "")
                    .replaceAll("&nbsp;", "")
                    .trim() == "" ||
                !goal ||
                goal == ""
            )
        ) {
            if (isSubmitButtonDisabled) {
                dispatch({
                    type: "error",
                    message: "Previous submission is already in process!",
                    position: "topR",
                })
                return
            }
            setIsSubmitButtonDisabled(true)
            createEntry()
        }
    }

    useEffect(() => {
        console.log(description)
        console.log("<p></p>")
        console.log("start")
        console.log(
            description
                .replace(/<[^>]+>/g, "")
                .replaceAll("&nbsp;", "")
                .trim() == ""
        )
        console.log("end")
    }, [description])

    return (
        <div className={styles.container}>
            <div>
                <div className="mb-6 mt-5">
                    {hasSubmitClicked && (!title || title == "") ? (
                        <div>
                            <label
                                htmlFor="title"
                                className="block mb-2 text-sm font-medium text-red-700 dark:text-red-500"
                            >
                                Title
                            </label>
                            <input
                                onChange={handleTitle}
                                type="text"
                                id="title"
                                className="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-red-100 dark:border-red-400"
                            />
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                Please enter the title!
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="title"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                                Title
                            </label>
                            <input
                                onChange={handleTitle}
                                type="text"
                                id="title"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <div>
                    {hasSubmitClicked &&
                    (!description ||
                        description == "" ||
                        description
                            .replace(/<[^>]+>/g, "")
                            .replaceAll("&nbsp;", "")
                            .trim() == "") ? (
                        <div>
                            <label
                                htmlFor="description"
                                className="block mb-2 text-sm font-medium text-red-700 dark:text-red-500"
                            >
                                Description
                            </label>

                            <Editor
                                editorState={editorState}
                                wrapperClassName="editor-box border-4 bg-red-50 border border-red-500 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-red-100 dark:border-red-400"
                                editorClassName=""
                                toolbarClassName=""
                                editorStyle={{ height: "24rem", border: "1px solid #C0C0C0" }}
                                onEditorStateChange={(newState) => {
                                    setEditorState(newState)
                                    setDescription(
                                        draftToHtml(
                                            convertToRaw(newState.getCurrentContent())
                                        ).replaceAll("<p></p>", "<p><br></p>")
                                    )
                                }}
                                toolbar={{
                                    inline: { inDropdown: true },
                                    list: { inDropdown: true },
                                    textAlign: { inDropdown: true },
                                    link: { inDropdown: true },
                                    history: { inDropdown: true },
                                }}
                            />
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                Please enter the description!
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="description"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                            >
                                Description
                            </label>

                            <Editor
                                editorState={editorState}
                                wrapperClassName="border-4 editor-box"
                                editorClassName=""
                                toolbarClassName=""
                                editorStyle={{ height: "24rem", border: "1px solid #C0C0C0" }}
                                onEditorStateChange={(newState) => {
                                    setEditorState(newState)
                                    setDescription(
                                        draftToHtml(
                                            convertToRaw(newState.getCurrentContent())
                                        ).replaceAll("<p></p>", "<p><br></p>")
                                    )
                                }}
                                toolbar={{
                                    inline: { inDropdown: true },
                                    list: { inDropdown: true },
                                    textAlign: { inDropdown: true },
                                    link: { inDropdown: true },
                                    history: { inDropdown: true },
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="mb-6 mt-5">
                    {hasSubmitClicked && (!goal || goal == "") ? (
                        <div>
                            <label
                                htmlFor="goal"
                                className="block mb-2 text-sm font-medium text-red-700 dark:text-red-500"
                            >
                                Goal
                            </label>
                            <input
                                onChange={handleGoal}
                                type="text"
                                id="goal"
                                className="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-red-100 dark:border-red-400"
                            />
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                Please enter the Goal!
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="goal"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                                Goal
                            </label>
                            <input
                                onChange={handleGoal}
                                type="text"
                                id="goal"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-center items-center w-full mt-5">
                    <label
                        htmlFor="dropzone-file"
                        className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                        <div className="flex flex-col justify-center items-center pt-5 pb-6">
                            <svg
                                aria-hidden="true"
                                className="mb-3 w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                ></path>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and
                                drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Images : PNG, JPG, etc.
                            </p>
                        </div>
                        <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            multiple={true}
                            accept="image/*"
                            onChange={handleImageUploads}
                        />
                    </label>
                </div>

                {images && images.length != 0 && (
                    <div>
                        <label className="block text-center mt-14 text-sm font-medium text-gray-900 dark:text-gray-400">
                            {images.length} Images Uploaded
                        </label>
                        <Slider images={images} />
                    </div>
                )}
            </div>
            <div className="mt-5">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitButtonDisabled}
                    className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                >
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Submit
                    </span>
                </button>
            </div>
            {isSubmitButtonDisabled && (
                <div className="mt-2 pb-4">
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div
                            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                            style={{
                                width: `${(loading / (images.length + 3)).toFixed(2) * 100}%`,
                            }}
                        >
                            {(loading / (images.length + 3)).toFixed(2) * 100}%
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
