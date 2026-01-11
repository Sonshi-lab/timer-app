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
        <div className="mt-8 w-full max-w-md bg-gray-900/50 rounded-3xl p-6 backdrop-blur-sm border border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-200">
                Google Tasks <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{tasks.length}</span>
            </h3>

            {error ? (
                <div className="text-red-400 text-sm text-center py-4 bg-red-900/20 rounded-xl p-4">
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
                <div className="text-gray-500 text-center py-4">Loading tasks...</div>
            ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                    {tasks.length === 0 && (
                        <div className="text-center text-gray-500 py-4">No tasks found in default list.</div>
                    )}
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800 cursor-pointer transition border border-transparent hover:border-gray-700"
                            onClick={() => onSelectTask(task.title)}
                        >
                            <span className="truncate flex-1 font-medium text-gray-300 group-hover:text-white transition">{task.title}</span>
                            <button className="p-2 rounded-full bg-orange-600/10 text-orange-500 opacity-0 group-hover:opacity-100 transition hover:bg-orange-600 hover:text-white">
                                <Play className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
