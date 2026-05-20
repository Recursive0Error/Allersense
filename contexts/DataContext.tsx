/*
    DataContext.tsx

    Central data layer for the app. Responsibilities:
    - load and persist user-specific ingredients/symptoms to AsyncStorage
    - provide helper functions to add/update/delete entries
    - compute allergy "patterns" by matching logged foods to a static allergy database
    - expose utilities used by UI screens to query recent foods, daily lists and pattern details

    Most of the complex logic below is text-normalization + fuzzy matching between
    user-entered ingredient strings and entries in `utils/allergyDatabase.ts`.
*/
import {
    AllergyLinkedEntry,
    AllergyLinkedSymptom,
    AllergyPattern,
    AllergyPatternDetails,
    EliminationStats,
    IngredientEntry,
    SymptomEntry,
} from '@/types/allergy';
import { ALLERGY_DATABASE, AllergyDatabaseEntry } from '@/utils/allergyDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

interface DataContextType {
    ingredients: IngredientEntry[];
    symptoms: SymptomEntry[];
    patterns: AllergyPattern[];
    safeFoods: AllergyPattern[];
    addIngredient: (entry: Omit<IngredientEntry, 'id'>) => void;
    updateIngredient: (id: string, updates: Partial<IngredientEntry>) => void;
    addSymptom: (entry: Omit<SymptomEntry, 'id'>) => void;
    updateSymptom: (id: string, updates: Partial<SymptomEntry>) => void;
    deleteIngredient: (id: string) => void;
    deleteSymptom: (id: string) => void;
    confirmPattern: (food: string) => void;
    dismissPattern: (food: string) => void;
    markFoodSafe: (food: string) => void;
    getTodayStats: () => { foodsLogged: number; symptomsLogged: number };
    getEliminationStats: () => EliminationStats;
    getRecentFoods: (hours: number) => IngredientEntry[];
    linkSymptomToRecentFoods: (symptomId: string, hours?: number) => void;
    getIngredientsForDate: (date: string) => IngredientEntry[];
    getSymptomsForDate: (date: string) => SymptomEntry[];
    getAllergyPatternDetails: (allergyName: string) => AllergyPatternDetails | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
    const [userOverrides, setUserOverrides] = useState<Record<string, 'confirmed' | 'dismissed' | 'safe'>>({});

    // Build a storage key that scopes data to the current user id
    const getStorageKey = (type: string) => `allergyTracker_${user?.id}_${type}`;

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            const savedIngredients = await AsyncStorage.getItem(getStorageKey('ingredients'));
            const savedSymptoms = await AsyncStorage.getItem(getStorageKey('symptoms'));
            const savedOverrides = await AsyncStorage.getItem(getStorageKey('overrides'));

