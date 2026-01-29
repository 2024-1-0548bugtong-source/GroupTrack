import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleCreate = async () => {
    if (!user) return;
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      // Generate readable join code
      const joinCode = "GT-" + nanoid(5).toUpperCase();
      
      const newProject = {
        name,
        description,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        joinCode,
        status: "active" as const,
      };

      // Validate
      projectSchema.parse(newProject);

      const docRef = await addDoc(collection(db, "projects"), newProject);

      // Add creator as leader
      await setDoc(doc(db, "projects", docRef.id, "members", user.uid), {
        uid: user.uid,
        displayName: "Leader", // In real app, prompt for name
        role: "leader",
        joinedAt: new Date().toISOString(),
        isActive: true
      });

      toast({
        title: "Project created!",
        description: `Join code: ${joinCode}`,
      });

      setOpen(false);
      setName("");
      setDescription("");
      setLocation(`/project/${docRef.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-primary">New Project</DialogTitle>
          <DialogDescription>
            Start a new group project. You'll become the team leader.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. CS 101 Final Project" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-medium"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Brief overview of goals..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
