import { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet, Alert, ScrollView, Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('token');
                        await AsyncStorage.removeItem('user');
                        router.replace('/auth/login' as any);
                    }
                }
            ]
        );
    };

    if (!user) return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔐</Text>
            <Text style={styles.emptyTitle}>Login Required</Text>
            <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/auth/login' as any)}
            >
                <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                   {user.profile_image ? (
        <Image
            source={{ uri: `http://localhost:5000${user.profile_image}` }}
            style={styles.avatarImage}
        />
    ) : (
        <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase()}
        </Text>
    )}
</View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user.role === 'SELLER' ? '🏬 Seller' : '🛒 Buyer'}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>

                {/* Buyer Menu */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/orders' as any)}
                >
                    <Text style={styles.menuIcon}>📦</Text>
                    <Text style={styles.menuText}>My Orders</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/cart' as any)}
                >
                    <Text style={styles.menuIcon}>🛒</Text>
                    <Text style={styles.menuText}>My Cart</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>

                {/* Seller Only Menu */}
                {user.role === 'SELLER' && (
                    <>
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Seller Tools</Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/seller/dashboard' as any)}
                        >
                            <Text style={styles.menuIcon}>💰</Text>
                            <Text style={styles.menuText}>My Dashboard</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/seller/add-book' as any)}
                        >
                            <Text style={styles.menuIcon}>📚</Text>
                            <Text style={styles.menuText}>Add New Book</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/seller/my-sales' as any)}
                        >
                            <Text style={styles.menuIcon}>📊</Text>
                            <Text style={styles.menuText}>My Sales</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/subscription/plans')}
                        >
                            <Text style={styles.menuIcon}>💳</Text>
                            <Text style={styles.menuText}>Subscription Plans</Text>
                            <Text style={styles.menuArrow}>→</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.divider} />

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutItem}
                    onPress={handleLogout}
                >
                    <Text style={styles.menuIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: {
        backgroundColor: '#0f3460',
        padding: 30,
        paddingTop: 60,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    roleText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 15,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f4f8',
    },
    menuIcon: { fontSize: 20, marginRight: 12 },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a2e',
    },
    menuArrow: {
        fontSize: 16,
        color: '#94a3b8',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 8,
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f4f8',
        marginVertical: 5,
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    logoutText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#e74c3c',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIcon: { fontSize: 60, marginBottom: 15 },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 20,
    },
    loginBtn: {
        backgroundColor: '#0f3460',
        borderRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    loginBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
    avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
},
});
