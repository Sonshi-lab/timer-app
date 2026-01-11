"use client";

import { useState, useEffect } from "react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useTimer } from "@/hooks/useTimer";
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";
import { GoogleTasksList } from "@/components/GoogleTasksList";

export default function Home() {
    const { tasks, addTask, deleteTask, toggleTask, updateTaskTime, isLoaded } = useTasks();
    const { timeLeft, setTime, isRunning, start, pause, reset, formattedTime, progress } = useTimer();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const activeTask = tasks.find(t => t.id === activeTaskId);

    // Sync timer changes to the active task
    useEffect(() => {
        if (activeTaskId && isRunning) {
            updateTaskTime(activeTaskId, timeLeft);
        }
    }, [timeLeft, activeTaskId, isRunning]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle);
        setNewTaskTitle("");
    };

    const handleSelectTask = (task: Task) => {
        // If we are switching FROM a task, the useEffect above has already kept it updated

        // Switch to new task
        setActiveTaskId(task.id);

        // Set timer to this task's saved time
        // If default is 0 or undefined, fallback to 25 mins (1500s)
        const timeToSet = task.timeLeft || 25 * 60;
        setTime(timeToSet);

        // Don't auto-start, let user decide or keep running if desired.
        // Usually switching tasks pauses the timer to avoid confusion.
        if (task.id !== activeTaskId) {
            pause();
        }
    };

    const formatTimeForCard = (seconds: number) => {
        if (seconds === undefined || seconds === null) return "25:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isLoaded) return <div className="min-h-screen bg-black" />;

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8 safe-area-inset-bottom">

            {/* Timer Section */}
            <div className="w-full max-w-md flex flex-col items-center mb-8">
                <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                    {/* Progress Circle Background */}
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="#333"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="#FF4500"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - (activeTask ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : 0))}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    <div className="text-center z-10">
                        <div className="text-6xl font-bold tracking-tighter tabular-nums">
                            {formattedTime}
                        </div>
                        {activeTask ? (
                            <div className="text-orange-500 font-medium mt-2 max-w-[180px] truncate">
                                {activeTask.title}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm mt-2">Select a task</div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-6 mb-8">
                    <button
                        onClick={reset}
                        className="p-4 rounded-full bg-gray-900 hover:bg-gray-800 transition active:scale-95"
                    >
                        <RotateCcw className="w-6 h-6 text-gray-400" />
                    </button>

                    <button
                        onClick={isRunning ? pause : start}
                        disabled={!activeTaskId}
                        className="p-6 rounded-full bg-orange-600 hover:bg-orange-500 transition active:scale-95 shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? (
                            <Pause className="w-8 h-8 text-white fill-current" />
                        ) : (
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                        )}
                    </button>
                </div>
            </div>

            {/* Task List Section */}
            <div className="w-full max-w-md bg-gray-900/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Tasks <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{tasks.length}</span>
                </h2>

                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add new task..."
                        className="flex-1 bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition placeholder:text-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="bg-orange-600 rounded-xl p-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </form>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {tasks.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No tasks yet. Add one to focus!
                        </div>
                    )}

                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => handleSelectTask(task)}
                            className={clsx(
                                "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition border border-transparent",
                                activeTaskId === task.id ? "bg-gray-800 border-orange-500/30" : "bg-gray-800/50 hover:bg-gray-800",
                                task.completed && "opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(task.id);
                                    }}
                                    className="shrink-0 text-gray-400 hover:text-orange-500 transition"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </button>
                                <div className="flex flex-col min-w-0">
                                    <span className={clsx(
                                        "truncate font-medium transition",
                                        task.completed ? "line-through text-gray-500" : "text-gray-200"
                                    )}>
                                        {task.title}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {formatTimeForCard(task.timeLeft || 25 * 60)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Google Tasks Section */}
            <GoogleTasksList onSelectTask={(title) => {
                addTask(title); // Add to local tasks
                // We need to wait for state update to select it, or just let user select it.
                // For better UX, we can find the newly added task (implied last) and select it.
                // But tasks are prepended.
                // Let's just add it for now.
                // Ideally we would return the ID from addTask but it's void currently.
            }} />
        </main>
    );
}
