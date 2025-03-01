'use client'
import Header from '@/components/models/header';
import Menu from '@/components/models/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fetch } from '@/middlewares/Fetch';
import { Partner } from '@/types/interface';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const Page = () => {
    const { isAuth, data } = useSelector((state: any) => state.user);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const filteredPartner = data?.partners
        ? data.partners.filter((item: any) => 
            item.shopName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    useEffect(() => {
        if (isAuth === false) {
            router.push("/auth");
        }
    }, [isAuth, router]);

    const handleUpdateAtChanger = async (partnerId: string) => {
        try {
            setLoading(true);
            await Fetch.post(`/partner/changer/${partnerId}`);
            router.replace(`/add/${partnerId}`);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div>
            <Header />
            <div className='p-2'>
                <Input 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Do'konni qidirish..."
                />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="p-2 flex flex-col gap-2">
                {filteredPartner.length > 0 ? (
                    filteredPartner.map(({_id, address, updatedAt, shopName, phoneNumber}: Partner) => (
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
                                <Button
                                    onClick={() => handleUpdateAtChanger(_id)}
                                    disabled={loading}
                                >
                                    <Eye />
                                </Button>
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
