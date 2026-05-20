import React, { useCallback, useRef } from "react";
import { Animated, Easing, StyleProp, View, ViewStyle } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

type AnimatedScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedScreen({ children, style }: AnimatedScreenProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(8)).current;

  useFocusEffect(
    useCallback(() => {
      translateY.setValue(8);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [translateY])
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateY }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}
