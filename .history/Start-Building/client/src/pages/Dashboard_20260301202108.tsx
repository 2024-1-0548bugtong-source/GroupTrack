import { useAuth } from "@/hooks/use-auth";
import { useUserProjects } from "@/hooks/use-firestore";
import { Layout } from "@/components/Layout";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { JoinProjectDialog } from "@/components/JoinProjectDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Calendar, Users, ArrowRight, FolderKanban, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, nickname } = useAuth();
  const { projects, loading } = useUserProjects(user?.uid);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const activeCount = projects.filter(p => p.status === 'active').length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{greeting} 👋</p>
              <h1 className="text-3xl font-display font-bold">
                <span className="gradient-text">{nickname || "there"}</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {projects.length > 0 
                  ? `You have ${activeCount} active project${activeCount !== 1 ? 's' : ''}.`
                  : "Start by creating or joining a project."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <JoinProjectDialog />
              <CreateProjectDialog />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <div className="h-1 w-full bg-muted rounded-t-xl" />
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <FolderKanban className="h-9 w-9 text-primary/60" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-display font-semibold">No projects yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2 mb-8 leading-relaxed">
                Create a new project or ask your team leader for a join code to get started.
              </p>
              <CreateProjectDialog />
            </div>
          ) : (
            projects.map((project, i) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className={`group cursor-pointer card-interactive h-full flex flex-col border border-border/60 bg-card overflow-hidden animate-fade-in-up animate-delay-${Math.min(i, 4)}`}>
                  {/* Gradient top accent */}
                  <div className={`h-1 w-full ${project.status === 'active' ? 'gradient-stripe' : 'bg-muted'}`} />
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs leading-relaxed min-h-[2rem]">
                          {project.description || "No description provided."}
                        </CardDescription>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        project.status === 'active' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {project.status}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="mt-auto pt-0 pb-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Team</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs font-semibold text-primary pt-3 border-t border-border/50">
                      <span>Open Project</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
