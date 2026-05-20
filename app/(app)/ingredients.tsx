/*
    ingredients.tsx

    Screen for logging and editing food/ingredient entries.
    - shows a week calendar, the day's entries, and supports add/edit/delete
*/
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AnimatedScreen } from "../../components/AnimatedScreen";
import { WeekCalendar } from "../../components/calendar/WeekCalendar";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../hooks/use-toast";
import { formatDisplayDate } from "../../utils/date";
import { to12HourTime, to24HourTime } from "../../utils/time";

const toStableLocalDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

export default function Ingredients() {
    const { getIngredientsForDate, addIngredient, updateIngredient, deleteIngredient, ingredients } =
        useData();
    const { toast } = useToast();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [selectedDate, setSelectedDate] = useState(() => toStableLocalDate(new Date()));
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState({
        foodName: "",
        time: format(new Date(), "hh:mm a"),
    });
    const [editEntry, setEditEntry] = useState({
        foodName: "",
        time: "",
    });

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dailyIngredients = getIngredientsForDate(dateKey);

    const hasDataForDate = (date: Date) => {
        const key = format(date, "yyyy-MM-dd");
        return ingredients.some((i) => i.date === key);
    };

    const startEditing = (id: string, foodName: string, time: string) => {
        setEditingId(id);
        setEditEntry({ foodName, time: to12HourTime(time) });
    };

    const handleAddEntry = () => {
        if (!newEntry.foodName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a food name",
                variant: "destructive",
            });
            return;
        }

        addIngredient({
            foodName: newEntry.foodName.trim(),
            time: to24HourTime(newEntry.time),
            date: dateKey,
            source: "manual",
        });

        setNewEntry({
            foodName: "",
            time: format(new Date(), "hh:mm a"),
        });
        setIsAddingNew(false);
        toast({ title: "Added", description: "Ingredient logged successfully" });
    };

    const handleUpdateEntry = (id: string) => {
        if (!editEntry.foodName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a food name",
                variant: "destructive",
            });
            return;
        }

        updateIngredient(id, {
            foodName: editEntry.foodName.trim(),
            time: to24HourTime(editEntry.time),
        });
        setEditingId(null);
        toast({ title: "Updated", description: "Entry updated successfully" });
    };

    const handleDeleteEntry = (id: string) => {
        deleteIngredient(id);
        toast({ title: "Deleted", description: "Entry removed" });
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(toStableLocalDate(date));
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <AnimatedScreen style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.title}>Ingredients</Text>

            <WeekCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                hasData={hasDataForDate}
            />

            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>
                        {formatDisplayDate(selectedDate)}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                        {dailyIngredients.length}{" "}
                        {dailyIngredients.length === 1 ? "item" : "items"} logged
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsAddingNew(true)}
                    style={[styles.addButton, isAddingNew && styles.addButtonDisabled]}
                    disabled={isAddingNew}
                >
                    <Feather name="plus" size={16} color={colors.primaryText} />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerCell}>#</Text>
                    <Text style={[styles.headerCell, styles.headerFlex]}>
                        Ingredient / Food
                    </Text>
                    <Text style={styles.headerCell}>Time</Text>
                    <Text style={styles.headerCell}>Source</Text>
                    <Text style={styles.headerCell}></Text>
                </View>

                {dailyIngredients.map((entry, index) => (
                    <View key={entry.id} style={styles.row}>
                        <Text style={styles.rowIndex}>{index + 1}</Text>

                        {editingId === entry.id ? (
                            <>
                                <TextInput
                                    style={[styles.input, styles.rowFlex]}
                                    value={editEntry.foodName}
                                    onChangeText={(text) =>
                                        setEditEntry((prev) => ({
                                            ...prev,
                                            foodName: text,
                                        }))
                                    }
                                />
                                <TextInput
                                    style={styles.inputTime}
                                    value={editEntry.time}
                                    onChangeText={(text) =>
                                        setEditEntry((prev) => ({
                                            ...prev,
                                            time: text,
                                        }))
                                    }
                                    placeholder="hh:mm AM/PM"
                                />
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={() => handleUpdateEntry(entry.id)}
                                        style={styles.actionButton}
                                    >
                                        <Feather name="check" size={16} color={colors.success} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setEditingId(null)}
                                        style={styles.actionButton}
                                    >
                                        <Feather name="x" size={16} color={colors.muted} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.rowText, styles.rowFlex]}>
                                    {entry.foodName}
                                </Text>
                                <View style={styles.timeCell}>
                                    <Feather name="clock" size={12} color={colors.muted} />
                                    <Text style={styles.timeText}>{to12HourTime(entry.time)}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.sourceChip,
                                        entry.source === "scanned"
                                            ? styles.sourceScanned
                                            : styles.sourceManual,
                                    ]}
                                >
                                    <Text style={styles.sourceText}>
                                        {entry.source === "scanned" ? "📷 Scanned" : "✏️ Manual"}
                                    </Text>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            startEditing(entry.id, entry.foodName, entry.time)
                                        }
                                        style={styles.actionButton}
                                    >
                                        <Feather name="edit-2" size={16} color={colors.muted} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteEntry(entry.id)}
                                        style={styles.actionButton}
                                    >
                                        <Feather name="trash-2" size={16} color={colors.muted} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                ))}

                {isAddingNew && (
                    <View style={[styles.row, styles.rowNew]}>
                        <Text style={styles.rowIndex}>{dailyIngredients.length + 1}</Text>
                        <TextInput
                            style={[styles.input, styles.rowFlex]}
                            placeholder="Enter food name"
                            placeholderTextColor={colors.muted}
                            value={newEntry.foodName}
                            onChangeText={(text) =>
                                setNewEntry((prev) => ({ ...prev, foodName: text }))
                            }
                            autoFocus
                        />
                        <TextInput
                            style={styles.inputTime}
                            value={newEntry.time}
                            onChangeText={(text) =>
                                setNewEntry((prev) => ({ ...prev, time: text }))
                            }
                            placeholder="hh:mm AM/PM"
                            placeholderTextColor={colors.muted}
                        />
                        <View style={[styles.sourceChip, styles.sourceManual]}>
                            <Text style={styles.sourceText}>✏️ Manual</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={handleAddEntry}
                                style={styles.actionButton}
                            >
                                <Feather name="check" size={16} color={colors.success} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsAddingNew(false);
                                    setNewEntry({
                                        foodName: "",
                                        time: format(new Date(), "hh:mm a"),
                                    });
                                }}
                                style={styles.actionButton}
                            >
                                <Feather name="x" size={16} color={colors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {dailyIngredients.length === 0 && !isAddingNew && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            No ingredients logged for this day
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsAddingNew(true)}
                            style={styles.emptyButton}
                        >
                            <Text style={styles.emptyButtonText}>
                                Add your first entry
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            </ScrollView>
            </AnimatedScreen>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: {
    background: string;
    card: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryText: string;
    border: string;
    success: string;
}) =>
    StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 2,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonText: {
        color: colors.primaryText,
        fontSize: 12,
        fontWeight: "600",
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: colors.text,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    headerCell: {
        fontSize: 11,
        color: colors.muted,
        fontWeight: "600",
        width: 64,
    },
    headerFlex: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 8,
    },
    rowNew: {
        backgroundColor: colors.surface,
    },
    rowIndex: {
        width: 24,
        fontSize: 12,
        color: colors.muted,
    },
    rowText: {
        fontSize: 13,
        color: colors.text,
        fontWeight: "600",
    },
    rowFlex: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 12,
        color: colors.text,
    },
    inputTime: {
        width: 72,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 6,
        fontSize: 12,
        color: colors.text,
        textAlign: "center",
    },
    timeCell: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        width: 72,
    },
    timeText: {
        fontSize: 12,
        color: colors.muted,
    },
    sourceChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    sourceManual: {
        backgroundColor: colors.surface,
    },
    sourceScanned: {
        backgroundColor: colors.surface,
    },
    sourceText: {
        fontSize: 10,
        color: colors.muted,
    },
    actions: {
        flexDirection: "row",
        gap: 6,
        width: 64,
        justifyContent: "flex-end",
    },
    actionButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 12,
        color: colors.muted,
        marginBottom: 8,
    },
    emptyButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    emptyButtonText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: "600",
    },
});
