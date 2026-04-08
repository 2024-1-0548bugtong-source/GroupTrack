import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProject, useProjectTasks, useProjectMembers } from "@/hooks/use-firestore";
import { Layout } from "@/components/Layout";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Circle, Clock, Download, Archive,
  LayoutDashboard, ListTodo, PieChart, Users, Trash2, UserMinus 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useTaskNotifications } from "@/hooks/use-notifications";
import { format } from "date-fns";

type TaskStatus = "pending" | "in_progress" | "completed";

function normalizeTaskStatus(status: string | null | undefined): TaskStatus {
  const normalized = (status || "").toLowerCase().trim().replace(/[-\s]+/g, "_");
  if (normalized === "in_progress" || normalized === "inprogress") return "in_progress";
  if (normalized === "completed" || normalized === "complete" || normalized === "done") return "completed";
  return "pending";
}

function getStatusLabel(status: TaskStatus): string {
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  return "Pending";
}

export default function ProjectPage() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id || "";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: project, loading: projectLoading } = useProject(projectId);
  const { tasks, loading: tasksLoading } = useProjectTasks(projectId);
  const { members, loading: membersLoading } = useProjectMembers(projectId);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("tasks");

  const membersByUid = new Map(members.map((m) => [m.uid, m]));

  // Notification alerts for overdue / near-due tasks
  useTaskNotifications(tasks);

  if (projectLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button className="mt-4" onClick={() => setLocation("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // --- Handlers ---
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateDoc(doc(db, "projects", projectId, "tasks", taskId), { 
        status, 
        updatedAt: new Date().toISOString() 
      });
      toast({ title: "Status updated" });
    } catch (e) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
      toast({ title: "Task deleted" });
    } catch (e) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Title", "Status", "Category", "Assigned To", "Assigned Role", "Created At", "Due Date"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = tasks.map(t => [
      esc(t.title),
      esc(getStatusLabel(normalizeTaskStatus(t.status))),
      esc(t.category || ""),
      esc(t.assignedToName || (t.assignedTo ? membersByUid.get(t.assignedTo)?.displayName || "" : "")),
      esc((t as any).assignedToRole || (t.assignedTo ? membersByUid.get(t.assignedTo)?.role || "" : "")),
      esc(new Date(t.createdAt).toLocaleDateString()),
      esc(t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "")
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.map(esc).join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_tasks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Analytics Data ---
  const isLeader = members.some(m => m.uid === user?.uid && m.role === 'leader');

  const handleArchiveProject = async () => {
    try {
      await updateDoc(doc(db, "projects", projectId), { 
        status: project.status === 'archived' ? 'active' : 'archived' 
      });
      toast({ title: project.status === 'archived' ? "Project restored" : "Project archived" });
    } catch (e) {
      toast({ title: "Failed to update project", variant: "destructive" });
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Delete this project permanently? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast({ title: "Project deleted" });
      setLocation("/dashboard");
    } catch (e) {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId, "members", memberId));
      toast({ title: "Member removed" });
    } catch (e) {
      toast({ title: "Failed to remove member", variant: "destructive" });
    }
  };

  const statusData = [
    { name: 'Pending', value: tasks.filter(t => normalizeTaskStatus(t.status) === 'pending').length, color: '#a1a1aa' },
    { name: 'In Progress', value: tasks.filter(t => normalizeTaskStatus(t.status) === 'in_progress').length, color: '#c026a3' },
    { name: 'Completed', value: tasks.filter(t => normalizeTaskStatus(t.status) === 'completed').length, color: '#a855f7' },
  ];

  const completionRate = tasks.length 
    ? Math.round((tasks.filter(t => normalizeTaskStatus(t.status) === 'completed').length / tasks.length) * 100) 
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-border/50 pb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">{project.name}</h1>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm max-w-2xl">{project.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end bg-card border rounded-lg px-3 py-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Join Code</span>
                <span className="text-lg font-mono font-bold tracking-wider text-primary select-all">
                  {project.joinCode}
                </span>
              </div>
              {isLeader && (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleArchiveProject} title={project.status === 'archived' ? 'Restore project' : 'Archive project'}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleDeleteProject} className="hover:bg-destructive/10 hover:text-destructive" title="Delete project">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-medium">Overall Progress</span>
            <span className="font-semibold text-foreground">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full gradient-stripe rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${completionRate}%` }} 
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border p-1 rounded-xl w-full justify-start md:w-auto h-auto grid grid-cols-3 md:flex">
            <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5">
              <ListTodo className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* TASKS CONTENT */}
          <TabsContent value="tasks" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks & Deliverables</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV} disabled={tasks.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <CreateTaskDialog projectId={projectId} members={members} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['pending', 'in_progress', 'completed'].map((status) => {
                const columnStatus = status as TaskStatus;
                const columnTasks = tasks.filter(t => normalizeTaskStatus(t.status) === columnStatus);
                return (
                  <div key={status} className="bg-card rounded-xl p-4 border min-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'pending' ? 'bg-zinc-400' : status === 'in_progress' ? 'bg-primary' : 'bg-purple-500'
                        }`} />
                        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                          {getStatusLabel(columnStatus)}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="rounded-full">{columnTasks.length}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {columnTasks.map(task => {
                        const normalizedStatus = normalizeTaskStatus(task.status);
                        const assignedName = task.assignedToName || (task.assignedTo ? membersByUid.get(task.assignedTo)?.displayName : null);
                        const assignedRole = (task as any).assignedToRole || (task.assignedTo ? membersByUid.get(task.assignedTo)?.role : null);

                        return (
                          <Card key={task.id} className={`card-interactive status-border-${normalizedStatus} shadow-sm ${
                            task.dueAt && new Date(task.dueAt) < new Date() && normalizedStatus !== 'completed'
                              ? 'border-red-300 dark:border-red-800'
                              : ''
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {task.category || "General"}
                                </span>
                                {(task.createdBy === user?.uid || isLeader) && (
                                  <button 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {task.details || "No details provided"}
                              </p>
                              {assignedName && (
                                <p className="text-xs text-primary/70 mb-2">
                                  \u2192 {assignedName}{assignedRole ? ` (${assignedRole})` : ""}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-3">
                                <Select 
                                  value={normalizedStatus} 
                                  onValueChange={(val) => handleStatusChange(task.id, val)}
                                >
                                  <SelectTrigger className="h-7 w-[100px] text-[10px] uppercase font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {task.dueAt && (
                                  <span className={`text-xs flex items-center ${
                                    new Date(task.dueAt) < new Date() && normalizedStatus !== 'completed'
                                      ? 'text-red-500 font-medium'
                                      : 'text-muted-foreground'
                                  }`}>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {format(new Date(task.dueAt), 'MMM d')}
                                    {new Date(task.dueAt) < new Date() && normalizedStatus !== 'completed' && (
                                      <span className="ml-1">(Overdue)</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {columnTasks.length === 0 && (
                        <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* MEMBERS CONTENT */}
          <TabsContent value="members" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  People collaborating on this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      {isLeader && <TableHead className="w-10"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading members...
                        </TableCell>
                      </TableRow>
                    ) : members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                            {(member.displayName || member.uid).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span>{member.displayName}</span>
                            <span className="text-xs text-muted-foreground">{member.uid.slice(0, 6)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <span className="flex items-center text-fuchsia-600 dark:text-fuchsia-400 text-xs font-medium">
                              <div className="w-2 h-2 rounded-full bg-fuchsia-500 mr-2" />
                              Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Inactive</span>
                          )}
                        </TableCell>
                        {isLeader && (
                          <TableCell>
                            {member.role !== 'leader' && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                title="Remove member"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS CONTENT */}
          <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none card-interactive">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-primary-foreground/80 text-xs">Total Tasks</CardDescription>
                    <ListTodo className="h-4 w-4 text-primary-foreground/60" />
                  </div>
                  <CardTitle className="text-3xl font-display">{tasks.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="card-interactive">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Completion Rate</CardDescription>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl font-display">{completionRate}%</CardTitle>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <div className="h-full gradient-stripe rounded-full" style={{ width: `${completionRate}%` }} />
                  </div>
                </CardHeader>
              </Card>
              <Card className="card-interactive">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Team Members</CardDescription>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl font-display">{members.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="card-interactive">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Days Active</CardDescription>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl font-display">
                    {Math.max(1, Math.floor((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 3600 * 24)))}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Status of all project deliverables</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
