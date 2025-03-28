'use client'
import Header from '@/components/models/header';
import Menu from '@/components/models/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RootState } from '@/store';
import { Partner, Product } from '@/types/interface';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const Page = () => {
    const { isAuth, data } = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    
    const filteredPartners = data?.partners?.filter((partner: Partner) =>
        selectedDate
            ? partner.products?.some((product: Product) => product.date?.slice(0, 10) === selectedDate)
            : true
    ) || [];
    
    
    const totalCredit = filteredPartners.reduce((acc, partner) => acc + (partner.credit || 0), 0);
    const totalSum = filteredPartners.reduce((total, partner) => 
        total + (partner.products?.reduce((sum, product:Product) => sum + ((product.price || 0) * (product.quantity || 0)), 0) || 0), 0
    );
    const totalDifference = totalSum - totalCredit;
    
    const filteredPartner = data?.partners
        ? data.partners.filter((item: Partner) => 
            item.shopName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    useEffect(() => {
        if (isAuth === false) {
            router.push("/auth");
        }
    }, [isAuth, router]);


    return (
        <div>
            <Header />
            <div className='p-2'>
                <Input 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Do'konni qidirish..."
                />
            </div>
            <div className='p-2'>
            <div className='bg-secondary p-2 flex items-center justify-between'>
               <div className='flex flex-col'>
               <h2 className="font-semibold">Umumiy ma`lumot</h2>
                <Input 
                    type="date" 
                    className="mb-2 bg-card w-40"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
               </div>
                <div className='flex flex-col'>
                <p>Jami: <span className="text-blue-500">{totalSum.toLocaleString()} </span></p>
                <p>To`langan: <span className="text-green-500">{totalDifference.toLocaleString()} </span></p>
                    <p>Qarz: <span className="text-red-500">{totalCredit.toLocaleString()} </span></p>
                </div>
                </div>
            </div>
            <div className="p-2 flex flex-col gap-2">
                {filteredPartner.length > 0 ? (
                    filteredPartner.map(({_id, address, updatedAt, shopName, phoneNumber,credit}: Partner) => (
                        <div 
                            key={_id} 
                            className={`p-2 rounded-md bg-secondary`}
                            
                        >
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h1 className='font-semibold'>{shopName}</h1>
                                    <h1 className='text-sm'>{address}</h1>
                                </div>
                                <div>
                               <div>
                               {credit && credit > 0 ? (
                                    <span className="text-red-500 pr-2">-{(credit ?? 0).toLocaleString()} sum</span>
                                ) : (
                                    <span className="text-green-500 pr-2">{(credit ?? 0).toLocaleString()} sum</span>
                                )}
                               <Link href={`/add/${_id}`}>
                               <Button
                                >
                                    <Eye />
                                </Button>
                               </Link>
                               </div>
                                </div>
                            </div>
                            <h1 className='flex items-center text-muted-foreground justify-between'>
                                <span>{phoneNumber}</span> 
                                <span>{updatedAt?.slice(0,10)}</span>
                            </h1>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Hech narsa topilmadi</p>
                )}
            </div>
            <Menu />
        </div>
    )
}

export default Page;
