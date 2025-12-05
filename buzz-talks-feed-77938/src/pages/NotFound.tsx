import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 safe-area-inset">
      <div className="text-center">
        <h1 className="mb-3 sm:mb-4 text-5xl sm:text-6xl md:text-7xl font-bold gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="mb-4 sm:mb-6 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block px-6 py-2.5 sm:py-3 rounded-full gradient-primary text-white font-medium text-sm sm:text-base hover:opacity-90 transition-opacity">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
