import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Member } from "@shared/schema";

const UNASSIGNED = "__unassigned__";

type MemberOption = Pick<Member, "uid" | "displayName" | "role"> & { id?: string };

export function CreateTaskDialog({ projectId, members = [] }: { projectId: string; members?: MemberOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(UNASSIGNED);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const selectedMember = members.find((m) => m.uid === assignedTo);

  const handleCreate = async () => {
    if (!user || !projectId) return;
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "projects", projectId, "tasks"), {
        title,
        details,
        category,
        status: "pending",
        assignedTo: assignedTo !== UNASSIGNED ? assignedTo : null,
        assignedToName: assignedTo !== UNASSIGNED ? (selectedMember?.displayName || null) : null,
        assignedToRole: assignedTo !== UNASSIGNED ? (selectedMember?.role || null) : null,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        dueAt: dueDate || null,
        updatedAt: new Date().toISOString()
      });

      toast({ title: "Task added" });
      setOpen(false);
      setTitle("");
      setDetails("");
      setDueDate("");
      setAssignedTo(UNASSIGNED);
    } catch (error: any) {
      toast({
        title: "Error adding task",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Break down the project into manageable steps.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due">Due Date</Label>
              <Input 
                id="due" 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {members && members.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assign To (Optional)</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id || m.uid} value={m.uid}>
                      {m.displayName} {m.role ? `(${m.role})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea 
              id="details" 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add more context..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !title}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
