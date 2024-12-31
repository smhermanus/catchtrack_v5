"use client";
import Link from "next/link";
import Image from "next/image";
import { GoHomeFill } from "react-icons/go";
import { TbCategoryFilled } from "react-icons/tb";
import { FaHeart } from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";
import { RxDividerVertical } from "react-icons/rx";
import { useSession } from "../SessionProvider";
import UserButton from "./UserButton";
import SearchField from "./SearchField";
import logo from "../assets/logo.png";

const Navbar = () => {
  const session = useSession();

  return (
    <>
      {/* Fixed top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-black text-white shadow-lg">
          <div className="flex items-center justify-between mx-auto w-full px-4 lg:px-8 h-[88px]">
            {/* Logo container */}
            <Link href="/customer" className="flex items-center">
              <div className="relative w-[200px] h-[50px]">
                <Image
                  src={logo}
                  alt="captivityLogo"
                  fill
                  className="object-contain hover:opacity-80 transition-opacity"
                  priority
                />
              </div>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/help" className="hover:text-gray-300 text-sm">
                <span>Help</span>
              </Link>
              <div className="flex">
                <SearchField />
              </div>
              {session?.user ? (
                <div className="flex items-center">
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="hover:text-gray-300 text-sm">
                    Login
                  </Link>
                  <RxDividerVertical className="text-gray-400" />
                  <Link href="/signup" className="hover:text-gray-300 text-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center">
              {session?.user ? (
                <UserButton />
              ) : (
                <Link
                  href="/login"
                  className="font-bold text-lg hover:text-gray-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile search bar */}
        <div className="md:hidden bg-white">
          <div className="flex items-center justify-center border-b-2 p-2">
            <SearchField />
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-[120px] md:h-[88px]"></div>

      {/* Mobile bottom Nav */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-white shadow-xl shadow-gray-400 border-t-2 border-t-gray-400 border-2 mx-5 mb-2 z-50 rounded-xl">
        <div className="flex justify-around text-gray-500">
          <Link
            href="/"
            className="flex flex-col items-center py-2 hover:text-red-500"
          >
            <GoHomeFill size={20} />
            <div className="text-xs mt-1">Home</div>
          </Link>
          <Link
            href="/mobileCategories"
            className="flex flex-col items-center py-2 hover:text-red-500"
          >
            <TbCategoryFilled size={20} />
            <div className="text-xs mt-1">Categories</div>
          </Link>
          <Link
            href="/Favourites"
            className="flex text-gray-600 flex-col items-center py-2 hover:text-red-500"
          >
            <FaHeart size={20} />
            <div className="text-xs mt-1">Favourites</div>
          </Link>
          <Link
            href={session?.user ? `/users/${session.user.username}` : "/Login"}
            className="flex flex-col items-center py-2 hover:text-red-500"
          >
            <MdAccountCircle size={20} />
            <div className="text-xs mt-1">Account</div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
