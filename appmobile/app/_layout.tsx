import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                router.replace('/(tabs)' as any);
            } else {
                router.replace('/auth/login' as any);
            }
        } catch (err) {
            router.replace('/auth/login' as any);
        }
    };

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="book" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="seller" />
            <Stack.Screen name="subscription" />
        </Stack>
    );
}