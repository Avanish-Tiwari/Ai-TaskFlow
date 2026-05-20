import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  categorizeTask,
  suggestTasks,
  getTaskTip,
  analyzeTasks,
} from "../../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load tasks when page opens
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      // First create the task
      const res = await createTask({ text: newTask });
      const created = res.data;

      // Then ask AI to categorize it in background
      const aiRes = await categorizeTask(newTask);
      const { tag, priority } = aiRes.data;

      // Update task with AI category
      const updated = await updateTask(created.id, { tag, priority });

      // Add to top of list
      setTasks((prev) => [updated.data, ...prev]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await updateTask(task.id, { done: !task.done });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ─── AI ACTIONS ──────────────────────────────────
  const handleSuggest = async () => {
    setAiLoading(true);
    setAiMessage("");
    try {
      const res = await suggestTasks();
      const suggestions = res.data.suggestion.join("\n• ");
      setAiMessage("Suggested tasks:\n• " + suggestions);
    } catch (err) {
      setAiMessage("AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    setAiMessage("");
    try {
      const res = await analyzeTasks();
      setAiMessage(res.data.insight);
    } catch (err) {
      setAiMessage("AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleTip = async (taskId) => {
    setAiLoading(true);
    setAiMessage("");
    try {
      const res = await getTaskTip(taskId);
      setAiMessage("💡 " + res.data.tip);
      // Update task in list with new aiNote
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data.task : t)),
      );
    } catch (err) {
      setAiMessage("AI tip failed");
    } finally {
      setAiLoading(false);
    }
  };

  const tagColors = {
    work: "#E6F1FB",
    personal: "#EEEDFE",
    urgent: "#FCEBEB",
    health: "#EAF3DE",
  };

  const tagTextColors = {
    work: "#0C447C",
    personal: "#3C3489",
    urgent: "#791F1F",
    health: "#27500A",
  };

  const priorityColors = {
    high: "#E24B4A",
    medium: "#EF9F27",
    low: "#639922",
  };

  if (loading) return <div style={styles.center}>Loading tasks...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI TaskFlow</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statNum}>{tasks.length}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNum}>{tasks.filter((t) => t.done).length}</div>
          <div style={styles.statLabel}>Done</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNum}>
            {tasks.filter((t) => !t.done).length}
          </div>
          <div style={styles.statLabel}>Remaining</div>
        </div>
      </div>

      {/* Add Task */}
      <form onSubmit={handleAddTask} style={styles.addForm}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          style={styles.addInput}
        />
        <button type="submit" style={styles.addBtn}>
          + Add
        </button>
      </form>

      {/* AI Panel */}
      <div style={styles.aiPanel}>
        <div style={styles.aiButtons}>
          <button
            onClick={handleSuggest}
            style={styles.aiBtn}
            disabled={aiLoading}
          >
            ✨ Suggest Tasks
          </button>
          <button
            onClick={handleAnalyze}
            style={styles.aiBtn}
            disabled={aiLoading}
          >
            🧠 Analyze All
          </button>
        </div>
        {aiLoading && <div style={styles.aiMsg}>AI is thinking...</div>}
        {aiMessage && !aiLoading && <div style={styles.aiMsg}>{aiMessage}</div>}
      </div>

      {/* Task List */}
      <div style={styles.taskList}>
        {tasks.length === 0 && (
          <div style={styles.empty}>No tasks yet. Add one above!</div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              ...styles.taskCard,
              opacity: task.done ? 0.6 : 1,
            }}
          >
            <div style={styles.taskLeft}>
              {/* Priority dot */}
              <div
                style={{
                  ...styles.dot,
                  background: priorityColors[task.priority] || "#888",
                }}
              />
              {/* Checkbox */}
              <div
                onClick={() => handleToggle(task)}
                style={{
                  ...styles.checkbox,
                  background: task.done ? "#1D9E75" : "transparent",
                  borderColor: task.done ? "#1D9E75" : "#ccc",
                }}
              >
                {task.done && (
                  <span style={{ color: "white", fontSize: "12px" }}>✓</span>
                )}
              </div>
              {/* Task content */}
              <div>
                <div
                  style={{
                    ...styles.taskText,
                    textDecoration: task.done ? "line-through" : "none",
                    color: task.done ? "#999" : "#1a1a1a",
                  }}
                >
                  {task.text}
                </div>
                <div style={styles.taskMeta}>
                  <span
                    style={{
                      ...styles.tag,
                      background: tagColors[task.tag] || "#f0f0f0",
                      color: tagTextColors[task.tag] || "#333",
                    }}
                  >
                    {task.tag}
                  </span>
                  {task.aiNote && (
                    <span style={styles.aiNote}>✨ {task.aiNote}</span>
                  )}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div style={styles.taskActions}>
              <button
                onClick={() => handleTip(task.id)}
                style={styles.tipBtn}
                title="Get AI tip"
              >
                💡
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                style={styles.deleteBtn}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "680px",
    margin: "0 auto",
      overflowX: 'hidden',
    padding: "2rem 1rem",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    color: "#666",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "4px 0 0",
  },
  logoutBtn: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "1.5rem",
  },
  stat: {
    background: "#f9f9f9",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "center",
  },
  statNum: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statLabel: {
    fontSize: "12px",
    color: "#888",
    marginTop: "2px",
  },
  addForm: {
    display: "flex",
    gap: "8px",
    marginBottom: "1rem",
  },
  addInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  },
  addBtn: {
    padding: "10px 18px",
    background: "#534AB7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  aiPanel: {
    background: "#EEEDFE",
    border: "1px solid #AFA9EC",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "1.5rem",
  },
  aiButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  aiBtn: {
    padding: "8px 14px",
    background: "white",
    border: "1px solid #AFA9EC",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#534AB7",
    fontWeight: "500",
  },
  aiMsg: {
    fontSize: "13px",
    color: "#3C3489",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "2rem",
    fontSize: "14px",
  },
  taskCard: {
    background: "white",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    overflow: "hidden", // ← add this
    boxSizing: "border-box", // ← add this
  },
  taskLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    flex: 1,
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "6px",
    flexShrink: 0,
  },
  checkbox: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid #ccc",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: {
    fontSize: "15px",
    lineHeight: "1.4",
    wordBreak: 'break-word',
  },
  taskMeta: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    fontWeight: "500",
  },
  aiNote: {
    fontSize: "11px",
    color: "#888",
    marginTop: "4px",
    display: "block", // ← makes it go on its own line
    wordBreak: "break-word", // ← breaks long words
    maxWidth: "100%",
  },
  taskActions: {
    display: "flex",
    gap: "4px",
    flexShrink: 0,
  },
  tipBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
  },
};

export default Dashboard;
