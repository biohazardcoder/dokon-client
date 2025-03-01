"use client";
import Header from "@/components/models/header";
import Menu from "@/components/models/menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, User } from "@/types/interface";
import {  LayoutPanelLeft, LogOut } from "lucide-react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const { data, isPending,isError,isAuth } = useSelector((state: any) => state.user);
  const user: User = data || {}; 

  const router = useRouter()
    
    useEffect(() => {
      if (!isAuth) {
        router.push("/auth") 
      }
    }, [router, isAuth])
    

  const today = new Date().toLocaleDateString("sv-SE");


  const filteredProducts = data?.products?.filter((product: Product) => {
    if (!product.date) return false;
    const productDate = new Date(product.date).toLocaleDateString("sv-SE");
    return productDate === today;
  }) || [];

  const totalStock = filteredProducts.reduce((sum:any, product:any) => sum + product.stock, 0);
  const totalPriceStock = filteredProducts.reduce((sum:any, product:any) => sum + product.price * product.stock, 0);

  const handleLogOut= ()=>{
    localStorage.removeItem("token")
    window.location.href = "/auth"
  }
  return (
    <div>
      <Header />
      {isError ?  <h1 className="text-red-500 text-center">
          {isError.message}
        </h1> : ""}
      <div className="p-2">
        {isPending ? (
          <div>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div>
            <div className="p-2 border rounded-md">
              <div className="flex items-center justify-between">
                <h1>+998 {user?.phoneNumber || "Noma'lum"}</h1>
                <div className="flex items-center gap-2">
                  <Link href='/partners'>
                    <Button  variant="default">
                      <LayoutPanelLeft size={14} /> 
                    </Button>
                  </Link>
                <Button onClick={handleLogOut} variant="destructive">
                 <LogOut size={14} /> 
                </Button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Table>
                <TableCaption>
                  {filteredProducts.length > 0 ? "Bugungi mahsulotlar ro‘yxati" : "Hali mahsulotlar yo‘q"}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead>Narxi (so‘m)</TableHead>
                    <TableHead>O‘lchami</TableHead>
                    <TableHead>Soni</TableHead>
                    <TableHead>Umumiy (so‘m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(({ price, product, size, stock }: Product, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{product}</TableCell>
                      <TableCell>{price.toLocaleString("uz-UZ")}</TableCell>
                      <TableCell>{size}</TableCell>
                      <TableCell>{stock}</TableCell>
                      <TableCell>{(price * stock).toLocaleString("uz-UZ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <strong>Jami</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{totalStock}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{totalPriceStock.toLocaleString("uz-UZ")}</strong>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        )}
      </div>
      <Menu />
    </div>
  );
};

export default Page;
