import { newId, type TaskStatus } from "@mobilepc/shared";

export interface TaskRecord {
  id: string;
  prompt: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  artifacts: string[];
  error?: string;
}

export class TaskStore {
  private readonly tasks = new Map<string, TaskRecord>();

  create(prompt: string): TaskRecord {
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: newId("task"),
      prompt,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      artifacts: []
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, patch: Partial<Omit<TaskRecord, "id" | "createdAt">>): TaskRecord | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const next = { ...task, ...patch, updatedAt: new Date().toISOString() };
    this.tasks.set(id, next);
    return next;
  }

  list(): TaskRecord[] {
    return [...this.tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
