import { create } from 'zustand';
import { supabase } from './supabase';

export interface TaskColumn {
    id: string;
    project_id: string;
    name: string;
    order_index: number;
    color: string;
}

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    project_id: string;
    column_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    order_index: number;
    labels: string[];
    subtasks: Subtask[];
    assignee_id: string | null;
    created_at: string;
}

export interface TaskAssignment {
    task_id: string;
    user_id: string;
}

interface TaskState {
    tasks: Task[];
    columns: TaskColumn[];
    loading: boolean;
    fetchBoard: (projectId: string) => Promise<void>;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    moveTask: (taskId: string, newColumnId: string, newIndex: number) => Promise<void>;
    addColumn: (projectId: string, name: string) => Promise<void>;
    updateColumn: (columnId: string, updates: Partial<TaskColumn>) => Promise<void>;
    deleteColumn: (columnId: string) => Promise<void>;
    reorderColumn: (columnId: string, newIndex: number) => Promise<void>;
    reorderTask: (taskId: string, newIndex: number) => Promise<void>;
    toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    columns: [],
    loading: false,

    fetchBoard: async (projectId: string) => {
        set({ loading: true });
        const { data: columnData } = await supabase
            .from('task_columns')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

        const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

        set({
            columns: columnData || [],
            tasks: taskData || [],
            loading: false
        });
    },

    addTask: async (task) => {
        const { data, error } = await supabase.from('tasks').insert([task]).select();
        if (data && !error) {
            set((state) => ({ tasks: [...state.tasks, data[0]] }));
        }
    },

    updateTask: async (taskId, updates) => {
        const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
        if (!error) {
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            }));
        }
    },

    deleteTask: async (taskId) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (!error) {
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== taskId),
            }));
        }
    },

    moveTask: async (taskId, newColumnId, newIndex) => {
        // Optimistic update
        const previousTasks = get().tasks;
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, column_id: newColumnId, order_index: newIndex } : t
            ),
        }));

        const { error } = await supabase
            .from('tasks')
            .update({ column_id: newColumnId, order_index: newIndex })
            .eq('id', taskId);

        if (error) {
            set({ tasks: previousTasks });
        }
    },

    addColumn: async (projectId, name) => {
        const order_index = get().columns.length;
        const { data, error } = await supabase
            .from('task_columns')
            .insert([{ project_id: projectId, name, order_index }])
            .select();

        if (data && !error) {
            set((state) => ({ columns: [...state.columns, data[0]] }));
        }
    },

    updateColumn: async (columnId, updates) => {
        const { error } = await supabase.from('task_columns').update(updates).eq('id', columnId);
        if (!error) {
            set((state) => ({
                columns: state.columns.map((c) => (c.id === columnId ? { ...c, ...updates } : c)),
            }));
        }
    },

    deleteColumn: async (columnId) => {
        const { error } = await supabase.from('task_columns').delete().eq('id', columnId);
        if (!error) {
            set((state) => ({
                columns: state.columns.filter((c) => c.id !== columnId),
            }));
        }
    },

    reorderColumn: async (columnId, newIndex) => {
        const previousColumns = get().columns;
        const newColumns = [...previousColumns].sort((a, b) => a.order_index - b.order_index);
        const colIndex = newColumns.findIndex(c => c.id === columnId);
        if (colIndex === -1) return;

        const [movedCol] = newColumns.splice(colIndex, 1);
        newColumns.splice(newIndex, 0, movedCol);

        const updatedCols = newColumns.map((c, i) => ({ ...c, order_index: i }));
        set({ columns: updatedCols });

        const { error } = await supabase
            .from('task_columns')
            .upsert(updatedCols.map(c => ({ id: c.id, order_index: c.order_index, project_id: c.project_id, name: c.name })));

        if (error) {
            set({ columns: previousColumns });
        }
    },

    reorderTask: async (taskId, newIndex) => {
        const previousTasks = get().tasks;
        const task = previousTasks.find(t => t.id === taskId);
        if (!task) return;

        const columnTasks = previousTasks
            .filter(t => t.column_id === task.column_id)
            .sort((a, b) => a.order_index - b.order_index);

        const taskIndex = columnTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        columnTasks.splice(taskIndex, 1);
        columnTasks.splice(newIndex, 0, task);

        const updatedTasks = columnTasks.map((t, i) => ({ ...t, order_index: i }));

        set((state) => ({
            tasks: state.tasks.map(t => {
                const updated = updatedTasks.find(ut => ut.id === t.id);
                return updated ? updated : t;
            })
        }));

        const { error } = await supabase
            .from('tasks')
            .upsert(updatedTasks.map(t => ({
                id: t.id,
                order_index: t.order_index,
                column_id: t.column_id,
                project_id: t.project_id,
                title: t.title
            })));

        if (error) {
            set({ tasks: previousTasks });
        }
    },

    toggleSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t)
        }));

        const { error } = await supabase
            .from('tasks')
            .update({ subtasks: updatedSubtasks })
            .eq('id', taskId);

        if (error) {
            // Revert on error
            set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? { ...t, subtasks: task.subtasks } : t)
            }));
        }
    },
}));
