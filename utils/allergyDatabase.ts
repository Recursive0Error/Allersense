export interface AllergyDatabaseEntry {
    allergy_name: string;
    common_symptoms: string[];
    food_causes: string[];
    indian_food_examples: string[];
}

export const ALLERGY_DATABASE: AllergyDatabaseEntry[] = [
    {
        allergy_name: 'Peanut Allergy',
        common_symptoms: ['Hives', 'Swelling', 'Nausea', 'Breathing difficulty'],
        food_causes: ['Peanuts', 'Peanut oil'],
        indian_food_examples: ['Poha with peanuts', 'Sabudana khichdi', 'Chikki', 'Groundnut chutney'],
    },
    {
        allergy_name: 'Almond Allergy',
        common_symptoms: ['Itching', 'Swelling', 'Rash'],
        food_causes: ['Almonds', 'Almond milk'],
        indian_food_examples: ['Badam milk', 'Badam halwa', 'Dry fruit laddu'],
    },
    {
        allergy_name: 'Cashew Allergy',
        common_symptoms: ['Vomiting', 'Hives', 'Throat swelling'],
        food_causes: ['Cashews'],
        indian_food_examples: ['Kaju katli', 'Korma gravy', 'Dry fruit pulao'],
    },
    {
        allergy_name: 'Walnut Allergy',
        common_symptoms: ['Skin rash', 'Swelling'],
        food_causes: ['Walnuts'],
        indian_food_examples: ['Dry fruit barfi', 'Sheer khurma'],
    },
    {
        allergy_name: 'Pistachio Allergy',
        common_symptoms: ['Itching', 'Nausea'],
        food_causes: ['Pistachios'],
        indian_food_examples: ['Pista kulfi', 'Pista barfi'],
    },
    {
        allergy_name: 'Milk Allergy',
        common_symptoms: ['Vomiting', 'Diarrhea', 'Rash'],
        food_causes: ['Milk', 'Paneer', 'Butter', 'Ghee'],
        indian_food_examples: ['Paneer butter masala', 'Kheer', 'Lassi', 'Gulab jamun'],
    },
    {
        allergy_name: 'Egg Allergy',
        common_symptoms: ['Hives', 'Nasal congestion'],
        food_causes: ['Eggs'],
        indian_food_examples: ['Egg curry', 'Egg biryani', 'Bakery cake'],
    },
    {
        allergy_name: 'Wheat Allergy',
        common_symptoms: ['Bloating', 'Stomach pain'],
        food_causes: ['Wheat flour', 'Maida'],
        indian_food_examples: ['Chapati', 'Naan', 'Samosa', 'Bhature'],
    },
    {
        allergy_name: 'Gluten Sensitivity',
        common_symptoms: ['Fatigue', 'Diarrhea'],
        food_causes: ['Wheat', 'Barley', 'Rye'],
        indian_food_examples: ['Roti', 'Bread pakora', 'Atta biscuits'],
    },
    {
        allergy_name: 'Soy Allergy',
        common_symptoms: ['Itching', 'Stomach cramps'],
        food_causes: ['Soybeans', 'Soy sauce', 'Soya chunks'],
        indian_food_examples: ['Soya chunk pulao', 'Manchurian', 'Hakka noodles'],
    },
    {
        allergy_name: 'Fish Allergy',
        common_symptoms: ['Hives', 'Breathing difficulty'],
        food_causes: ['Fish'],
        indian_food_examples: ['Fish curry', 'Macher jhol', 'Fish fry'],
    },
    {
        allergy_name: 'Shellfish Allergy',
        common_symptoms: ['Throat swelling', 'Shortness of breath'],
        food_causes: ['Shrimp', 'Crab', 'Prawns'],
        indian_food_examples: ['Prawn curry', 'Crab masala'],
    },
    {
        allergy_name: 'Sesame Allergy',
        common_symptoms: ['Rash', 'Swelling'],
        food_causes: ['Sesame seeds', 'Sesame oil'],
        indian_food_examples: ['Til laddu', 'Til chikki', 'Burger buns'],
    },
    {
        allergy_name: 'Mustard Allergy',
        common_symptoms: ['Skin irritation', 'Itching'],
        food_causes: ['Mustard seeds', 'Mustard oil'],
        indian_food_examples: ['Sarson ka saag', 'Pickles', 'Bengali curry'],
    },
    {
        allergy_name: 'Corn Allergy',
        common_symptoms: ['Hives', 'Headache'],
        food_causes: ['Corn', 'Corn flour'],
        indian_food_examples: ['Makki ki roti', 'Corn chaat'],
    },
    {
        allergy_name: 'Rice Allergy',
        common_symptoms: ['Rash', 'Stomach pain'],
        food_causes: ['Rice'],
        indian_food_examples: ['Biryani', 'Idli', 'Dosa', 'Pongal'],
    },
    {
        allergy_name: 'Coconut Allergy',
        common_symptoms: ['Swelling', 'Itching'],
        food_causes: ['Coconut', 'Coconut milk'],
        indian_food_examples: ['Coconut chutney', 'Kerala avial', 'Coconut barfi'],
    },
    {
        allergy_name: 'Tomato Allergy',
        common_symptoms: ['Skin rash', 'Heartburn'],
        food_causes: ['Tomatoes'],
        indian_food_examples: ['Tomato chutney', 'Gravy curries'],
    },
    {
        allergy_name: 'Onion Allergy',
        common_symptoms: ['Bloating', 'Rash'],
        food_causes: ['Onions'],
        indian_food_examples: ['Biryani', 'Onion pakoda','kanda bhaji'],
    },
    {
        allergy_name: 'Garlic Allergy',
        common_symptoms: ['Nausea', 'Skin irritation'],
        food_causes: ['Garlic'],
        indian_food_examples: ['Garlic naan', 'Tadka dal'],
    },
    {
        allergy_name: 'Mango Allergy',
        common_symptoms: ['Rash', 'Lip swelling'],
        food_causes: ['Mango'],
        indian_food_examples: ['Aamras', 'Mango pickle'],
    },
    {
        allergy_name: 'Banana Allergy',
        common_symptoms: ['Itching', 'Swelling'],
        food_causes: ['Bananas'],
        indian_food_examples: ['Banana chips', 'Banana shake'],
    },
    {
        allergy_name: 'Apple Allergy',
        common_symptoms: ['Mouth itching'],
        food_causes: ['Apples'],
        indian_food_examples: ['Fruit chaat', 'Apple halwa'],
    },
    {
        allergy_name: 'Strawberry Allergy',
        common_symptoms: ['Redness', 'Itching'],
        food_causes: ['Strawberries'],
        indian_food_examples: ['Strawberry milkshake', 'Strawberry cake'],
    },
    {
        allergy_name: 'Pineapple Allergy',
        common_symptoms: ['Mouth irritation'],
        food_causes: ['Pineapple'],
        indian_food_examples: ['Pineapple raita', 'Fruit custard'],
    },
    {
        allergy_name: 'Chickpea Allergy',
        common_symptoms: ['Hives', 'Stomach pain'],
        food_causes: ['Chickpeas'],
        indian_food_examples: ['Chole', 'Besan pakora'],
    },
    {
        allergy_name: 'Lentil Allergy',
        common_symptoms: ['Bloating', 'Rash'],
        food_causes: ['Lentils'],
        indian_food_examples: ['Dal tadka', 'Sambar'],
    },
    {
        allergy_name: 'Rajma Allergy',
        common_symptoms: ['Gas', 'Stomach pain'],
        food_causes: ['Kidney beans'],
        indian_food_examples: ['Rajma chawal'],
    },
    {
        allergy_name: 'Chili Allergy',
        common_symptoms: ['Burning sensation', 'Stomach pain'],
        food_causes: ['Red chili', 'Green chili'],
        indian_food_examples: ['Spicy chutneys', 'Pickles'],
    },
    {
        allergy_name: 'Turmeric Allergy',
        common_symptoms: ['Skin rash', 'Nausea'],
        food_causes: ['Turmeric'],
        indian_food_examples: ['Most curries', 'Sabzi'],
    },
    {
        allergy_name: 'Coriander Allergy',
        common_symptoms: ['Itching', 'Sneezing'],
        food_causes: ['Coriander leaves', 'Coriander powder'],
        indian_food_examples: ['Green chutney', 'Garam masala dishes'],
    },
    {
        allergy_name: 'Cumin Allergy',
        common_symptoms: ['Skin irritation'],
        food_causes: ['Cumin seeds'],
        indian_food_examples: ['Jeera rice', 'Tadka dal'],
    },
];
