import "../styles/Home.module.css"
import Item from "../components/Item"

export default function Home() {
    return (
        <div>
            <Item myEntries={false} />
        </div>
    )
}
