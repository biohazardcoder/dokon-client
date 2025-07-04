"use client"

import Header from '@/components/models/header';
import Menu from '@/components/models/menu';
import { Button } from '@/components/ui/button';
import { Fetch } from '@/middlewares/Fetch';
import { Partner } from '@/types/interface';
import { LoaderCircle, NotepadText, PlusSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getError, getPending, getUserInfo } from '@/toolkits/user-toolkit';
import { RootState } from '@/store';

const Page = () => {
  const { data, isPending, isError, isAuth } = useSelector(
    (state: RootState) => state.user
  );

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuth) {
      router.replace('/auth'); 
    }
  }, [isAuth, router]);


  const GetUserData = useCallback(async () => {
    try {
      dispatch(getPending());
      const response = (await Fetch.get("/admin/me")).data;
      if (response) {
        dispatch(getUserInfo(response.data));
      } else {
        dispatch(getError("No user data available"));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("Noma'lum xatolik yuz berdi");
      }
    }
  }, [dispatch]);
  
  useEffect(() => {
    GetUserData();
  }, [isAuth, GetUserData]);
  

  const handleDelete = async (id: string) => {
    try {
      await Fetch.delete(`partner/${id}`);
      await GetUserData();
    } catch (error) {
      console.error("Hamkorni o‘chirishda xatolik yuz berdi", error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Header />
      {isError && <h1 className='text-center'>Xatolik</h1>}
      {isPending ? (
        <h1 className='text-center p-2 flex items-center justify-center gap-1 text-muted-foreground'>
          <LoaderCircle className='animate-spin' size={20} /> Yuklanmoqda...
        </h1>
      ) : (
        <div>
          {data?.partners && data.partners.length > 0 ? (
            <div className='p-4 flex flex-col gap-3 pb-16'>
              {data.partners
                .filter(({ createdAt }: Partner) => createdAt?.slice(0, 10) === today)
                .map(({ shopName, phoneNumber, address, _id, createdAt }: Partner) => (
                  <div key={_id} className='bg-secondary p-2 space-y-1 rounded-md'>
                    <div className='text-lg font-semibold flex items-center justify-between'>
                      {shopName}
                      <h1 className='text-sm text-muted-foreground'>{createdAt?.slice(0, 10)}</h1>
                    </div>
                    <h1 className='text-muted-foreground text-sm'>{address}</h1>
                    <h1 className='text-muted-foreground'>{phoneNumber}</h1>
                    <div className='flex items-center justify-between'>
                      <Link href={`/add/${_id}`}>
                        <Button>
                          <PlusSquare />
                        </Button>
                      </Link>
                      <div className='flex items-center gap-2'>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant='destructive'>
                              <Trash2 />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Haqiqatan ham o‘chirmoqchimisiz?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ushbu hamkorni o‘chirib tashlasangiz, bu amalni ortga qaytarib bo‘lmaydi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(_id)}>Ha, o‘chirish</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <h1 className='text-center p-2 flex items-center justify-center gap-1 text-muted-foreground'>
              <NotepadText size={20} className='animate-pulse' /> Dokonlar mavjud emas!
            </h1>
          )}
        </div>
      )}
      <Menu />
    </div>
  );
};

export default Page