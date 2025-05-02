import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
}

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/properties": "Imóveis",
  "/crm": "CRM",
  "/site-editor": "Meus Sites",
  "/affiliate": "Afiliação",
  "/client-portal": "Portal do Cliente",
  "/analytics": "Analytics",
  "/team": "Equipe",
  "/settings": "Configurações",
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location] = useLocation();
  const pageName = pageNames[location] || "Página";
  const today = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          <h2 className="text-xl font-heading font-semibold text-accent-dark hidden md:block">{pageName}</h2>
          
          {/* Search Input - visible on larger screens */}
          <div className="hidden md:flex ml-6 relative">
            <Input 
              placeholder="Pesquisar..." 
              className="w-64 pl-10 h-9 text-sm bg-background" 
            />
            <span className="material-icons absolute left-3 top-1.5 text-muted-foreground text-sm">search</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Display */}
          <div className="hidden md:flex items-center mr-2">
            <span className="material-icons text-accent mr-1 text-lg">today</span>
            <span className="text-sm">{today}</span>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <span className="material-icons text-lg">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
            </Button>
          </div>
          
          {/* Help Button */}
          <div className="relative hidden sm:block">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground h-9">
              <span className="material-icons text-lg">help_outline</span>
            </Button>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-accent/20 text-accent-dark">JS</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">James Philips</p>
              <p className="text-xs text-muted-foreground">UI Designer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
