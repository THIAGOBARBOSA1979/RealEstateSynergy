import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard,
  Home,
  Heart,
  BarChart2,
  Users,
  FileText,
  User,
  Link as LinkIcon,
  Globe,
  Settings,
  Sun,
  Moon,
  Building2
} from "lucide-react";
import { ReactNode } from "react";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();

  // Mapeamento de ícones string para componentes React
  const getIcon = (iconName: string): ReactNode => {
    switch (iconName) {
      case "dashboard": return <LayoutDashboard className="w-5 h-5" />;
      case "home": return <Home className="w-5 h-5" />;
      case "favorite": return <Heart className="w-5 h-5" />;
      case "bar_chart": return <BarChart2 className="w-5 h-5" />;
      case "people": return <Users className="w-5 h-5" />;
      case "description": return <FileText className="w-5 h-5" />;
      case "group": return <Users className="w-5 h-5" />;
      case "link": return <LinkIcon className="w-5 h-5" />;
      case "public": return <Globe className="w-5 h-5" />;
      case "settings": return <Settings className="w-5 h-5" />;
      case "building": return <Building2 className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  // Menu com submenus para organizar Imóveis e Empreendimentos
  const menuItems: MenuItem[] = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/properties", label: "Catálogo Imobiliário", icon: "home" },
    { path: "/developments", label: "→ Empreendimentos", icon: "building" },
    { path: "/properties", label: "→ Imóveis Avulsos", icon: "home" },
    { path: "/favorites", label: "Favoritos", icon: "favorite", badge: 2 },
    { path: "/analytics", label: "Analytics", icon: "bar_chart" },
    { path: "/crm", label: "CRM Clientes", icon: "people" },
    { path: "/team", label: "Equipe", icon: "group" },
    { path: "/affiliate", label: "Afiliação", icon: "link" },
    { path: "/client-portal", label: "Portal Cliente", icon: "public" },
    { path: "/settings", label: "Configurações", icon: "settings" },
  ];

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
            <Home className="w-5 h-5 mr-2 text-accent" />
            <span className={cn(!isOpen && "md:hidden")}>MyProperty</span>
          </h1>
        </div>
        
        {/* Menu Category */}
        <div className={cn("px-4 pt-6 pb-2", !isOpen && "md:px-2")}>
          <h2 className={cn("text-xs font-medium text-gray-400 uppercase tracking-wider", !isOpen && "md:hidden")}>
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
                  <div 
                    className={cn(
                      "mr-3",
                      location === item.path ? "text-orange-500" : "text-gray-500"
                    )}
                  >
                    {getIcon(item.icon)}
                  </div>
                  <span className={cn(!isOpen && "md:hidden")}>{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className={cn("ml-auto border-red-200 bg-red-50 text-red-500 hover:bg-red-50", !isOpen && "md:hidden")}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Current Plan Section */}
        <div className={cn("p-4 mx-3 my-4 bg-orange-50 rounded-xl", !isOpen && "md:hidden")}>
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
        <div className={cn("flex items-center justify-between px-4 py-3 border-t border-gray-100", !isOpen && "md:hidden")}>
          <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 px-2">
            <Sun className="w-4 h-4 mr-1" />
            Light
          </Button>
          <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 px-2">
            <Moon className="w-4 h-4 mr-1" />
            Dark
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;