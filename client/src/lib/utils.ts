import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in BRL (Brazilian Real)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format date to Brazilian format (DD/MM/YYYY)
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

// Format relative time (e.g., "há 5 minutos", "há 2 horas", "há 3 dias")
export function formatRelativeTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  
  if (diffMins < 60) {
    return `Há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  } else if (diffWeeks < 4) {
    return `Há ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
  } else {
    return `Há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
  }
}

// Truncate text with ellipsis if it exceeds the maxLength
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

// Generate initials from name (e.g., "John Doe" -> "JD")
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Convert property status to display label
export function getPropertyStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Ativo';
    case 'reserved':
      return 'Reservado';
    case 'sold':
      return 'Vendido';
    case 'inactive':
      return 'Inativo';
    default:
      return status;
  }
}

// Convert property type to display label
export function getPropertyTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'apartment':
      return 'Apartamento';
    case 'house':
      return 'Casa';
    case 'commercial':
      return 'Comercial';
    case 'land':
      return 'Terreno';
    default:
      return type;
  }
}

// Convert lead stage to display label
export function getLeadStageLabel(stage: string): string {
  switch (stage.toLowerCase()) {
    case 'initial_contact':
      return 'Contato Inicial';
    case 'qualification':
      return 'Qualificação';
    case 'scheduled_visit':
      return 'Visita Agendada';
    case 'proposal':
      return 'Proposta';
    case 'documentation':
      return 'Documentação';
    case 'closed':
      return 'Fechado';
    default:
      return stage;
  }
}

// Helper to get the source badge class
export function getSourceBadgeClass(source: string): string {
  switch (source.toLowerCase()) {
    case 'site':
      return 'bg-info/10 text-info';
    case 'whatsapp':
      return 'bg-accent/10 text-accent';
    case 'indica':
    case 'indication':
      return 'bg-secondary/10 text-secondary';
    case 'portal':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-muted-foreground/10 text-muted-foreground';
  }
}

// Helper to get the status badge class
export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'ativo':
    case 'active':
    case 'aprovado':
    case 'approved':
      return 'bg-success/10 text-success';
    case 'pendente':
    case 'pending':
    case 'reservado':
    case 'reserved':
      return 'bg-warning/10 text-warning';
    case 'inativo':
    case 'inactive':
    case 'rejected':
    case 'rejeitado':
      return 'bg-destructive/10 text-destructive';
    case 'vendido':
    case 'sold':
    case 'closed':
    case 'fechado':
      return 'bg-info/10 text-info';
    default:
      return 'bg-muted-foreground/10 text-muted-foreground';
  }
}
