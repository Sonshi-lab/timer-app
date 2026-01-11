import { useState, useEffect } from 'react';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    timeLeft: number;
}

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro-tasks');
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse tasks', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
        }
    }, [tasks, isLoaded]);

    const addTask = (title: string) => {
        const newTask: Task = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title,
            completed: false,
            timeLeft: 25 * 60, // Default 25 minutes
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const updateTaskTime = (id: string, timeLeft: number) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, timeLeft } : t
        ));
    };

    return { tasks, addTask, deleteTask, toggleTask, updateTaskTime, isLoaded };
}
