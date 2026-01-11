"use client";

import { useState, useEffect } from "react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useTimer } from "@/hooks/useTimer";
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";
import { GoogleTasksList } from "@/components/GoogleTasksList";
import { MoonPhase } from "@/components/MoonPhase";

export default function Home() {
    const { tasks, addTask, deleteTask, toggleTask, updateTaskTime, isLoaded } = useTasks();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState(""); // This is no longer used directly for the input value, but keeping it for now as it was in the original. The new input uses e.currentTarget.value directly.

    // Get active task
    const activeTask = tasks.find(t => t.id === activeTaskId);

    // Timer hook
    const { timeLeft, isRunning, toggleTimer, reset, setTime, pause, progress } = useTimer();

    // Update task time when timer ticks
    useEffect(() => {
        if (isRunning && activeTaskId) {
            updateTaskTime(activeTaskId, timeLeft);
        }
    }, [timeLeft, isRunning, activeTaskId, updateTaskTime]);

    // Initialize timer from active task on load, or when active task changes while paused
    useEffect(() => {
        if (isLoaded && activeTask && !isRunning) {
            setTime(activeTask.timeLeft || 25 * 60);
        }
    }, [isLoaded, activeTask, setTime, isRunning]);

    const handleSelectTask = (task: Task) => {
        // 1. Save current time to OLD active task (already handled by useEffect above? mainly yes)

        // 2. Switch active task
        setActiveTaskId(task.id);

        // 3. Set timer to NEW task's time
        const timeToSet = task.timeLeft || 25 * 60;
        setTime(timeToSet);

        // 4. Pause timer to avoid confusion
        if (task.id !== activeTaskId) {
            pause();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const formatTimeForCard = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!isLoaded) return <div className="min-h-screen bg-black" />;

    return (
        <main className="flex flex-col h-screen max-w-md mx-auto p-6 relative overflow-hidden bg-black text-zinc-50 font-sans selection:bg-emerald-500/30">
            {/* Top Bar (Logo/Menu placeholder) */}
            <header className="flex justify-between items-center py-4 opacity-50">
                {/* Minimal Content */}
                <div />
            </header>

            {/* Main Content: Timer & Active Task */}
            <div className="flex-1 flex flex-col justify-center items-center gap-8">

                {/* Moon Phase & Timer Display */}
                <div className="relative flex items-center justify-center">
                    {/* Moon Phase: Progress 0 (Full) -> 1 (New) */}
                    {/* Increased size slightly to frame the text better, or keep at 150? Text is 8xl (~6rem/96px). 150px is enough for background. */}
                    <div className="relative opacity-80 pointer-events-none select-none">
                        <MoonPhase progress={progress / 100} className="w-full h-full" />
                    </div>

                    {/* Timer Text Overlaid */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <h1 className="text-8xl font-bold font-mono tracking-tighter tabular-nums leading-none select-none text-yellow-300 drop-shadow-lg">
                            {formatTime(timeLeft)}
                        </h1>
                    </div>
                </div>

                {/* Active Task Name */}
                <div className="text-center space-y-2 max-w-xs">
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">Current Task</p>
                    <h2 className="text-3xl font-bold tracking-tight leading-snug break-words">
                        {activeTask ? activeTask.title : "No Active Task"}
                    </h2>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 mt-8">
                    <button
                        onClick={reset}
                        className="h-16 w-16 flex items-center justify-center rounded-2xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition active:scale-95"
                        aria-label="Reset Timer"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={clsx(
                            "h-20 w-32 flex items-center justify-center rounded-2xl border-2 transition-all active:scale-95",
                            isRunning
                                ? "border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                                : "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                        )}
                        aria-label={isRunning ? "Pause" : "Start"}
                    >
                        {isRunning ? (
                            <Pause className="w-8 h-8 fill-current" />
                        ) : (
                            <Play className="w-8 h-8 fill-current" />
                        )}
                    </button>

                    {/* Placeholder for future feature or secondary action */}
                    <div className="w-16" />
                </div>
            </div>

            {/* Bottom Section: Task List & Add */}
            <div className="flex flex-col gap-6 mt-auto pb-8 z-10">
                {/* Add Task Input */}
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all font-medium"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                addTask(e.currentTarget.value);
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                        <Plus className="w-5 h-5" />
                    </div>
                </div>

                {/* Task List (Scrollable if many) */}
                <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1 custom-scrollbar">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => handleSelectTask(task)}
                            className={clsx(
                                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                activeTaskId === task.id ? "bg-zinc-900 border-zinc-800" : "bg-transparent border-transparent hover:bg-zinc-900/30",
                                task.completed && "opacity-40"
                            )}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(task.id);
                                    }}
                                    className={clsx(
                                        "shrink-0 transition",
                                        task.completed ? "text-emerald-500" : "text-zinc-700 hover:text-zinc-500"
                                    )}
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </button>
                                <span className={clsx(
                                    "truncate font-medium transition",
                                    task.completed ? "line-through text-zinc-600" : "text-zinc-400 group-hover:text-zinc-200",
                                    activeTaskId === task.id && "text-zinc-100"
                                )}>
                                    {task.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-zinc-600">
                                    {formatTimeForCard(task.timeLeft || 25 * 60)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTask(task.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-900 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="text-center text-zinc-700 text-sm py-2">No tasks yet.</p>
                    )}
                </div>
            </div>

            {/* Google Tasks Overlay/Section */}
            <div className="mt-4">
                <GoogleTasksList onSelectTask={(title) => {
                    addTask(title);
                }} />
            </div>
        </main>
    );
}
