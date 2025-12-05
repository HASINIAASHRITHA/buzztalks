import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-3 sm:mb-4">
              BuzzTalks
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              Connect, share, and discover amazing content with people around the world.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-smooth">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-4">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/about" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">About</Link></li>
              <li><Link to="/careers" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Careers</Link></li>
              <li><Link to="/press" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-4">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/help" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Help Center</Link></li>
              <li><Link to="/safety" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Safety Center</Link></li>
              <li><Link to="/community" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Community</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-4">Legal</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/privacy" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Terms</Link></li>
              <li><Link to="/cookies" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-4 sm:my-6 md:my-8 border-gray-200 dark:border-gray-700" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} BuzzTalks. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;