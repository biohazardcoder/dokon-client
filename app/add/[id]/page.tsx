"use client"
import Header from '@/components/models/header'
import Menu from '@/components/models/menu'
import { Fetch } from '@/middlewares/Fetch'
import { Partner, Product,History } from '@/types/interface'
import { useParams, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
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
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { CircleDollarSign, LoaderCircle, PackagePlus, PlusCircle, RefreshCcw, ShieldAlert, TableOfContents, Trash } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getError, getPending, getUserInfo } from '@/toolkits/user-toolkit'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { RootState } from '@/store'

const Page = () => {
    const {id}=useParams()
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const [partner, setPartner] = useState<Partner>()
    const [error, setError] = useState<string>("")
    const [menu, setMenu] = useState(true)
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const [paid, setPaid] = useState<number>(0);
    const dispatch = useDispatch();
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
    const { data,isAuth } = useSelector((state: RootState) => state.user) || null;
    const [creditMenu, setCreditMenu ] = useState<boolean>(false)
    const [paidCredit, setPaidCredit ] =useState<number>(0)
    const [message, setMessage ]= useState<string>("")
    const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
    
  useEffect(() => {
    if (!isAuth) {
      router.push("/auth") 
    }
  }, [router, isAuth])
  



    const handleCreditMenu = ()=>{
        setCreditMenu(!creditMenu)
    }

    const handleMenu = ()=>{
        setMenu(!menu)
    }

    const handleAddClick = (product: Product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };
    const GetPartner = useCallback(async () => {
        try {
            setLoading(true);
            const response = (await Fetch.get(`partner/${id}`)).data  ;
            setPartner(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);
    const GetUserData = useCallback(async () => {
        try {
            dispatch(getPending());
            const response = (await Fetch.get('/admin/me')).data;
            if (response.data) {
                dispatch(getUserInfo(response.data));
            } else {
                dispatch(getError('No user data available'));
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch(getError(error.response?.data || 'Unknown Token'));
                setError(error.message);
            } else {
                dispatch(getError('An unexpected error occurred'));
                setError('An unexpected error occurred');
            }
        }
    }, [dispatch]);
    
    
    useEffect(() => {
        GetPartner();
        GetUserData();
    }, [GetPartner, GetUserData]);

  const handleCreditChanger = async () => {
  try {
    setLoading(true);
    const response = await Fetch.post("/partner/credit", {
      id: partner?._id,
      paid: paidCredit,
    });
    setPaidCredit(0);
    setMessage(response.data.message);
    await GetPartner();
    await GetUserData();
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      setError(error.response?.data?.message || "An error occurred");
      setMessage(error.response?.data?.message || "An error occurred");
    } else if (error instanceof Error) {
      setError(error.message);
      setMessage(error.message);
    } else {
      setError("An unexpected error occurred");
      setMessage("An unexpected error occurred");
    }
    console.log(error);
  } finally {
    await GetPartner();
    setLoading(false);
  }
};

const handleCreditBacker = useCallback(async () => {
    if (!selectedHistory) {
        setError("Tarixdan biror to‘lovni tanlang");
        return;
    }

    try {
        setLoading(true);
        const response = await Fetch.post("/partner/backer", {
            id: partner?._id,
            paid: selectedHistory.paid,
            selectedId: selectedHistory._id
        });

        setMessage(response.data.message);
        await GetPartner();
        await GetUserData();
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            setError(error.response?.data?.message || "Noma'lum xatolik yuz berdi");
        } else if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("Noma'lum xatolik yuz berdi");
        }
        console.error(error);
    } finally {
        setLoading(false);
    }
}, [selectedHistory, partner?._id, GetPartner, GetUserData]);
    
    
    useEffect(() => {
        if (selectedHistory) {
          handleCreditBacker();
        }
      }, [selectedHistory, handleCreditBacker]);
      
    


    const handleConfirm = async () => {
      if (!selectedProduct) return;
      setLoading(true);
      try {
        await Fetch.post(`/partner/${id}/add-product`, {
          product: selectedProduct.product,
          price: selectedProduct.price,
          size: selectedProduct.size,
          paid: paid,
          _id: selectedProduct._id,
          admin: data?._id,
          quantity,
        });
        setOpenDialog(false);
        setMenu(true);
        await GetPartner();
        await GetUserData();
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Noma'lum xatolik yuz berdi");
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Noma'lum xatolik yuz berdi");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    
    const filteredProducts = data?.products?.filter((product: Product) => {
        return product.stock > 0;
    });
    
    const totalStock: number = Array.isArray(partner?.products)
    ? partner.products.reduce((sum: number, product: Product) => sum + (product.quantity ?? 0), 0)
    : 0;
    const totalPriceStock: number = partner?.products?.reduce(
        (sum: number, product: Product) => sum + (product.price * (product.quantity ?? 0)),
        0
      ) ?? 0;
          const totalPriceStockFormatted = totalPriceStock?.toLocaleString();

    const handleDeleteProductFromPartner = async () => {
        if (!deleteProductId) return
        setLoading(true)
        try {
            await Fetch.post(`partner/delete/${partner?._id}`, {
                admin: data?._id,
                productId: deleteProductId,
            });
            setDeleteProductId(null)
            await GetPartner();
            await GetUserData();
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
              setError(err.response?.data?.message || "Noma'lum xatolik yuz berdi");
            } else if (err instanceof Error) {
              setError(err.message);
            } else {
              setError("Noma'lum xatolik yuz berdi");
            }}
    }
    
    const ifError = error ? true : false
    return (
    <div>
        <Header/>
        <div>
            {error ? <h1 className='text-muted-foreground p-2 flex items-center justify-center gap-1'><ShieldAlert size={20}/> Xatolik: <span className='text-red-500'>{error}</span> 
            <Button onClick={()=> router.push("/user")}><RefreshCcw/></Button> 
            </h1> : ""}
            {menu ? (
                <div className='p-2'>
                 {
                    loading ? <h1 className='flex items-center justify-center gap-1 font-semibold text-muted-foreground'> <LoaderCircle className='animate-spin' size={20}/> Yuklanmoqda...</h1> : <div>
                         <div className='flex w-full p-2 items-center justify-between rounded-md bg-secondary'>
                        <div>
                        <h1>{partner?.shopName}</h1>
                        <h1>{partner?.phoneNumber}</h1>
                        </div>
                       <div className=' flex items-center gap-2 '>
                        <Button 
                        disabled={ifError}
                        onClick={handleCreditMenu}
                        variant={'ghost'}
                        className='text-red-500'
                        >
                        {partner?.credit && partner.credit > 0 ? (
                            <span className="text-red-500">-{(partner.credit ?? 0).toLocaleString()} sum</span>
                            ) : (
                            <span className="text-green-500">{(partner?.credit ?? 0).toLocaleString()} sum</span>
                            )}
                        </Button>
                       <Button
                        onClick={handleMenu}
                        disabled={ifError}
                        className='text-secondary-foreground'>
                            <PackagePlus />
                        </Button>
                       </div>
                    </div>
                    <div className='py-2'>
                    <Table>
                                <TableCaption>Sotib olingan mahsulotlar ro`yxati</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nomi</TableHead>
                                        <TableHead>Narxi</TableHead>
                                        <TableHead>O`lchami</TableHead>
                                        <TableHead>Soni</TableHead>
                                        <TableHead>O`chirish</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partner?.products?.map((product: Product) => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">{product.product}</TableCell>
                                            <TableCell className='flex flex-col'>
                                            <span>{(product?.price,product.quantity ? product?.price * product?.quantity : 0).toLocaleString()}</span>
                                            <span className='text-red-500'>-{((product?.price,product.quantity ? product?.price * product?.quantity : 0) - product.paid).toLocaleString()}</span>
                                            </TableCell>
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
                                        <strong>{totalPriceStockFormatted} sum</strong> 
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
                            <TableCaption>Bugungi mahsulotlar ro`yxati</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Nomi</TableHead>
                                    <TableHead>Narxi</TableHead>
                                    <TableHead>O`lchami</TableHead>
                                    <TableHead>Soni</TableHead>
                                    <TableHead>Qo`shish</TableHead>
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
                    <DialogTitle>Mahsulot qo`shish</DialogTitle>
                    <h1 className='text-red-500'>{error}</h1>
                </DialogHeader>
                <div className='px-4 py-1'>
                    <p>{selectedProduct?.product} - {selectedProduct?.size} ({selectedProduct?.price.toLocaleString()}sum)</p>
                    <p>Mavjud: {selectedProduct?.stock} dona</p>
                    <Label>Sotib olingan miqdor</Label>
                    <Input type='number' min='1' max={selectedProduct?.stock} value={quantity } onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>
                <div className='px-4 '>
                    <p>Narxi: {(selectedProduct?.price ? selectedProduct.price * quantity : 0).toLocaleString()} sum</p>
                    <Label>To`langan summa</Label>
                    <Input
                        type="number"
                        min="1"
                        max={selectedProduct?.price ? selectedProduct.price * quantity : 0}
                        value={paid}
                        onChange={(e) => setPaid(Number(e.target.value))}
                        />
                </div>
                <DialogFooter className='flex flex-col gap-1'>
                    <Button onClick={() => setOpenDialog(false)} variant={'destructive'}>Bekor qilish</Button>
                    <Button disabled={loading} onClick={handleConfirm} >Tasdiqlash</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        {creditMenu && (
  <div className="absolute bg-background p-5 w-screen h-screen top-0 left-0">
    <div className="bg-secondary p-2">
      <div className="flex items-center justify-between">
        <Button onClick={handleCreditMenu}>Yopish</Button>
        <h1 className="flex flex-col">
          <span>{partner?.shopName}</span>
          {partner?.credit && partner.credit > 0 ? (
            <span className="text-red-500">-{(partner.credit ?? 0).toLocaleString()} sum</span>
            ) : (
            <span className="text-green-500">{(partner?.credit ?? 0).toLocaleString()} sum</span>
            )}
        </h1>
      </div>
      {message && <h1 className='text-center text-primary'>
        {message}
        </h1>}
      <div className="flex justify-between mt-2">
        <Input
          onChange={(e) => setPaidCredit(Number(e.target.value))}
          className="border border-primary"
          value={paidCredit}
          type='number'
        />
        <Button 
        disabled={paidCredit ===0 || loading} onClick={handleCreditChanger}>
          <CircleDollarSign />
        </Button>
      </div>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Jami</TableHead>
              <TableHead>To‘langan</TableHead>
              <TableHead>Harakat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
    {[...(partner?.history || [])].reverse().map((item: History, index) => (
            <TableRow key={index} className="text-center">
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item?.date?.slice(0, 10)}</TableCell>
                <TableCell>{(item.total + item.paid).toLocaleString()}</TableCell>
                <TableCell>{item.paid.toLocaleString()}</TableCell>
                <TableCell>
                <Button
                disabled={loading}
                variant="destructive"
                onClick={() => setSelectedHistory(item)} 
            >
                <Trash />
            </Button>
                </TableCell>
            </TableRow>
        ))}
    </TableBody>
        </Table>
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default Page