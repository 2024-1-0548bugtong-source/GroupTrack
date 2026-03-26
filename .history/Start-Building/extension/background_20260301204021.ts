/// <reference types="chrome" />
// GroupTrack Extension - Background Service Worker
// Handles alarms for task deadline notifications

interface TaskPayload {
  id: string;
  title: string;
  status: string;
  dueAt?: string | null;
}

interface UpdateTasksMessage {
  type: "UPDATE_TASKS";
  tasks: TaskPayload[];
}

chrome.runtime.onInstalled.addListener(() => {
  // Enable side panel on install
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }

  // Set up periodic alarm to check tasks (every 30 minutes)
  chrome.alarms.create("check-deadlines", { periodInMinutes: 30 });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  if (alarm.name === "check-deadlines") {
    checkTasksFromStorage();
  }
});

// Check tasks stored by the popup/side panel
async function checkTasksFromStorage(): Promise<void> {
  try {
    const result = await chrome.storage.local.get("grouptrack_tasks");
    const tasks: TaskPayload[] = (result.grouptrack_tasks as TaskPayload[] | undefined) || [];
    const now = Date.now();

    for (const task of tasks) {
      if (!task.dueAt || task.status === "completed") continue;

      const due = new Date(task.dueAt).getTime();
      const hoursLeft = (due - now) / (1000 * 60 * 60);

      if (hoursLeft < 0) {
        chrome.notifications.create(`overdue-${task.id}`, {
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: "⏰ Task Overdue!",
          message: `"${task.title}" is overdue. Open GroupTrack to update it.`,
          priority: 2,
        });
      } else if (hoursLeft <= 24) {
        chrome.notifications.create(`due-soon-${task.id}`, {
          type: "basic",
          iconUrl: "icons/icon-128.png",
          title: "⚠️ Task Due Soon",
          message: `"${task.title}" is due in ${Math.round(hoursLeft)} hour${Math.round(hoursLeft) !== 1 ? "s" : ""}.`,
          priority: 1,
        });
      }
    }
  } catch (_e) {
    // Storage may not have tasks yet
  }
}

// Handle notification click — open the popup
chrome.notifications.onClicked.addListener(() => {
  chrome.action.openPopup();
});

// Listen for messages from the popup to store tasks for background checking
chrome.runtime.onMessage.addListener(
  (
    message: UpdateTasksMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { ok: boolean }) => void
  ) => {
    if (message.type === "UPDATE_TASKS") {
      chrome.storage.local.set({ grouptrack_tasks: message.tasks });
      sendResponse({ ok: true });
    }
  }
);
