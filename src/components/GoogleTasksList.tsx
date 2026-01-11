"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Play } from "lucide-react";

interface GoogleTask {
    id: string;
    title: string;
}

interface Props {
    onSelectTask: (title: string) => void;
}

export function GoogleTasksList({ onSelectTask }: Props) {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<GoogleTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            setLoading(true);
            setError(null);
            fetch("/api/tasks")
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    } else if (data.tasks) {
                        setTasks(data.tasks);
                    }
                })
                .catch(err => {
                    setError("Failed to connect to server");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (!session) {
        return (
            <div className="mt-8 p-6 bg-gray-900/50 rounded-3xl border border-gray-800 text-center">
                <h3 className="text-lg font-bold mb-4 text-gray-200">Sync with Google Tasks</h3>
                <button
                    onClick={() => signIn("google")}
                    className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition"
                >
                    Sign in with Google
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-black rounded-3xl p-6 border border-zinc-800 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                Google Tasks <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded-full text-zinc-400">{tasks.length}</span>
            </h3>

            {error ? (
                <div className="text-red-400 text-sm text-center py-4 bg-red-900/10 rounded-xl p-4">
                    <p className="font-bold mb-1">Error fetching tasks:</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs underline hover:text-red-300"
                    >
                        Reload Page
                    </button>
                </div>
            ) : loading ? (
                <div className="text-zinc-500 text-center py-4">Loading tasks...</div>
            ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                    {tasks.length === 0 && (
                        <div className="text-center text-zinc-500 py-4">No tasks found in default list.</div>
                    )}
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group flex items-center justify-between p-4 rounded-xl bg-black hover:bg-zinc-900 cursor-pointer transition border border-zinc-900 hover:border-zinc-700"
                            onClick={() => onSelectTask(task.title)}
                        >
                            <span className="truncate flex-1 font-medium text-gray-300 group-hover:text-white transition">{task.title}</span>
                            <button className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 opacity-0 group-hover:opacity-100 transition hover:bg-emerald-500 hover:text-emerald-950">
                                <Play className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
