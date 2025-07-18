import { Crown, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/contests", label: "Contests", active: location === "/contests" },
    { href: "/judge", label: "Dashboard", active: location === "/judge" },
    { href: "/results", label: "Results", active: location === "/results" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Crown className="text-primary h-8 w-8 mr-3" />
              <span className="text-xl font-playfair font-bold text-gray-900">Crown</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? "text-primary bg-primary/10"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ''} alt="Profile" />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {user?.firstName || 'User'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-4"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/api/login'}>
                Get Started
              </Button>
            </div>
          )}
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
