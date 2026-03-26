import { useAuth } from "@/hooks/use-auth";
import { useUserProjects } from "@/hooks/use-firestore";
import { Layout } from "@/components/Layout";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { JoinProjectDialog } from "@/components/JoinProjectDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Calendar, Users, ArrowRight, FolderKanban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading } = useUserProjects(user?.uid);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
              My Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your academic collaborations and track progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <JoinProjectDialog />
            <CreateProjectDialog />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading Skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white/50">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : projects.length === 0 ? (
            // Empty State
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-secondary/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                You haven't created or joined any projects yet. Create a new one or ask your team lead for a join code.
              </p>
              <CreateProjectDialog />
            </div>
          ) : (
            // Project Cards
            projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 h-full flex flex-col border border-border/60 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                          {project.description || "No description provided."}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(project.createdAt))} ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Team Project</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-px bg-border/50 mb-4" />
                    
                    <div className="flex items-center justify-between text-sm font-medium text-primary">
                      <span>View Dashboard</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
