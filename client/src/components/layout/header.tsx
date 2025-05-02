import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          <h2 className="text-xl font-heading font-semibold">{pageName}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <span className="material-icons">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
            </Button>
          </div>
          <div className="relative">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <span>Ajuda</span>
              <span className="material-icons">help_outline</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
