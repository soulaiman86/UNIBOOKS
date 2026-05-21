import { useState, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function BookDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [book, setBook] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchData();
        loadUser();
    }, [id]);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    };

    const fetchData = async () => {
        try {
            const [bookRes, reviewsRes] = await Promise.all([
                axios.get(`${API_URL}/books/${id}`),
                axios.get(`${API_URL}/reviews/book/${id}`)
            ]);
            setBook(bookRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to add books to your cart', [
                { text: 'Cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login' as any) }
            ]);
            return;
        }
        try {
            await axios.post(`${API_URL}/cart/add`, {
                user_id: user.id,
                book_id: id
            });
            Alert.alert('Success', 'Book added to your cart! 📚');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const buyNow = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to purchase this book', [
                { text: 'Cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login' as any) }
            ]);
            return;
        }
        router.push({ pathname: '/checkout' as any, params: { bookId: id, bookTitle: book.title, bookPrice: book.price } });
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f3460" />
        </View>
    );

    if (!book) return (
        <View style={styles.loadingContainer}>
            <Text>Book not found!</Text>
        </View>
    );

    const isOwner = user && user.id === book.seller_id;
    const isSoldOut = book.stock === 0;
    let imageUrl = 'https://via.placeholder.com/300';
    if (book.image_urls && book.image_urls.length > 0) {
        imageUrl = book.image_urls[0];
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Back Button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>

            {/* Book Image */}
            <Image source={{ uri: imageUrl }} style={styles.bookImage} />

            {/* Book Info */}
            <View style={styles.infoContainer}>

                {/* Category & Condition */}
                <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{book.category}</Text>
                    </View>
                    <View style={[styles.conditionBadge, { backgroundColor: book.condition === 'New' ? '#f0fdf4' : '#eff6ff' }]}>
                        <Text style={[styles.conditionText, { color: book.condition === 'New' ? '#27ae60' : '#2980b9' }]}>
                            {book.condition === 'New' ? '✨ New' : '📖 Used'}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{book.title}</Text>
                {/* Price & Stock Row */}
<View style={styles.priceRow}>
    <Text style={styles.price}>${book.price}</Text>
    <View style={[styles.stockBadge, { backgroundColor: book.stock > 0 ? '#f0fdf4' : '#fef2f2', borderWidth: 1, borderColor: book.stock > 0 ? '#27ae60' : '#e74c3c' }]}>
        <Text style={[styles.stockText, { color: book.stock > 0 ? '#27ae60' : '#e74c3c' }]}>
            {book.stock > 0 ? `✅ ${book.stock} In Stock` : '❌ Out of Stock'}
        </Text>
    </View>
</View>

{/* Description */}
<Text style={styles.description}>{book.description}</Text>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Text style={styles.stars}>{'★'.repeat(Math.floor(Number(averageRating)))}{'☆'.repeat(5 - Math.floor(Number(averageRating)))}</Text>
                    <Text style={styles.ratingText}>{averageRating} / 5</Text>
                    <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
                </View>

                {/* Seller */}
                <View style={styles.sellerCard}>
                    <Text style={styles.sellerLabel}>Sold by</Text>
                    <View style={styles.sellerRow}>
                        {book.seller_image ? (
                            <Image
                                source={{ uri: `http://localhost:5000${book.seller_image}` }}
                                style={styles.sellerAvatar}
                            />
                        ) : (
                            <View style={styles.sellerAvatarPlaceholder}>
                                <Text style={styles.sellerAvatarText}>
                                    {book.seller_name?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.sellerName}>{book.seller_name}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {!isOwner && (
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity
                            style={[styles.cartBtn, isSoldOut && styles.btnDisabled]}
                            onPress={addToCart}
                            disabled={isSoldOut}
                        >
                            <Text style={styles.btnText}>🛒 Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.buyBtn, isSoldOut && styles.btnDisabled]}
                            onPress={buyNow}
                            disabled={isSoldOut}
                        >
                            <Text style={styles.btnText}>⚡ Buy Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isOwner && (
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push(`/book/edit/${id}` as any)}
                    >
                        <Text style={styles.btnText}>✏️ Edit Book</Text>
                    </TouchableOpacity>
                )}

            </View>

            {/* Reviews Section */}
            <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>Customer Reviews</Text>
                {reviews.length === 0 ? (
                    <View style={styles.emptyReviews}>
                        <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to review!</Text>
                    </View>
                ) : (
                    reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewerName}>{review.buyer_name}</Text>
                                <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
                            </View>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                            <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))
                )}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backBtn: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    backBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    bookImage: { width: '100%', height: 300, resizeMode: 'cover' },
    infoContainer: { backgroundColor: 'white', borderRadius: 20, margin: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    categoryBadge: { backgroundColor: '#f0f4ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    categoryText: { color: '#0f3460', fontWeight: '700', fontSize: 12 },
    conditionBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    conditionText: { fontWeight: '700', fontSize: 12 },
    title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    stars: { color: '#f1c40f', fontSize: 16 },
    ratingText: { fontWeight: '700', color: '#1a1a2e' },
    reviewCount: { color: '#94a3b8', fontSize: 13 },
    sellerCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    sellerLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    sellerName: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
    description: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 15 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    price: { fontSize: 28, fontWeight: '800', color: '#0f3460' },
    stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    stockText: { fontWeight: '700', fontSize: 13 },
    buttonsRow: { flexDirection: 'row', gap: 10 },
    cartBtn: { flex: 1, backgroundColor: '#0f3460', borderRadius: 10, padding: 14, alignItems: 'center' },
    buyBtn: { flex: 1, backgroundColor: '#27ae60', borderRadius: 10, padding: 14, alignItems: 'center' },
    editBtn: { backgroundColor: '#f39c12', borderRadius: 10, padding: 14, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#94a3b8' },
    btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    reviewsSection: { backgroundColor: 'white', borderRadius: 20, margin: 15, marginTop: 0, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, marginBottom: 30 },
    reviewsTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 15, paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: '#f0f4f8' },
    emptyReviews: { alignItems: 'center', padding: 20 },
    emptyReviewsText: { color: '#94a3b8', fontSize: 14 },
    reviewCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewerName: { fontWeight: '700', color: '#1a1a2e' },
    reviewStars: { color: '#f1c40f', fontSize: 16 },
    reviewComment: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 6 },
    reviewDate: { color: '#94a3b8', fontSize: 12 },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },
    sellerAvatar: {
        width: 70,
        height: 70,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    sellerAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerAvatarText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    
});
