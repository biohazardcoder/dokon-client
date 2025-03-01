import React from 'react'
import { LayoutGrid, Plus, Settings, User } from 'lucide-react'
import Link from 'next/link'

const Menu = () => {
    const liData = [
        {
          icon:<LayoutGrid/>,
          link:'/'
        },
        {
          icon:<Plus size={30}/>,
          link:'/add'
        },
        {
          icon:<User/>,
          link:'/user'
        },
        
      ]
  return (
         <div className='w-full flex items-center justify-around h-[50px] 
      bg-accent fixed bottom-0 left-0  '>
        {
          liData.map((item:{
              link:string,
              icon:any
            }, index:number)=>(
              <Link href={item.link} key={index} className='px-3 py-1'>
                {item.icon}
              </Link>
            ))
        }
      </div>
  )
}

export default Menu