// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { tableName } from "../../constants"
import { Wallet, providers } from "ethers"
import { connect } from "@tableland/sdk"
import { ethers } from "ethers"
// import fs from "fs"

// async function createTable() {
//     console.log("inside create table")
//     const privateKey = process.env.PRIVATE_KEY
//     const wallet = new Wallet(privateKey)

//     // An RPC provider must be provided to establish a connection to the chain
//     // const provider = new providers.AlchemyProvider("goerli", "ALCHEMY_API_KEY")
//     const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
//     // By default, `connect` uses the Tableland testnet validator;
//     // it will sign a message using the associated wallet
//     const signer = wallet.connect(provider)
//     const tableland = await connect({ network: "testnet", chain: "polygon-mumbai", signer: signer })

//     // Create a new table with a supplied SQL schema and optional `prefix`
//     // @return {Connection} Connection object, including the table's `name`
//     const { name } = await tableland.create(
//         `cid text, contractAddress text, title text, goal text, amountReceived text, owner text, id INTEGER PRIMARY KEY`, // Table schema definition
//         {
//             prefix: `donate3`, // Optional `prefix` used to define a human-readable string
//         }
//     )

//     //	The table's `name` is in the format `{prefix}_{chainId}_{tableId}`
//     console.log(name) // e.g., mytable_4_1

//     fs.writeFileSync("./constants/tableName.json", JSON.stringify({ name: name }))
//     return name
// }

export default async function handler(req, res) {
    let name = tableName.name
    if (req.method === "POST") {
        const privateKey = process.env.PRIVATE_KEY
        const wallet = new Wallet(privateKey)

        // An RPC provider must be provided to establish a connection to the chain
        // const provider = new providers.AlchemyProvider("goerli", "ALCHEMY_API_KEY")
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
        // By default, `connect` uses the Tableland testnet validator;
        // it will sign a message using the associated wallet
        const signer = wallet.connect(provider)
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        })

        const { cid, contractAddress, title, goal, owner } = req.body

        const writeRes = await tableland.write(
            `INSERT INTO ${name} (cid, contractAddress, title, goal, amountReceived, owner) VALUES ('${cid}','${contractAddress}','${title}','${goal}','0', '${owner}');`
        )
        res.status(201).json({ result: writeRes })
    }
}
