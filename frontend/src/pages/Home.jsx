import { Link } from "react-router-dom";

export default function Home(){

    return(
        <div>
            <h1>Welcome to the HomePage</h1>
            <Link to={"/dashboard"}>Go To Dashboard</Link>
        </div>
    )
}