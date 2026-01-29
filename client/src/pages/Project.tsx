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
  CheckCircle2, Circle, Clock, Download, 
  LayoutDashboard, ListTodo, PieChart, Users, Trash2 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
    const headers = ["Title", "Status", "Category", "Created At", "Due Date"];
    const rows = tasks.map(t => [
      t.title,
      t.status,
      t.category || "",
      new Date(t.createdAt).toLocaleDateString(),
      t.dueAt ? new Date(t.dueAt).toLocaleDateString() : ""
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_tasks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Analytics Data ---
  const statusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
  ];

  const completionRate = tasks.length 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display font-bold text-gray-900">{project.name}</h1>
                <Badge variant="outline" className="text-xs uppercase tracking-widest">
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Join Code</span>
              <span className="text-2xl font-mono font-bold tracking-wider text-primary select-all">
                {project.joinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm border p-1 rounded-xl w-full justify-start md:w-auto h-auto grid grid-cols-3 md:flex">
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
                <CreateTaskDialog projectId={projectId} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['pending', 'in_progress', 'completed'].map((status) => {
                const columnTasks = tasks.filter(t => t.status === status);
                return (
                  <div key={status} className="bg-slate-50/50 rounded-xl p-4 border min-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                        {status.replace('_', ' ')}
                      </h3>
                      <Badge variant="secondary" className="rounded-full">{columnTasks.length}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {columnTasks.map(task => (
                        <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {task.category || "General"}
                              </span>
                              {task.createdBy === user?.uid && (
                                <button 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {task.details || "No details provided"}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4">
                              <Select 
                                defaultValue={task.status} 
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
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(new Date(task.dueAt), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {member.uid.slice(0, 2).toUpperCase()}
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
                            <span className="flex items-center text-green-600 text-xs font-medium">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                              Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Inactive</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS CONTENT */}
          <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-primary text-primary-foreground border-none">
                <CardHeader className="pb-2">
                  <CardDescription className="text-primary-foreground/80">Total Tasks</CardDescription>
                  <CardTitle className="text-4xl">{tasks.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completion Rate</CardDescription>
                  <CardTitle className="text-4xl">{completionRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Team Members</CardDescription>
                  <CardTitle className="text-4xl">{members.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Days Active</CardDescription>
                  <CardTitle className="text-4xl">
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
