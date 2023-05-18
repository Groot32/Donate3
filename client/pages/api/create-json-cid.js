// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { Web3Storage, File } = require("web3.storage")

export default async function handler(req, res) {
    if (req.method === "POST") {
        const title = req.body.title
        const description = req.body.description
        const images = req.body.images
        const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
        const obj = { title: title, description: description, images: images }

        const buffer = Buffer.from(JSON.stringify(obj))
        const files = [new File([buffer], "donate.json")]

        const cid = await client.put(files)
        res.status(201).json({ cid: cid })
    }
}
