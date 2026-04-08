import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { saveLocalFile } from "@/lib/local-file-storage";
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

function isUidLike(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[A-Za-z0-9_-]{20,}$/.test(value.trim());
}

function getMemberDisplayName(member: any): string {
  const name = typeof member?.displayName === "string" ? member.displayName.trim() : "";
  if (name && !isUidLike(name)) return name;

  const email = typeof member?.email === "string" ? member.email.trim() : "";
  if (email.includes("@")) return email.split("@")[0];

  return "Member";
}

type MemberOption = Pick<Member, "uid" | "displayName" | "role"> & { id?: string };

export function CreateTaskDialog({
  projectId,
  members = [],
  isLeader = false,
}: {
  projectId: string;
  members?: MemberOption[];
  isLeader?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(UNASSIGNED);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const selectedMember = members.find((m) => m.uid === assignedTo);

  const handleCreate = async () => {
    if (!user || !projectId) return;
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, "projects", projectId, "tasks"), {
        title,
        details,
        category,
        status: "pending",
        assignedTo: assignedTo !== UNASSIGNED ? assignedTo : null,
        assignedToName: assignedTo !== UNASSIGNED ? (selectedMember ? getMemberDisplayName(selectedMember) : null) : null,
        assignedToRole: assignedTo !== UNASSIGNED ? (selectedMember?.role || null) : null,
        createdBy: user.uid,
        createdAt: now,
        dueAt: dueDate || null,
        updatedAt: now,
        submittedAt: null,
        submittedByUid: null,
        submittedByName: null,
        submissionDueAt: null,
        isLateSubmission: null,
        approvedAt: null,
        approvedByUid: null,
        approvedByName: null,
        approvalDecision: null,
        revisionCount: 0,
        assignmentFiles: [],
        submissionFiles: [],
        officialSubmissionFiles: [],
      });

      if (isLeader && assignmentFiles.length > 0) {
        const uploaderName = user.displayName || user.email?.split("@")[0] || "Leader";
        const uploaded = await Promise.all(
          assignmentFiles.map(async (file) => {
            const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const localFileId = `assignment-${projectId}-${docRef.id}-${fileId}`;
            await saveLocalFile(file, localFileId);
            const storagePath = `local://projects/${projectId}/tasks/${docRef.id}/assignment/${fileId}-${file.name}`;
            return {
              fileId,
              storagePath,
              downloadURL: null,
              localFileId,
              name: file.name,
              mimeType: file.type || "application/octet-stream",
              sizeBytes: file.size,
              uploadedByUid: user.uid,
              uploadedByName: uploaderName,
              uploadedAt: new Date().toISOString(),
              stage: "assignment" as const,
            };
          })
        );

        await updateDoc(docRef, {
          assignmentFiles: uploaded,
          updatedAt: new Date().toISOString(),
        });
      }

      toast({ title: "Task added" });
      setOpen(false);
      setTitle("");
      setDetails("");
      setDueDate("");
      setAssignedTo(UNASSIGNED);
      setAssignmentFiles([]);
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
                      {getMemberDisplayName(m)} {m.role ? `(${m.role})` : ""}
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
          {isLeader && (
            <div className="grid gap-2">
              <Label htmlFor="assignmentFiles">Assignment Files (Optional)</Label>
              <Input
                id="assignmentFiles"
                type="file"
                multiple
                onChange={(e) => setAssignmentFiles(Array.from(e.target.files || []))}
              />
              <p className="text-xs text-muted-foreground">
                Members will be able to view and download these files.
              </p>
            </div>
          )}
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
