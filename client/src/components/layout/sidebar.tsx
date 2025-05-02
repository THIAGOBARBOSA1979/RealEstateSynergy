import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/site-editor", label: "Meus Sites", icon: "language" },
  { path: "/properties", label: "Imóveis", icon: "home" },
  { path: "/crm", label: "CRM", icon: "view_kanban" },
  { path: "/affiliate", label: "Afiliação", icon: "handshake" },
  { path: "/client-portal", label: "Portal Cliente", icon: "people" },
  { path: "/analytics", label: "Analytics", icon: "bar_chart" },
  { path: "/team", label: "Equipe", icon: "groups" },
  { path: "/settings", label: "Configurações", icon: "settings" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "bg-sidebar text-sidebar-foreground fixed md:relative inset-y-0 left-0 z-20 w-64 transition-transform duration-300 ease-in-out",
        !isOpen && "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo Area */}
        <div className="px-4 py-6 border-b border-sidebar-border">
          <h1 className="text-xl font-heading font-bold flex items-center">
            <span className="material-icons mr-2">apartment</span>
            ImobConnect
          </h1>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-6 flex-1 overflow-y-auto">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 transition-colors",
                    location === item.path 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                  )}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white">
              <span className="material-icons">person</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Carlos Silva</p>
              <p className="text-xs text-sidebar-foreground/70">Plano Professional</p>
            </div>
            <div className="ml-auto">
              <button className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <span className="material-icons">logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
