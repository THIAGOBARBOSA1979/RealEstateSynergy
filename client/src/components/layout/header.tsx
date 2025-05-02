import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });
  
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <header className="bg-white border-b border-gray-100 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-gray-500 md:hidden"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          
          <span className="material-icons text-gray-400 mr-2 hidden md:block">menu</span>
          
          {/* Search Input */}
          <div className="relative w-64 md:w-80">
            <Input 
              placeholder="Search properties, customers, etc..." 
              className="pl-10 pr-4 py-2 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg" 
            />
            <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-gray-600 text-sm mr-3">
            {today}
          </div>
          
          <Button variant="ghost" size="icon" className="text-gray-500">
            <span className="material-icons">expand_more</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
