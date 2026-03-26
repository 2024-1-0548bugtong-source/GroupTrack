import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  documentId
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project, Task, Member } from "@shared/schema";

// --- Projects ---

export function useProject(id: string) {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, "projects", id), 
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as Project & { id: string });
        } else {
          setError(new Error("Project not found"));
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  return { data, loading, error };
}

export function useUserProjects(uid: string | undefined) {
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let projectUnsub: (() => void) | null = null;

    // Listen to user profile for project IDs (includes both created & joined)
    const userUnsub = onSnapshot(doc(db, "users", uid), (userSnap) => {
      if (projectUnsub) projectUnsub();

      if (!userSnap.exists()) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectIds: string[] = userSnap.data().projectIds || [];
      if (projectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Real-time listener for all user's projects
      const q = query(
        collection(db, "projects"),
        where(documentId(), "in", projectIds.slice(0, 30))
      );

      projectUnsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project & { id: string }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProjects(items);
        setLoading(false);
      });
    });

    return () => {
      userUnsub();
      if (projectUnsub) projectUnsub();
    };
  }, [uid]);

  return { projects, loading };
}

// --- Tasks ---

export function useProjectTasks(projectId: string) {
  const [tasks, setTasks] = useState<(Task & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    // Simple query, sorting client side to avoid index issues during dev
    const q = query(collection(db, "projects", projectId, "tasks"));

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task & { id: string }));
      // Sort by status (pending first) then due date
      setTasks(items);
      setLoading(false);
    });

    return () => unsub();
  }, [projectId]);

  return { tasks, loading };
}

// --- Members ---

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<(Member & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, "projects", projectId, "members"));

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member & { id: string }));
      setMembers(items);
      setLoading(false);
    });

    return () => unsub();
  }, [projectId]);

  return { members, loading };
}
