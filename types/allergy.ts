export interface IngredientEntry {
    id: string;
    foodName: string;
    date: string;
    time: string;
    source?: "manual" | "scanned";
    notes?: string;
}

export interface SymptomEntry {
    id: string;
    symptomName: string;
    date: string;
    time: string;
    severity: number;
    notes?: string;
    suspectedFood?: string;
    linkedIngredients?: string[];
}

export interface AllergyPattern {
    food: string;
    triggerScore: number;
    reactionCount: number;
    totalConsumed: number;
    symptomFreeCount: number;
    status: 'suspected' | 'confirmed' | 'dismissed' | 'safe';
    advisoryMessage: string;
    linkedSymptoms: string[];
    basedOnEntries?: string[];
    matchedKeywords?: string[];
}

export interface EliminationStats {
    symptomFreeDays: number;
    lastSymptomDate: string | null;
}

export interface AllergyLinkedEntry {
    ingredientId: string;
    ingredientText: string;
    date: string;
    time: string;
    matchedKeyword: string;
    matchedAllergyName: string;
}

export interface AllergyLinkedSymptom {
    symptomId: string;
    symptomName: string;
    date: string;
    time: string;
    severity: number;
    notes?: string;
}

export interface AllergyPatternDetails {
    allergyName: string;
    triggerScore: number;
    reactionCount: number;
    totalConsumed: number;
    symptomFreeCount: number;
    linkedSymptoms: string[];
    matchedKeywords: string[];
    basedOnEntries: string[];
    entries: AllergyLinkedEntry[];
    symptoms: AllergyLinkedSymptom[];
}
