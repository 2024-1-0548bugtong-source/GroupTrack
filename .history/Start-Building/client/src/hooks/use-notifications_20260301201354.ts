import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  status: string;
  dueAt?: string | null;
  [key: string]: any;
}

// Request browser notification permission on first call
function requestPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Send a browser notification + optional sound
function sendBrowserNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const n = new Notification(title, {
      body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: body, // prevent duplicate notifications with same body
    });

    // Play alarm sound for overdue tasks
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0NRIzeli1EHR9njMHTqGVRUHN+goF8gYmWo6aZiXNqdH+LlJmThnt0e4mTmZWJfXh+ipOYloqDfn+JkZaVi4WBg4qRlJWMhoSEiZCTk4yIhoaIjo+QjomIh4iNjo6NiomIiIyNjYyKioqKi4yMi4qKioqLi4uLioqKiouLi4uKioqKi4uLi4qKioqLi4uLioqKiouLi4uKioqKi4uLi4uKioqLi4uLi4qKiouLi4uLioqKi4uLi4uKioqLi4uLi4qKiouLi4uLi4qKi4uLi4uLioqLi4uLi4uKiouLi4uLi4qKi4uLi4uKioqL");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    // Auto-close after 5 seconds
    setTimeout(() => n.close(), 5000);
  }
}

export function useTaskNotifications(tasks: Task[]) {
  const { toast } = useToast();
  const notifiedRef = useRef<Set<string>>(new Set());

  // Request permission once
  useEffect(() => {
    requestPermission();
  }, []);

  // Check tasks every 60 seconds + on task list change
  useEffect(() => {
    if (!tasks.length) return;

    const checkTasks = () => {
      const now = new Date();

      tasks.forEach((task) => {
        if (!task.dueAt || task.status === "completed") return;

        const due = new Date(task.dueAt);
        const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        const taskKey = `${task.id}-${task.dueAt}`;

        // Already notified this session for this task+due combo
        if (notifiedRef.current.has(taskKey)) return;

        if (hoursUntilDue < 0) {
          // OVERDUE
          const overdueDays = Math.abs(Math.floor(hoursUntilDue / 24));
          const label = overdueDays > 0 ? `${overdueDays}d overdue` : "overdue";

          notifiedRef.current.add(taskKey);
          toast({
            title: `⏰ Overdue: ${task.title}`,
            description: `This task is ${label}!`,
            variant: "destructive",
          });
          sendBrowserNotification(
            "⏰ Task Overdue!",
            `"${task.title}" is ${label}`
          );
        } else if (hoursUntilDue <= 24) {
          // DUE WITHIN 24 HOURS
          const hoursLeft = Math.max(1, Math.round(hoursUntilDue));

          notifiedRef.current.add(taskKey);
          toast({
            title: `⚠️ Due soon: ${task.title}`,
            description: `Due in ${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}!`,
          });
          sendBrowserNotification(
            "⚠️ Task Due Soon!",
            `"${task.title}" is due in ${hoursLeft}h`
          );
        }
      });
    };

    // Check immediately on load/task change
    checkTasks();

    // Re-check every 60 seconds
    const interval = setInterval(checkTasks, 60_000);
    return () => clearInterval(interval);
  }, [tasks, toast]);
}
