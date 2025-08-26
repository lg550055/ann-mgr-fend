import { redirect } from "next/navigation";
import Register from "./pages/register"

export default function Home() {
  // redirect("/tasks")
  return <>
    <Register />
    {/* <p>Hello World!</p> */}
  </>
}