            if (savedIngredients) setIngredients(JSON.parse(savedIngredients));
            if (savedSymptoms) setSymptoms(JSON.parse(savedSymptoms));
            if (savedOverrides) setUserOverrides(JSON.parse(savedOverrides));
        };

        loadData();
    }, [user]);

    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(getStorageKey('ingredients'), JSON.stringify(ingredients));
        }
    }, [ingredients]);

    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(getStorageKey('symptoms'), JSON.stringify(symptoms));
        }
    }, [symptoms]);

    useEffect(() => {
        if (user) {
            AsyncStorage.setItem(getStorageKey('overrides'), JSON.stringify(userOverrides));
        }
    }, [userOverrides]);

    // Normalize free-text to a simplified lowercase alpha-numeric string
    // - removes punctuation, collapses whitespace
    const normalizeText = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    // Break a string into useful tokens (ignore very short words)
    const tokenize = (value: string) =>
        normalizeText(value)
            .split(' ')
            .map(token => token.trim())
            .filter(token => token.length > 2);

    // Loose substring-inclusion matcher to allow e.g. "peanut" ~ "peanuts"
    const textRoughMatch = (a: string, b: string) => {
        if (!a || !b) return false;
        if (a === b) return true;
        return a.includes(b) || b.includes(a);
    };

    // Check whether tokenized words overlap between two strings
    // Useful to match multi-word ingredients like "peanut oil" and "peanuts"
    const hasTokenOverlap = (a: string, b: string) => {
        const aTokens = tokenize(a);
        const bTokens = new Set(tokenize(b));
        return aTokens.some(token => bTokens.has(token));
    };

    // Split a loose ingredient string into parts using common separators
    const splitIngredientParts = (value: string) =>
        value
            .split(/[,;|/]+/g)
            .map(part => part.trim())
            .filter(Boolean);

    // Given a free-text food/ingredient string, return matching entries from the
    // static `ALLERGY_DATABASE`. Each match includes the database entry and
    // the specific keyword that matched so the UI can show a hint.
    const getMatchingAllergiesForFood = (
        foodName: string
    ): Array<{ entry: AllergyDatabaseEntry; matchedKeyword: string }> => {
        const rawParts = splitIngredientParts(foodName);
        const normalizedParts = [normalizeText(foodName), ...rawParts.map(normalizeText)].filter(Boolean);
        const matches: Array<{ entry: AllergyDatabaseEntry; matchedKeyword: string }> = [];

        ALLERGY_DATABASE.forEach(entry => {
            const candidates = [entry.allergy_name, ...entry.food_causes, ...entry.indian_food_examples];

            for (const candidateRaw of candidates) {
                const candidate = normalizeText(candidateRaw);
                const matched = normalizedParts.some(
                    part => textRoughMatch(part, candidate) || hasTokenOverlap(part, candidate)
                );
                if (!matched) continue;

                if (!matches.some(item => item.entry.allergy_name === entry.allergy_name)) {
                    matches.push({ entry, matchedKeyword: candidateRaw });
                }
                break;
            }
        });

        return matches;
    };

    // Check whether a symptom string plausibly matches any of the common symptoms
    // listed for an allergy in the static database.
    const isSymptomSupportedByAllergy = (
        symptomName: string,
        allergyEntries: AllergyDatabaseEntry[]
    ) => {
        const normalizedSymptom = normalizeText(symptomName);
        return allergyEntries.some(entry =>
            entry.common_symptoms
                .map(normalizeText)
                .some(commonSymptom => textRoughMatch(normalizedSymptom, commonSymptom))
        );
    };

    // Allergy reactions are most relevant in a short window after eating. This
    // checks whether the symptom occurred within 24 hours after the food time.
    const isWithinTwentyFourHourWindow = (foodDateTime: Date, symptomDateTime: Date) => {
        const diffMs = symptomDateTime.getTime() - foodDateTime.getTime();
        if (diffMs < 0) return false;
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours <= 24;
    };

    // Build inferred allergy patterns by iterating through ingredients and
    // checking for symptom co-occurrence. The result is memoized and updated
    // when ingredients/symptoms/overrides change.
    const patterns = useMemo(() => {
        const allergyMap: Record<
            string,
            {
                total: number;
                reactions: number;
                linkedSymptoms: Set<string>;
                basedOnEntries: Set<string>;
                matchedKeywords: Set<string>;
            }
        > = {};

        const symptomsByDate: Record<string, SymptomEntry[]> = {};
        symptoms.forEach(symptom => {
            if (!symptomsByDate[symptom.date]) symptomsByDate[symptom.date] = [];
            symptomsByDate[symptom.date].push(symptom);
        });

        ingredients.forEach(entry => {
            const matchedAllergies = getMatchingAllergiesForFood(entry.foodName);
            if (matchedAllergies.length === 0) return;

            const foodDT = new Date(`${entry.date}T${entry.time || '00:00'}:00`);
            const candidateSymptoms = symptomsByDate[entry.date] || [];

            matchedAllergies.forEach(match => {
                const allergyLabel = match.entry.allergy_name;
                const allergyKey = allergyLabel.toLowerCase().trim();

                if (!allergyMap[allergyKey]) {
                    allergyMap[allergyKey] = {
                        total: 0,
                        reactions: 0,
                        linkedSymptoms: new Set<string>(),
                        basedOnEntries: new Set<string>(),
                        matchedKeywords: new Set<string>(),
                    };
                }

                allergyMap[allergyKey].total++;
                allergyMap[allergyKey].basedOnEntries.add(entry.foodName);
                allergyMap[allergyKey].matchedKeywords.add(match.matchedKeyword);

                // Track whether any symptom was linked to this food entry
                let hadReactionForThisMeal = false;
                candidateSymptoms.forEach(symptom => {
                    const symptomDT = new Date(`${symptom.date}T${symptom.time || '00:00'}:00`);
                    if (!isWithinTwentyFourHourWindow(foodDT, symptomDT)) return;

                    if (isSymptomSupportedByAllergy(symptom.symptomName, [match.entry])) {
                        hadReactionForThisMeal = true;
                        allergyMap[allergyKey].linkedSymptoms.add(symptom.symptomName);
                    }
                });

                if (hadReactionForThisMeal) {
                    allergyMap[allergyKey].reactions++;
                }
            });
        });

        return Object.entries(allergyMap).map(([allergyKey, data]) => {
            // Simple trigger score = percentage of meals that had a linked reaction
            const triggerScore =
                data.total > 0 ? Math.round((data.reactions / data.total) * 100) : 0;

            const override = userOverrides[allergyKey];
            const allergyName = ALLERGY_DATABASE.find(
                item => item.allergy_name.toLowerCase().trim() === allergyKey
            )?.allergy_name || allergyKey;
            const basedOn = Array.from(data.basedOnEntries);

            let status: AllergyPattern['status'] = 'suspected';
            if (override === 'confirmed') status = 'confirmed';
            else if (override === 'dismissed') status = 'dismissed';
            else if (override === 'safe' || data.reactions === 0) status = 'safe';

            return {
                food: allergyName,
                triggerScore,
                reactionCount: data.reactions,
                totalConsumed: data.total,
                symptomFreeCount: data.total - data.reactions,
                status,
                advisoryMessage:
                    status === 'safe'
                        ? `${allergyName} has no matching symptom pattern yet.`
                        : `${allergyName} matched symptoms based on entries like: ${basedOn.slice(0, 2).join(' | ')}.`,
                linkedSymptoms: Array.from(data.linkedSymptoms),
                basedOnEntries: basedOn,
                matchedKeywords: Array.from(data.matchedKeywords),
            };
        });
    }, [ingredients, symptoms, userOverrides]);

    // Foods marked as safe by pattern calculation or user override
    const safeFoods = patterns.filter(p => p.status === 'safe');

    const getTodayStats = () => {
        const todayKey = new Date().toISOString().slice(0, 10);
        const foodsLogged = ingredients.filter(i => i.date === todayKey).length;
        const symptomsLogged = symptoms.filter(s => s.date === todayKey).length;
        return { foodsLogged, symptomsLogged };
    };

    const getEliminationStats = (): EliminationStats => {
        if (symptoms.length === 0) {
            return { symptomFreeDays: 0, lastSymptomDate: null };
        }

        const lastSymptom = symptoms.reduce((latest, entry) => {
            const time = entry.time || '00:00';
            const dt = new Date(`${entry.date}T${time}:00`);
            return !latest || dt > latest ? dt : latest;
        }, null as Date | null);

        if (!lastSymptom) {
            return { symptomFreeDays: 0, lastSymptomDate: null };
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const lastSymptomStart = new Date(lastSymptom);
        lastSymptomStart.setHours(0, 0, 0, 0);

        const diffDays = Math.max(
            0,
            Math.floor(
                (todayStart.getTime() - lastSymptomStart.getTime()) /
                    (1000 * 60 * 60 * 24)
            )
        );

        return {
            symptomFreeDays: diffDays,
            lastSymptomDate: lastSymptom.toISOString(),
        };
    };

    const addIngredient = (entry: Omit<IngredientEntry, 'id'>) => {
        setIngredients(prev => [
            ...prev,
            { ...entry, id: Date.now().toString(), source: entry.source ?? 'manual' },
        ]);
    };

    const updateIngredient = (id: string, updates: Partial<IngredientEntry>) => {
        setIngredients(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const addSymptom = (entry: Omit<SymptomEntry, 'id'>) => {
        setSymptoms(prev => [...prev, { ...entry, id: Date.now().toString() }]);
    };

    const updateSymptom = (id: string, updates: Partial<SymptomEntry>) => {
        setSymptoms(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const deleteIngredient = (id: string) => {
        setIngredients(prev => prev.filter(item => item.id !== id));
    };

    const deleteSymptom = (id: string) => {
        setSymptoms(prev => prev.filter(item => item.id !== id));
    };

    const confirmPattern = (food: string) => {
        setUserOverrides(prev => ({ ...prev, [food.toLowerCase()]: 'confirmed' }));
    };

    const dismissPattern = (food: string) => {
        setUserOverrides(prev => ({ ...prev, [food.toLowerCase()]: 'dismissed' }));
    };

    const markFoodSafe = (food: string) => {
        setUserOverrides(prev => ({ ...prev, [food.toLowerCase()]: 'safe' }));
    };

    const getIngredientsForDate = (date: string) =>
        ingredients.filter(i => i.date === date);

    const getSymptomsForDate = (date: string) =>
        symptoms.filter(s => s.date === date);

    const getRecentFoods = (hours: number) => {
        const now = new Date();
        const cutoffMs = hours * 60 * 60 * 1000;

        return ingredients
            .map(entry => {
                const time = entry.time || '00:00';
                const when = new Date(`${entry.date}T${time}:00`);
                return { entry, when };
            })
            .filter(({ when }) => {
                const diff = now.getTime() - when.getTime();
                return diff >= 0 && diff <= cutoffMs;
            })
            .sort((a, b) => b.when.getTime() - a.when.getTime())
            .map(({ entry }) => entry);
    };

    const linkSymptomToRecentFoods = (symptomId: string, hours = 24) => {
        const recentFoods = getRecentFoods(hours).map(f => f.foodName);
        if (recentFoods.length === 0) return;
        updateSymptom(symptomId, { linkedIngredients: recentFoods });
    };

    const getAllergyPatternDetails = (allergyName: string): AllergyPatternDetails | null => {
        const normalizedAllergy = allergyName.toLowerCase().trim();
        const basePattern = [...patterns, ...safeFoods].find(
            pattern => pattern.food.toLowerCase().trim() === normalizedAllergy
        );

        const linkedEntries: AllergyLinkedEntry[] = [];
        const linkedSymptomsMap = new Map<string, AllergyLinkedSymptom>();
        const matchedKeywordsSet = new Set<string>();

        ingredients.forEach(entry => {
            const matches = getMatchingAllergiesForFood(entry.foodName).filter(
                match => match.entry.allergy_name.toLowerCase().trim() === normalizedAllergy
            );
            if (matches.length === 0) return;

            matches.forEach(match => {
                matchedKeywordsSet.add(match.matchedKeyword);
                linkedEntries.push({
                    ingredientId: entry.id,
                    ingredientText: entry.foodName,
                    date: entry.date,
                    time: entry.time,
                    matchedKeyword: match.matchedKeyword,
                    matchedAllergyName: match.entry.allergy_name,
                });

                const foodDT = new Date(`${entry.date}T${entry.time || '00:00'}:00`);
                symptoms.forEach(symptom => {
                    const symptomDT = new Date(`${symptom.date}T${symptom.time || '00:00'}:00`);
                    if (!isWithinTwentyFourHourWindow(foodDT, symptomDT)) return;
                    if (!isSymptomSupportedByAllergy(symptom.symptomName, [match.entry])) return;

                    linkedSymptomsMap.set(symptom.id, {
                        symptomId: symptom.id,
                        symptomName: symptom.symptomName,
                        date: symptom.date,
                        time: symptom.time,
                        severity: symptom.severity,
                        notes: symptom.notes,
                    });
                });
            });
        });

        if (!basePattern && linkedEntries.length === 0) return null;

        const fallbackAllergyName =
            ALLERGY_DATABASE.find(item => item.allergy_name.toLowerCase().trim() === normalizedAllergy)
                ?.allergy_name || allergyName;

        return {
            allergyName: basePattern?.food || fallbackAllergyName,
            triggerScore: basePattern?.triggerScore || 0,
            reactionCount: basePattern?.reactionCount || 0,
            totalConsumed: basePattern?.totalConsumed || linkedEntries.length,
            symptomFreeCount: basePattern?.symptomFreeCount || 0,
            linkedSymptoms: basePattern?.linkedSymptoms || Array.from(linkedSymptomsMap.values()).map(s => s.symptomName),
            matchedKeywords: basePattern?.matchedKeywords || Array.from(matchedKeywordsSet),
            basedOnEntries: basePattern?.basedOnEntries || linkedEntries.map(entry => entry.ingredientText),
            entries: linkedEntries.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
            symptoms: Array.from(linkedSymptomsMap.values()).sort((a, b) =>
                `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
            ),
        };
    };

    return (
        <DataContext.Provider
                value={{
                ingredients,
                symptoms,
                // Only expose patterns that are either confirmed by the user
                // or have at least two recorded reactions (correlations).
                patterns: patterns.filter(
                    p => p.status !== 'safe' && (p.status === 'confirmed' || p.reactionCount >= 2)
                ),
                safeFoods,
                addIngredient,
                updateIngredient,
                addSymptom,
                updateSymptom,
                deleteIngredient,
                deleteSymptom,
                confirmPattern,
                dismissPattern,
                markFoodSafe,
                getTodayStats,
                getEliminationStats,
                getRecentFoods,
                linkSymptomToRecentFoods,
                getIngredientsForDate,
                getSymptomsForDate,
                getAllergyPatternDetails,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used inside DataProvider');
    return context;
}
