import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    role: "agent",
    username: "",
    password: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch team members
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['/api/team'],
  });

  // Add new team member
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest("POST", "/api/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      setIsAddMemberOpen(false);
      setNewMember({
        fullName: "",
        email: "",
        role: "agent",
        username: "",
        password: "",
      });
      toast({
        title: "Membro adicionado",
        description: "O novo membro foi adicionado com sucesso à sua equipe.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: "Ocorreu um erro ao adicionar o novo membro.",
        variant: "destructive",
      });
    },
  });

  // Update team member status
  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return apiRequest("PATCH", `/api/team/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      toast({
        title: "Status atualizado",
        description: "O status do membro foi atualizado com sucesso.",
        variant: "default",
      });
    },
  });

  const handleAddMember = () => {
    addTeamMemberMutation.mutate(newMember);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateTeamMemberMutation.mutate({ id, active: !currentStatus });
  };

  // Filter team members by search term
  const filteredTeamMembers = teamMembers
    ? teamMembers.filter((member: any) =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-primary/10 text-primary';
      case 'agent':
        return 'bg-info/10 text-info';
      case 'assistant':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'agent':
        return 'Corretor';
      case 'assistant':
        return 'Assistente';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Gerenciamento de Equipe</h1>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons text-sm mr-1">person_add</span>
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para adicionar um novo membro à sua equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={newMember.username}
                  onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="agent">Corretor</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMember} disabled={addTeamMemberMutation.isPending}>
                {addTeamMemberMutation.isPending ? "Adicionando..." : "Adicionar Membro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar por nome, email ou função"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Gerencie os membros da sua equipe, suas funções e permissões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTeam ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-[100px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTeamMembers.length > 0 ? (
                  filteredTeamMembers.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeClass(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.active ? "default" : "outline"} className={member.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                          {member.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(member.id, member.active)}
                            disabled={updateTeamMemberMutation.isPending}
                          >
                            {member.active ? "Desativar" : "Ativar"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estrutura Hierárquica</CardTitle>
            <CardDescription>
              Visualize a hierarquia da sua equipe e as relações entre os membros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
              <p className="text-muted-foreground">
                Diagrama hierárquico da equipe será exibido aqui
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissões e Configurações</CardTitle>
            <CardDescription>
              Configure as permissões globais para cada função na sua equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-medium">Administrador</h4>
                  <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <h4 className="font-medium">Corretor</h4>
                  <p className="text-sm text-muted-foreground">Gerencia seus próprios imóveis e leads</p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <h4 className="font-medium">Assistente</h4>
                  <p className="text-sm text-muted-foreground">Acesso limitado e suporte administrativo</p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Team;
