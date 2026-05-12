import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FocusSession {
    id: string;
    taskId: string;
    startTime: number;
    endTime: number;
    durationMinutes: number;
    completed: boolean;
}

interface ReportState {
    sessions: FocusSession[];
    
    addSession: (session: Omit<FocusSession, 'id'>) => void;
    clearSessions: () => void;
}

export const useReportStore = create<ReportState>()(
    persist(
        (set) => ({
            sessions: [],

            addSession: (session) => set((state) => ({
                sessions: [
                    ...state.sessions,
                    { ...session, id: crypto.randomUUID() }
                ]
            })),

            clearSessions: () => set({ sessions: [] }),
        }),
        {
            name: 'focus-flow-reports',
        }
    )
);
