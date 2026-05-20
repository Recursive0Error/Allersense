import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDisplayDate } from "../../utils/date";

type WeekCalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    hasData: (date: Date) => boolean;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDays = (center: Date) => {
    const days: Date[] = [];
    for (let offset = -3; offset <= 3; offset += 1) {
        const d = new Date(center);
        d.setDate(center.getDate() + offset);
        days.push(d);
    }
    return days;
};

export function WeekCalendar({ selectedDate, onDateSelect, hasData }: WeekCalendarProps) {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const days = getDays(selectedDate);
    const [isMonthOpen, setIsMonthOpen] = React.useState(false);
    const [monthCursor, setMonthCursor] = React.useState(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    const selectedHeading = formatDisplayDate(selectedDate);
    const todayKey = new Date().toDateString();
    const monthTitle = monthCursor.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });

    const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());
    const monthGrid: Date[][] = [];
    for (let week = 0; week < 6; week += 1) {
        const row: Date[] = [];
        for (let day = 0; day < 7; day += 1) {
            const d = new Date(gridStart);
            d.setDate(gridStart.getDate() + week * 7 + day);
            row.push(d);
        }
        monthGrid.push(row);
    }

    const openMonthView = () => {
        setMonthCursor(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        setIsMonthOpen(true);
    };

    return (
        <View>
            <Text style={styles.heading} accessibilityRole="header">
                {selectedHeading}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
            <View style={styles.row}>
                {days.map((day) => {
                    const isSelected =
                        day.toDateString() === selectedDate.toDateString();
                    const isToday = day.toDateString() === todayKey;
                    const showDot = hasData(day);
                    const readableDate = formatDisplayDate(day);
                    return (
                        <TouchableOpacity
                            key={day.toISOString()}
                            style={[
                                styles.dayButton,
                                isToday && styles.dayToday,
                                isSelected && styles.daySelected,
                            ]}
                            onPress={() => onDateSelect(day)}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel={`${readableDate}${showDot ? ", has logged entries" : ""}`}
                            accessibilityHint="Opens logs for this date"
                            accessibilityState={{ selected: isSelected }}
                        >
                            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                                {dayLabels[day.getDay()]}
                            </Text>
                            <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                                {day.getDate()}
                            </Text>
                            {showDot && (
                                <View
                                    style={styles.dot}
                                    accessible
                                    accessibilityLabel="Has logged entries"
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
            </ScrollView>
            <TouchableOpacity
                onPress={openMonthView}
                style={styles.fullCalendarButton}
                accessibilityRole="button"
                accessibilityLabel="Open full calendar"
                accessibilityHint="Opens a full month calendar to choose any date"
            >
                <Text style={styles.fullCalendarButtonText}>Open Full Calendar</Text>
            </TouchableOpacity>

            <Modal visible={isMonthOpen} animationType="slide" transparent onRequestClose={() => setIsMonthOpen(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() =>
                                    setMonthCursor(
                                        new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
                                    )
                                }
                                style={styles.navButton}
                            >
                                <Text style={styles.navButtonText}>Prev</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{monthTitle}</Text>
                            <TouchableOpacity
                                onPress={() =>
                                    setMonthCursor(
                                        new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                                    )
                                }
                                style={styles.navButton}
                            >
                                <Text style={styles.navButtonText}>Next</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekdayHeaderRow}>
                            {dayLabels.map((label) => (
                                <Text key={`header-${label}`} style={styles.weekdayHeaderText}>
                                    {label}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.monthGrid}>
                            {monthGrid.map((week, weekIndex) => (
                                <View key={`week-${weekIndex}`} style={styles.monthRow}>
                                    {week.map((day) => {
                                        const isSelected =
                                            day.toDateString() === selectedDate.toDateString();
                                        const isToday = day.toDateString() === todayKey;
                                        const inCurrentMonth = day.getMonth() === monthCursor.getMonth();
                                        const showDot = hasData(day);

                                        return (
                                            <TouchableOpacity
                                                key={day.toISOString()}
                                                style={[
                                                    styles.monthDayButton,
                                                    !inCurrentMonth && styles.monthDayButtonMuted,
                                                    isToday && styles.monthDayToday,
                                                    isSelected && styles.monthDaySelected,
                                                ]}
                                                onPress={() => {
                                                    onDateSelect(day);
                                                    setIsMonthOpen(false);
                                                }}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.monthDayText,
                                                        !inCurrentMonth && styles.monthDayTextMuted,
                                                        isSelected && styles.monthDayTextSelected,
                                                    ]}
                                                >
                                                    {day.getDate()}
                                                </Text>
                                                {showDot && <View style={styles.monthDot} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity onPress={() => setIsMonthOpen(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (colors: {
    surface: string;
    primary: string;
    primaryText: string;
    muted: string;
    text: string;
    success: string;
    border: string;
}) =>
    StyleSheet.create({
        heading: {
            fontSize: 13,
            color: colors.text,
            fontWeight: "600",
            marginBottom: 8,
        },
        scrollContent: {
            paddingRight: 2,
        },
        fullCalendarButton: {
            marginTop: 10,
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.surface,
        },
        fullCalendarButtonText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: "600",
        },
        row: {
            flexDirection: "row",
            gap: 10,
        },
        dayButton: {
            width: 62,
            minHeight: 80,
            borderRadius: 14,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 10,
        },
        dayToday: {
            borderColor: colors.primary,
        },
        daySelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dayLabel: {
            fontSize: 13,
            color: colors.muted,
            marginBottom: 4,
        },
        dayLabelSelected: {
            color: colors.primaryText,
            fontWeight: "600",
        },
        dayNumber: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
        },
        dayNumberSelected: {
            color: colors.primaryText,
        },
        dot: {
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.success,
            marginTop: 6,
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            padding: 16,
        },
        modalCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 10,
        },
        modalHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        modalTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
        },
        navButton: {
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
        },
        navButtonText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: "600",
        },
        weekdayHeaderRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 2,
        },
        weekdayHeaderText: {
            width: 36,
            textAlign: "center",
            color: colors.muted,
            fontSize: 11,
            fontWeight: "600",
        },
        monthGrid: {
            gap: 6,
        },
        monthRow: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        monthDayButton: {
            width: 36,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surface,
        },
        monthDayButtonMuted: {
            opacity: 0.5,
        },
        monthDayToday: {
            borderColor: colors.primary,
        },
        monthDaySelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        monthDayText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: "600",
        },
        monthDayTextMuted: {
            color: colors.muted,
        },
        monthDayTextSelected: {
            color: colors.primaryText,
        },
        monthDot: {
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.success,
            marginTop: 2,
        },
        closeButton: {
            marginTop: 2,
            alignSelf: "flex-end",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 7,
        },
        closeButtonText: {
            color: colors.text,
            fontSize: 12,
            fontWeight: "600",
        },
    });
