import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold">MyLogo</h3>
          <p className="text-gray-400">
            © {new Date().getFullYear()} MyLogo. All rights reserved.
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
