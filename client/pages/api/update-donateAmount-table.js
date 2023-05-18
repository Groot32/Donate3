// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { tableName } from "../../constants"
import { Wallet, providers } from "ethers"
import { connect } from "@tableland/sdk"
import { ethers } from "ethers"

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

        const { contractAddress, amountToDonate } = req.body

        const { columns, rows } = await tableland.read(
            `SELECT amountReceived FROM ${name} WHERE contractAddress='${contractAddress}';`
        )
        const currentAmountReceived = rows[0][0]
        const parsedCurrentAmountReceived = ethers.utils.parseUnits(currentAmountReceived, "ether")
        const parsedAmountToDonate = ethers.utils.parseUnits(amountToDonate, "ether")
        const finalAmountReceived = ethers.utils
            .formatEther(parsedCurrentAmountReceived.add(parsedAmountToDonate))
            .toString()
        const writeRes = await tableland.write(
            `UPDATE  ${name} SET amountReceived='${finalAmountReceived}' WHERE contractAddress='${contractAddress}';`
        )
        res.status(201).json({ result: writeRes })
    }
}
