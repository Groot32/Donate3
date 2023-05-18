import { useRouter } from "next/router"

export default function ItemCard({ title, goal, amountReceived, contractAddress, cid, owner }) {
    const router = useRouter()
    const handleItemClick = async () => {
        console.log("Item Clicked with title : " + title)
        router.push(
            {
                pathname: `entry/${contractAddress}`,
                query: {
                    title: title,
                    goal: goal,
                    amountReceived: amountReceived,
                    cid: cid,
                    owner,
                },
            },
            `entry/${contractAddress}`,
            { shallow: true }
        )
    }

    return (
        <div
            onClick={handleItemClick}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-center p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
        >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
            </h5>

            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700  h-2.5">
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
            <p
                style={{
                    color: "#000000",
                    fontWeight: 600,
                }}
            >
                {amountReceived} Matic received
            </p>

            <p
                style={{
                    color: "#000000",
                    fontWeight: 600,
                }}
            >
                Goal : {goal} Matic
            </p>
        </div>
    )
}
