import { ModeToggle } from "../mode-toggle";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export interface User {
  phoneNumber: number;
  firstName: string;
  lastName: string;
  password: string;
  avatar: string;
  _id: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

const Header = () => {
  const { data } = useSelector((state: RootState) => state.user) as { data: User | null };

  return (
    <div className="w-full h-[50px] bg-accent flex items-center justify-between px-4">
      <div>
        {data ? `${data.firstName} ${data.lastName}` : "Guest"}
      </div>
      <div className="flex items-center gap-1">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
