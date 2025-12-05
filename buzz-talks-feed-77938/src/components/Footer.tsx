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
    <footer className="bg-gray-50 pt-16 pb-8">
      {/* ...existing code... */}
      <div className="container mx-auto px-4 md:px-6">
        {/* ...existing code for the main footer content... */}
        {/* ...existing code for the main footer content... */}

        <hr className="my-8 border-gray-200" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BuzzTalks. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-500 hover:text-gray-700 text-sm"
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