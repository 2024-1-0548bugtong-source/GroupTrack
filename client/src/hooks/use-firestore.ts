import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  DocumentData,
  orderBy
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

  // Note: To truly list "Joined" projects properly in Firestore without 
  // composite indexes or collection group queries, we're doing a simplification:
  // 1. We list projects created by the user
  // 2. We could also maintain a 'joinedProjects' array on the user profile.
  // For this MVP, we'll fetch projects created by user. 
  // Ideally, 'My Projects' would include joined ones too.
  
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "projects"), 
      where("createdBy", "==", uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project & { id: string }));
      // Sort client side for simplicity if timestamp index missing
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(items);
      setLoading(false);
    });

    return () => unsub();
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
