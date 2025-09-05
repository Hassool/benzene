'use client'
import React from 'react'
import { TbTools } from "react-icons/tb";
import { MdOutlinePlayLesson, MdOutlineAccountCircle, MdLogin, MdLogout } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NavList = [
    {name:"Tools", icon: <TbTools/>, path:"/"},
    {name:"Courses", icon: <MdOutlinePlayLesson/>, path:"/Courses"},
    {name:"Honor page", icon: <FaRegHeart/>, path:"/Honor"},
    {name:"Account", icon: <MdOutlineAccountCircle/>, path:"/Account"},
]

function NavBar() {
  const path = usePathname();
  const { data: session, status } = useSession();

  const handleAuthAction = () => {
    if (session) {
      signOut();
    } else {
      // Redirect to sign in page
      window.location.href = '/auth/signin';
    }
  };

  return (
    <nav className='bg-bg border-r border-gray-700 fixed left-0 top-0 h-screen w-64 flex flex-col px-3 py-8 z-50'>
      {/* Logo/Brand section */}
      <div className='mb-10 px-3 flex gap-4'>
        <Image className='' src="/benzen.png" alt="benzen logo" width={50} height={50} priority/>
        <h1 className='text-2xl font-semibold text-white'>BENZENE</h1>
      </div>

      {/* Navigation Links */}
      <div className='flex flex-col gap-2'>
        {NavList.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className={`flex items-center gap-4 px-3 py-3 rounded-lg text-gray-300 ${path == item.path ? "bg-gray-800" : "hover:bg-gray-800"} transition-colors duration-200 group`}
          >
            <div className={`text-2xl group-hover:scale-105  ${path == item.path ? "text-special " : "group-hover:text-special"} transition-all duration-200`}>
              {item.icon}
            </div>
            <span className='text-base font-medium'>{item.name}</span>
          </Link>
        ))}
        
        {/* Sign In/Out Button */}
        <button 
          onClick={handleAuthAction}
          disabled={status === 'loading'}
          className='flex items-center gap-4 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 group disabled:opacity-50'
        >
          <div className='text-2xl group-hover:scale-105 group-hover:text-special transition-all duration-200'>
            {status === 'loading' ? (
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-special rounded-full"></div>
            ) : session ? (
              <MdLogout />
            ) : (
              <MdLogin />
            )}
          </div>
          <span className='text-base font-medium'>
            {status === 'loading' ? 'Loading...' : session ? 'Sign Out' : 'Sign In'}
          </span>
        </button>
      </div>

      {/* Bottom section - User info when signed in */}
      {session && (
        <div className='mt-auto pt-4 border-t border-gray-700'>
          <div className='px-3 py-2'>
            <p className='text-sm text-gray-400'>Welcome back!</p>
            <p className='text-xs text-special font-medium'>
              {session.user?.name || session.user?.email || 'User'}
            </p>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar