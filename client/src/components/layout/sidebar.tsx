import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/properties", label: "My Units", icon: "home" },
  { path: "/favorites", label: "Favorites", icon: "favorite", badge: 2 },
  { path: "/analytics", label: "Analytics", icon: "bar_chart" },
  { path: "/crm", label: "Client Data", icon: "people" },
  { path: "/site-editor", label: "Documents", icon: "description" },
  { path: "/team", label: "Team", icon: "group" },
  { path: "/affiliate", label: "Affiliation", icon: "link" },
  { path: "/client-portal", label: "Client Portal", icon: "public" },
  { path: "/settings", label: "Settings", icon: "settings" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-100 h-screen w-64 transition-transform duration-300 ease-in-out",
        !isOpen && "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Logo Area */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold flex items-center text-primary">
            <span className="material-icons mr-2 text-accent">home</span>
            MyProperty
          </h1>
        </div>
        
        {/* Menu Category */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            MAIN MENUS
          </h2>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-sm transition-colors",
                    location === item.path 
                      ? "bg-orange-50 text-orange-500 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span 
                    className={cn(
                      "material-icons mr-3 text-[20px]",
                      location === item.path ? "text-orange-500" : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto border-red-200 bg-red-50 text-red-500 hover:bg-red-50">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Current Plan Section */}
        <div className="p-4 mx-3 my-4 bg-orange-50 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800">Current Plan</h3>
            <Badge className="bg-orange-500 hover:bg-orange-600">
              Basic
            </Badge>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Storage</span>
              <span className="font-medium">40%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: '40%'}}></div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
            Upgrade Plan
          </Button>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 px-2">
            <span className="material-icons text-sm mr-1">light_mode</span>
            Light
          </Button>
          <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 px-2">
            <span className="material-icons text-sm mr-1">dark_mode</span>
            Dark
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
