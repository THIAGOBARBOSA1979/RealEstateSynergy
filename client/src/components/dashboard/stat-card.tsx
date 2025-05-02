interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
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
        <span className={`material-icons ${iconClasses[iconColor]}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <div className="flex items-center mt-2 text-sm">
        <span className={`flex items-center ${isPositive ? 'text-success' : 'text-error'}`}>
          <span className="material-icons text-sm mr-1">
            {isPositive ? 'arrow_upward' : 'arrow_downward'}
          </span>
          {Math.abs(change.percentage)}%
        </span>
        <span className="text-muted-foreground ml-2">{change.label}</span>
      </div>
    </div>
  );
};

export default StatCard;
