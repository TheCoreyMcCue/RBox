import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-amber-50/90 border-t border-amber-200 text-amber-800 backdrop-blur-md py-3">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 text-sm font-serif">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <Image
            src="/icon.png"
            alt="Nana's Cookbook Logo"
            width={28}
            height={28}
            className="h-auto w-[1.75rem]"
          />
          <span className="font-[Homemade Apple] text-lg">Nana’s Cookbook</span>
        </div>

        {/* Center: Links */}
        <div className="flex gap-4 mb-2 md:mb-0">
          <Link href="/" className="hover:text-amber-600 transition">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-amber-600 transition">
            Dashboard
          </Link>
          <Link href="/recipes/all" className="hover:text-amber-600 transition">
            Discover
          </Link>
          <Link
            href="/recipes/create"
            className="hover:text-amber-600 transition"
          >
            Add Recipe
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-amber-600">
          © {new Date().getFullYear()} Nana’s Cookbook
        </div>
      </div>
    </footer>
  );
};

export default Footer;
