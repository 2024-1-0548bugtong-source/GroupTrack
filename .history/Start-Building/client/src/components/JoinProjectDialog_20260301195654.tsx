import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, setDoc, doc, arrayUnion } from "firebase/firestore";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JoinProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const { user, nickname } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleJoin = async () => {
    if (!user) return;
    if (!code.trim()) return;

    setLoading(true);
    try {
      // Find project by code
      const q = query(collection(db, "projects"), where("joinCode", "==", code.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Invalid join code");
      }

      const projectDoc = snapshot.docs[0];
      const projectId = projectDoc.id;

      // Add user to members
      await setDoc(doc(db, "projects", projectId, "members", user.uid), {
        uid: user.uid,
        displayName: nickname || "Member",
        role: "member",
        joinedAt: new Date().toISOString(),
        isActive: true
      });

      // Track this project in user's profile
      await setDoc(doc(db, "users", user.uid), {
        projectIds: arrayUnion(projectId)
      }, { merge: true });

      toast({
        title: "Joined successfully!",
        description: `Welcome to ${projectDoc.data().name}`,
      });

      setOpen(false);
      setCode("");
      setLocation(`/project/${projectId}`);
    } catch (error: any) {
      toast({
        title: "Cannot join",
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
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Join Existing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
          <DialogDescription>
            Enter the unique code shared by your team leader.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Join Code</Label>
            <Input 
              id="code" 
              placeholder="e.g. GT-X9Y2Z" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase font-mono tracking-widest text-center text-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={loading || !code}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
