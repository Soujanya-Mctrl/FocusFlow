/**
 * AI Utilities for FocusFlow
 * Handles natural language parsing for quick task entry
 */

export interface ParsedTask {
    title: string;
    estimatedMinutes?: number;
    scheduledDate?: Date;
    scheduledTime?: string;
    tags: string[];
}

export const parseNaturalLanguageTask = (input: string): ParsedTask => {
    let title = input;
    let estimatedMinutes: number | undefined;
    let scheduledDate: Date | undefined;
    let scheduledTime: string | undefined;
    const tags: string[] = [];

    // 1. Extract Time Estimates (e.g., "for 30m", "30 min", "1h")
    const timeRegex = /(?:for\s+)?(\d+)\s*(m|min|minutes|h|hour|hours)\b/i;
    const timeMatch = title.match(timeRegex);
    if (timeMatch) {
        const val = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        if (unit.startsWith('h')) {
            estimatedMinutes = val * 60;
        } else {
            estimatedMinutes = val;
        }
        title = title.replace(timeMatch[0], '').trim();
    }

    // 2. Extract Tags (e.g., "#work", "#urgent")
    const tagRegex = /#(\w+)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(title)) !== null) {
        tags.push(tagMatch[1]);
    }
    title = title.replace(tagRegex, '').trim();

    // 3. Extract Dates (Very simple implementation: "today", "tomorrow")
    const dateLower = title.toLowerCase();
    if (dateLower.includes('today')) {
        scheduledDate = new Date();
        title = title.replace(/today/i, '').trim();
    } else if (dateLower.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        scheduledDate = tomorrow;
        title = title.replace(/tomorrow/i, '').trim();
    }

    // 4. Extract Times (e.g., "at 2pm", "at 14:00")
    const hourRegex = /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const hourMatch = title.match(hourRegex);
    if (hourMatch) {
        let hours = parseInt(hourMatch[1]);
        const mins = hourMatch[2] || '00';
        const ampm = hourMatch[3]?.toLowerCase();
        
        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
        
        scheduledTime = `${hours.toString().padStart(2, '0')}:${mins}`;
        title = title.replace(hourMatch[0], '').trim();
    }

    // Cleanup extra spaces
    title = title.replace(/\s+/g, ' ').trim();

    return {
        title: title || 'Untitled Task',
        estimatedMinutes,
        scheduledDate,
        scheduledTime,
        tags
    };
};
