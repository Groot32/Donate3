import React, { useState, useEffect, useContext } from "react"
import { sequence } from "0xsequence"
import { tableName } from "../constants/index.js"
import ItemCard from "./ItemCard.js"
import { connect } from "@tableland/sdk"
import AuthContext from "../context/authContext"
import Loading from "./Loading.js"

export default function Item({ myEntries }) {
    const ctx = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(true)
    const [items, setItems] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [isSearched, setIsSearched] = useState(false)
    const [isGetItemsStarted, setIsGetItemsStarted] = useState(false)

    useEffect(() => {
        if (!isGetItemsStarted && ctx.isWalletConnected) {
            getItems()
        }
    }, [ctx.isWalletConnected])

    const getItems = async () => {
        setIsGetItemsStarted(true)

        const wallet = sequence.getWallet()
        const signer = wallet.getSigner()
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        })
        const name = tableName.name
        let result
        if (myEntries) {
            result = await tableland.read(
                `SELECT * FROM ${name} WHERE owner='${await wallet.getAddress()}';`
            )
        } else {
            result = await tableland.read(`SELECT * FROM ${name};`)
        }
        const { columns, rows } = result
        console.log(columns)
        console.log(rows)
        setItems(rows)
        setIsLoading(false)
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!items) {
            return
        }
        setIsSearched(true)
        const searchInput = e.target[0].value
        setSearchResults(
            items.filter((item) => {
                for (let i = 0; i < item.length; i++) {
                    console.log(typeof item[i])
                    console.log(item[i])
                    console.log(item[i].toString())
                    console.log(item[i].toString().includes(searchInput))
                    if (item[i].toString().includes(searchInput)) {
                        return true
                    }
                }
                return false
            })
        )
    }

    return (
        <div>
            {ctx.isWalletConnected ? (
                isLoading ? (
                    <Loading />
                ) : (
                    <div className="ml-3">
                        <form className="flex items-center" onSubmit={handleSearch}>
                            <label htmlFor="simple-search" className="sr-only">
                                Search
                            </label>
                            <div className="relative w-full">
                                <div className="flex absolute inset-y-0 left-2 items-center pointer-events-none">
                                    <svg
                                        aria-hidden="true"
                                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="simple-search"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Search"
                                    required=""
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                                <span className="sr-only">Search</span>
                            </button>
                        </form>

                        {isSearched && (
                            <div>
                                <button
                                    type="button"
                                    className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 mt-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                                    onClick={() => {
                                        setIsSearched(false)
                                    }}
                                >
                                    Reset search results
                                </button>
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                                    {searchResults.length} results found
                                </span>
                            </div>
                        )}

                        <div className="grid gap-6 p-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
                            {isSearched
                                ? searchResults &&
                                  searchResults.map((searchResult, index) => {
                                      return (
                                          <ItemCard
                                              key={searchResult[6]}
                                              title={searchResult[2]}
                                              goal={searchResult[3]}
                                              amountReceived={searchResult[4]}
                                              contractAddress={searchResult[1]}
                                              cid={searchResult[0]}
                                              owner={searchResult[5]}
                                          />
                                      )
                                  })
                                : items &&
                                  items.map((item, index) => {
                                      return (
                                          <ItemCard
                                              key={item[6]}
                                              title={item[2]}
                                              goal={item[3]}
                                              amountReceived={item[4]}
                                              contractAddress={item[1]}
                                              cid={item[0]}
                                              owner={item[5]}
                                          />
                                      )
                                  })}
                        </div>
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
