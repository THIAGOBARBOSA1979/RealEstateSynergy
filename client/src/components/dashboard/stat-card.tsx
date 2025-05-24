import { ArrowDown, ArrowUp } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change: {
    percentage: number;
    label: string;
  };
  iconColor?: "primary" | "secondary" | "accent" | "info";
}

const StatCard = ({ title, value, icon, change, iconColor = "primary" }: StatCardProps) => {
  const iconClasses = {
    primary: "text-primary-light",
    secondary: "text-secondary",
    accent: "text-accent",
    info: "text-info",
  };

  const isPositive = change.percentage >= 0;
  
  return (
    <div className="bg-card rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-muted-foreground font-medium">{title}</h3>
        <div className={iconClasses[iconColor]}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <div className="flex items-center mt-2 text-sm">
        <span className={`flex items-center ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? 
            <ArrowUp className="h-4 w-4 mr-1" /> : 
            <ArrowDown className="h-4 w-4 mr-1" />
          }
          {Math.abs(change.percentage)}%
        </span>
        <span className="text-muted-foreground ml-2">{change.label}</span>
      </div>
    </div>
  );
};

export default StatCard;
