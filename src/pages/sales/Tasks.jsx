import { useState } from "react";
import { CheckCircle2, Circle, Plus, Filter, Calendar, User, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Follow up with John Doe",
      description: "Call to discuss program details",
      dueDate: "2024-01-15",
      assignedTo: "Me",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Send assessment link to Jane Smith",
      description: "Assessment email for technical evaluation",
      dueDate: "2024-01-16",
      assignedTo: "Me",
      status: "completed",
      priority: "medium",
    },
  ]);
  const [filter, setFilter] = useState("all");

  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const overdueTasks = tasks.filter(t => 
    t.status === "pending" && 
    new Date(t.dueDate) < new Date()
  ).length;

  const filteredTasks = filter === "all" 
    ? tasks 
    : filter === "pending" 
    ? tasks.filter(t => t.status === "pending")
    : tasks.filter(t => t.status === "completed");

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Manage your sales tasks and follow-ups."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Circle} 
          value={pendingTasks} 
          label="Pending Tasks" 
          trend="To be completed" 
        />
        <StatsCard icon={CheckCircle2} value={completedTasks} label="Completed" trend="Done" />
        <StatsCard icon={Clock} value={overdueTasks} label="Overdue" trend="Needs attention" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">My Tasks</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant={filter === "all" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={filter === "completed" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </div>
        <div className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-textMuted">
              No tasks found. Create a new task to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 transition hover:shadow-soft"
                >
                  <button
                    onClick={() => {
                      setTasks(tasks.map(t => 
                        t.id === task.id 
                          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
                          : t
                      ));
                    }}
                    className="mt-1"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-textMuted" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${task.status === "completed" ? "text-textMuted line-through" : "text-text"}`}>
                      {task.title}
                    </h4>
                    <p className="mt-1 text-sm text-textMuted">{task.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-textMuted">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 ${
                        task.priority === "high" 
                          ? "bg-red-100 text-red-700" 
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tasks;

