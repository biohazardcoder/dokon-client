import { User } from "@/types/interface"
import { ModeToggle } from "../mode-toggle"
import { useSelector } from "react-redux"

const Header = () => {
  const {data} = useSelector((state:any)=>state.user)

  return (
    <div className="w-full h-[50px] bg-accent flex items-center justify-between px-4">
        <div>
            {data.firstName} {data.lastName}
        </div>
        <div className="flex items-center gap-1">
        <ModeToggle/>
        </div>
    </div>
  )
}

export default Header