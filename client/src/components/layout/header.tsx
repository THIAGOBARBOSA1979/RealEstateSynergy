import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location] = useLocation();
  const today = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <header className="bg-white border-b border-gray-100 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-500"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          
          {/* Search Input */}
          <div className="relative w-72">
            <Input 
              placeholder="Search properties, customers, etc..." 
              className="pl-10 pr-4 py-2 h-10 text-sm bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
            />
            <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-gray-600 font-medium text-sm">
            {today}
          </div>
          
          {/* Expand Button */}
          <Button variant="ghost" size="icon" className="text-gray-500">
            <span className="material-icons">expand_more</span>
          </Button>
          
          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-gray-500 relative">
              <span className="material-icons">notifications</span>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
          
          {/* Help Button */}
          <Button variant="ghost" size="icon" className="text-gray-500">
            <span className="material-icons">help_outline</span>
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-sm font-medium text-gray-800">JS</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-orange-500">
              <AvatarImage src="" />
              <AvatarFallback className="bg-orange-100 text-orange-500 font-medium">JS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
