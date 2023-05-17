const { ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const { Web3Storage, File } = require("web3.storage")
// const { Blob } = require("buffer")

async function createEntry() {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user = accounts[1]
    const chainId = network.config.chainId
    console.log("Chain ID : " + chainId)
    console.log("Creating Donate3 contract")
    const donate3Contract = await ethers.getContract("Donate3")
    console.log("Donate3 contract created")
    console.log("Connecting user to Donate3 contract")
    const donate3 = await donate3Contract.connect(user)
    console.log("User connected to Donate3 contract")
    const { title, description, goal } = networkConfig[chainId]
    console.log("Title : " + title)
    console.log("Description : " + description)
    console.log("Goal : " + goal)

    const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
    const obj = { title: title, description: description }

    // const blob = new Blob([JSON.stringify(obj)], { type: "application/json" })
    // const files = [new File([blob], "hello.json")]

    const buffer = Buffer.from(JSON.stringify(obj))
    const files = [new File([buffer], "donate.json")]

    const cid = await client.put(files)
    console.log("stored files with cid:", cid)
    // const title = networkConfig.title
    // const description = networkConfig.description
    // const goal = networkConfig.goal
    console.log("Creating entry")
    // const tx = await donate3.createEntry(title, description, goal)
    const tx = await donate3.createEntry(cid, goal)
    // console.log("----------------------------------")
    // console.log(tx)
    const response = await tx.wait()
    // console.log("----------------------------------")
    // console.log(response.logs[0].data)
    console.log("address of entry : " + response.events[0].data)
}

createEntry()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
