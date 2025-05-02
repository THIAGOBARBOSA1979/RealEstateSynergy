import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: "/", label: "Overview", icon: "dashboard" },
  { path: "/properties", label: "My Units", icon: "home" },
  { path: "/client-portal", label: "Messages", icon: "chat", badge: 9 },
  { path: "/analytics", label: "Analytics", icon: "bar_chart" },
  { path: "/crm", label: "Client Data", icon: "people" },
  { path: "/site-editor", label: "Documents", icon: "description" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white text-gray-700 fixed md:relative inset-y-0 left-0 z-20 w-64 transition-transform duration-300 ease-in-out shadow-md",
        !isOpen && "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo Area */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-xl font-heading font-bold flex items-center text-accent-dark">
            <span className="material-icons mr-2 text-accent">home</span>
            MyProperty
          </h1>
        </div>
        
        {/* Menu Category */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            MAIN MENUS
          </h2>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-md transition-colors",
                    location === item.path 
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center mr-3 rounded-full",
                    location === item.path 
                      ? "bg-accent/10 text-accent"
                      : "text-gray-500"
                  )}>
                    <span className="material-icons text-[20px]">{item.icon}</span>
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-gray-200 text-gray-600 hover:bg-gray-200">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Current Plan Section */}
        <div className="px-4 py-5 mx-3 my-4 bg-accent/10 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800">Current Plan</h3>
            <div className="flex items-center bg-accent text-white text-xs rounded px-2 py-0.5 font-medium">
              Basic
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Storage</span>
              <span className="font-medium">40%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-1.5 rounded-full" style={{width: '40%'}}></div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="w-full border-accent text-accent hover:bg-accent hover:text-white">
            Upgrade Plan
          </Button>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
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
