import { format } from "date-fns";

const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseDateInput = (value: Date | string): Date => {
    if (value instanceof Date) return value;

    if (ISO_DATE_ONLY_RE.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    return new Date(value);
};

export const formatDisplayDate = (value: Date | string): string => {
    const parsed = parseDateInput(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return format(parsed, "dd-MM-yyyy");
};

