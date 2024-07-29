import Link from "next/link";
import logo from "../../../public/dinnerlogo.png";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-around items-center">
        <div className="text-center md:text-left flex flex-col justify-center items-center">
          <Image src={logo} alt="logo" className="h-auto w-[1.5rem] rounded" />

          <p className="text-gray-400">
            © {new Date().getFullYear()} Our Box. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
