import { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function SellerBooks() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchBooks = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            const sellerId = userData?.id;
            if (!sellerId) return;

            const res = await axios.get(`${API_URL}/seller/books/${sellerId}`);
            setBooks(res.data);
        } catch (err: any) {
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Book',
            'Are you sure you want to delete this book?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/seller/books/${id}`);
                            Alert.alert('Success', 'Book deleted successfully.');
                            fetchBooks();
                        } catch (err: any) {
                            Alert.alert('Error', 'Failed to delete book.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            <Text style={styles.pageTitle}>📚 My Books</Text>

            {books.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No books found.</Text>
                </View>
            ) : (
                books.map((book: any) => (
                    <View key={book.id} style={styles.bookCard}>

                        {/* Title & Date */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {book.title}
                            </Text>
                            <Text style={styles.bookDate}>
                                {new Date(book.created_at).toLocaleDateString()}
                            </Text>
                        </View>

                        {/* Price & Stock */}
                        <View style={styles.cardMeta}>
                            <Text style={styles.bookPrice}>
                                ${Number(book.price).toFixed(2)}
                            </Text>
                            <View style={[
                                styles.stockBadge,
                                { backgroundColor: book.stock > 0 ? '#27ae60' : '#e74c3c' }
                            ]}>
                                <Text style={styles.stockText}>
                                    Stock: {book.stock}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => router.push(`/book/edit/${book.id}` as any)}
                            >
                                <Text style={styles.btnText}>✏️ Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(book.id)}
                            >
                                <Text style={styles.btnText}>🗑️ Delete</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                ))
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: 16,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: 12,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },

    // Book Card
    bookCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    bookTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a2e',
        marginRight: 10,
    },
    bookDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    bookPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f3460',
    },
    stockBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    stockText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
    },
    editBtn: {
        flex: 1,
        backgroundColor: '#3498db',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: '#e74c3c',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
});