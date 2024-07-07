import Link from "next/link";
import logo from "../../../public/dinnerlogo.png";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left flex flex-col justify-center items-center">
          <Image src={logo} alt="logo" className="h-auto w-[1.5rem] rounded" />

          <p className="text-gray-400">
            © {new Date().getFullYear()} AreBox. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/" className="text-gray-400 hover:text-white">
            Home
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white">
            About
          </Link>
          <Link href="/services" className="text-gray-400 hover:text-white">
            Services
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
