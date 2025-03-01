"use client"
import Header from '@/components/models/header'
import Menu from '@/components/models/menu'
import { Fetch } from '@/middlewares/Fetch'
import { Partner, Product } from '@/types/interface'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { LoaderCircle, PackagePlus, PlusCircle, ShieldAlert, TableOfContents, Trash } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getError, getPending, getUserInfo } from '@/toolkits/user-toolkit'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const page = () => {
    const {id}=useParams()
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const [partner, setPartner] = useState<Partner>()
    const [error, setError] = useState<string>("")
    const [menu, setMenu] = useState(true)
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const dispatch = useDispatch();
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
    const { data,isError,isAuth } = useSelector((state: any) => state.user) || {};

    
      
  useEffect(() => {
    if (!isAuth) {
      router.push("/auth") 
    }
  }, [router, isAuth])
  


    const handleMenu = ()=>{
        setMenu(!menu)
    }

    const handleAddClick = (product: Product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };
    const GetPartner = async () => {
        try {
            setLoading(true)
            const response = await (await Fetch.get(`partner/${id}`)).data;
            setPartner(response.data);
        } catch (error: any) {
            setError(error.message);
        } finally{
            setLoading(false)
        }

    };
    const GetUserData = async () => {
        try {
            dispatch(getPending());
            const response = (await Fetch.get(`/admin/me`)).data;
            if (response) {
                dispatch(getUserInfo(response.data));
            } else {
                dispatch(getError("No user data available"));
            }
        } catch (error: any) {
            dispatch(getError(error.response?.data || "Unknown Token"));
            setError(error.message);
        }
    };
    
    useEffect(() => {
        GetPartner();
        GetUserData();
    }, []);

    const handleConfirm = async () => {
        if (!selectedProduct) return;
        setLoading(true)
        try {
            await Fetch.post(`/partner/${id}/add-product`, {
                product: selectedProduct.product,
                price: selectedProduct.price,
                size: selectedProduct.size,
                _id: selectedProduct._id,
                admin: data._id,
                quantity,
            });
            setOpenDialog(false);
            setMenu(true);
            GetPartner(); 
            GetUserData();
        } catch (error : any) {
            setError(error.message);
        }finally{
            setLoading(false)
        }
    };
    
    const today = new Date().toLocaleDateString("sv-SE"); 

    const filteredProducts = data.products?.filter((product: Product) => {
        if (!product.date) return false; 
        const productDate = new Date(product.date).toLocaleDateString("sv-SE");
        return productDate === today;
    });
    
    const totalStock:number = partner?.products.reduce((sum:any, product:any) => sum + product.quantity, 0);
    const totalPriceStock:number = partner?.products.reduce((sum:any, product:any) => sum + product.price * product.quantity, 0);
    const totalPriceStockFormatted = totalPriceStock?.toLocaleString();

    const handleDeleteProductFromPartner = async () => {
        if (!deleteProductId) return
        setLoading(true)
        try {
            await Fetch.post(`partner/delete/${partner?._id}`, {
                admin: data._id,
                productId: deleteProductId,
            });
            setDeleteProductId(null)
            GetUserData()
            GetPartner()
        } catch (error: any) {
            setError(error.message)
        }finally{
            setLoading(false)
        }
    }
    const ifError = error ? true : false
    return (
    <div>
        <Header/>
        <div>
        {isError ?  <h1 className="text-red-500 text-center">
          {isError.message}
        </h1> : ""}
            {error ? <h1 className='text-muted-foreground p-2 flex items-center justify-center gap-1'><ShieldAlert size={20}/> Xatolik: <span className='text-red-500'>{error}</span></h1> : ""}
            {menu ? (
                <div className='p-2'>
                 {
                    loading ? <h1 className='flex items-center justify-center gap-1 font-semibold text-muted-foreground'> <LoaderCircle className='animate-spin' size={20}/> Yuklanmoqda...</h1> : <div>
                         <div className='flex w-full p-2 items-center justify-between rounded-md bg-secondary'>
                        <div>
                        <h1>{partner?.shopName}</h1>
                        <h1>{partner?.phoneNumber}</h1>
                        </div>
                        <Button
                        onClick={handleMenu}
                        disabled={ifError}
                        className='text-secondary-foreground'>
                            <PackagePlus />
                        </Button>
                    </div>
                    <div className='py-2'>
                    <Table>
                                <TableCaption>Sotib olingan mahsulotlar ro'yxati</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nomi</TableHead>
                                        <TableHead>Narxi</TableHead>
                                        <TableHead>O'lchami</TableHead>
                                        <TableHead>Soni</TableHead>
                                        <TableHead>O'chirish</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partner?.products.map((product: Product) => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">{product.product}</TableCell>
                                            <TableCell>{product.price}</TableCell>
                                            <TableCell>{product.size}</TableCell>
                                            <TableCell>{product.quantity}</TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" onClick={() => setDeleteProductId(product._id)}>
                                                            <Trash />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Haqiqatan ham o‘chirmoqchimisiz?</AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                                            <AlertDialogAction  disabled={loading} onClick={handleDeleteProductFromPartner}>
                                                                Ha, o‘chirish
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                               <TableFooter>
                                    <TableRow>
                                    <TableCell colSpan={3}>
                                        <strong>Jami</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>{totalStock}</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>{totalPriceStockFormatted} so'm</strong> 
                                   </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                    </div>
                    </div>
                 }
                </div>
            ) : (
                <div className='p-2'>
                  <div className='flex w-full p-2 items-center justify-between rounded-md bg-secondary'>
                        <div>
                        <h1>{partner?.shopName}</h1>
                        <h1>{partner?.phoneNumber}</h1>
                        </div>
                        <Button
                        onClick={handleMenu}
                        disabled={ifError}
                        className='text-secondary-foreground'>
                            {!menu ? <TableOfContents/> : <PackagePlus />}
                        </Button>
                    </div>
                    <div className='py-2'>
                        <Table>
                            <TableCaption>Bugungi mahsulotlar ro'yxati</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Nomi</TableHead>
                                    <TableHead>Narxi</TableHead>
                                    <TableHead>O'lchami</TableHead>
                                    <TableHead>Soni</TableHead>
                                    <TableHead>Qo'shish</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts?.map((product: Product) => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">{product.product}</TableCell>
                                            <TableCell>{product.price}</TableCell>
                                            <TableCell>{product.size}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleAddClick(product)}>
                                                    <PlusCircle />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
        <Menu/>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mahsulot qo'shish</DialogTitle>
                </DialogHeader>
                <div className='p-4'>
                    <p>{selectedProduct?.product} - {selectedProduct?.size}</p>
                    <p>Mavjud: {selectedProduct?.stock} dona</p>
                    <Input type='number' min='1' max={selectedProduct?.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>
                <DialogFooter className='flex flex-col gap-1'>
                    <Button onClick={() => setOpenDialog(false)} variant={'destructive'}>Bekor qilish</Button>
                    <Button disabled={loading} onClick={handleConfirm} >Tasdiqlash</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default page