import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import ChatBot from '../../components/ChatBot';
import { View } from 'react-native';

export default function TabLayout() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) setUser(JSON.parse(userData));
            } catch (e) {}
            finally { setLoading(false); }
        };
        loadUser();
    }, []);

    if (loading) return null;

    const isSeller = user?.role === 'SELLER';

    return (
    <View style={{ flex: 1 }}>
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0f3460',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopColor: '#e2e8f0',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />

            <Tabs.Screen
                name="cart"
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
                    // ✅ كلا النوعين يريان Cart
                    href: '/(tabs)/cart' as any,
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    tabBarLabel: 'My Orders',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>📦</Text>,
                    href: '/(tabs)/orders' as any,
                }}
            />

           

            <Tabs.Screen
                name="explore"
                options={{ href: null }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
                }}
            />
            
        </Tabs>
        <ChatBot />
    </View>   
    );
}