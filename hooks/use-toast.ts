import { Alert } from "react-native";

type ToastOptions = {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
};

export function useToast() {
    const toast = ({ title, description }: ToastOptions) => {
        Alert.alert(title, description);
    };

    return { toast };
}
