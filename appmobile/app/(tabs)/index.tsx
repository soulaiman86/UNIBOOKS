import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function HomeScreen() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const categories = ['', 'FICTION', 'SCIENCE', 'HISTORY', 'COOKING', 'TECHNOLOGY'];
    const categoryLabels = {
        '': 'All',
        'FICTION': 'Fiction',
        'SCIENCE': 'Science',
        'HISTORY': 'History',
        'COOKING': 'Cooking',
        'TECHNOLOGY': 'Technology'
    };

    const fetchBooks = async () => {
        try {
            const params: any = {};
            if (search) params.search = search;
            if (category) params.category = category;

            const response = await axios.get(`${API_URL}/books`, { params });
            setBooks(response.data);
            
           
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
 

    useEffect(() => {
        fetchBooks();
    }, [category]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBooks();
    };

    const renderBook = ({ item }: any) => {
        const isSoldOut = item.stock === 0;
        let imageUrl = 'https://via.placeholder.com/150';
        if (item.image_urls && item.image_urls.length > 0) {
            imageUrl = item.image_urls[0];
        }

        return (
            <TouchableOpacity
                style={[styles.bookCard, isSoldOut && styles.bookCardSoldOut]}
                onPress={() => !isSoldOut && router.push(`/book/${item.id}` as any)}
                disabled={isSoldOut}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.bookImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/150' }}
                />
                {isSoldOut && (
                    <View style={styles.soldOutBadge}>
                        <Text style={styles.soldOutText}>Sold Out</Text>
                    </View>
                )}
                {item.condition && (
                    <View style={[styles.conditionBadge, { backgroundColor: item.condition === 'New' ? '#27ae60' : '#3498db' }]}>
                        <Text style={styles.conditionText}>{item.condition === 'New' ? '✨ New' : '📖 Used'}</Text>
                    </View>
                )}
                <View style={styles.bookInfo}>
                    <Text style={styles.bookCategory}>{item.category}</Text>
                    <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.bookSeller}>by {item.seller_name}</Text>
                    <View style={styles.bookFooter}>
                        <Text style={styles.bookPrice}>${Number(item.price).toFixed(2)}</Text>
                        <TouchableOpacity
                            style={[styles.detailsBtn, isSoldOut && styles.detailsBtnDisabled]}
                            disabled={isSoldOut}
                            onPress={() => !isSoldOut && router.push(`/book/${item.id}` as any)}
                        >
                            <Text style={styles.detailsBtnText}>
                                {isSoldOut ? 'Out of Stock' : 'View'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📚 UNIBOOKS</Text>
                <Text style={styles.headerSubtitle}>Discover & Buy Books</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔎 Search by title..."
                    placeholderTextColor="#94a3b8"
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={fetchBooks}
                    returnKeyType="search"
                />
            </View>

            {/* Categories */}
            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesList}
                renderItem={({ item: cat }) => (
                    <TouchableOpacity
                        style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>
                            {categoryLabels[cat as keyof typeof categoryLabels]}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Books Count */}
            {!loading && (
                <Text style={styles.booksCount}>{books.length} Books Found</Text>
            )}

            {/* Books List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0f3460" />
                    <Text style={styles.loadingText}>Loading books...</Text>
                </View>
            ) : (
                <FlatList
                    data={books}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderBook}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.booksList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f3460']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>No books found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        backgroundColor: '#0f3460',
        padding: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    searchContainer: {
        padding: 15,
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        color: '#1a1a2e',
    },
    categoriesList: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 30,
    flexGrow: 0,
},
    categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
    marginRight: 8,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
},
    categoryBtnActive: {
        backgroundColor: '#0f3460',
        borderColor: '#0f3460',
    },
    categoryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 16,
},
    categoryBtnTextActive: {
        color: 'white',
    },
    booksCount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a2e',
        padding: 15,
        paddingBottom: 5,
    },
    booksList: {
        padding: 10,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    bookCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 15,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    bookCardSoldOut: {
        opacity: 0.6,
    },
    bookImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    soldOutBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#e74c3c',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    soldOutText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
    conditionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    conditionText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
    bookInfo: {
        padding: 10,
    },
    bookCategory: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0f3460',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    bookTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 3,
    },
    bookSeller: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 8,
    },
    bookFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f3460',
    },
    detailsBtn: {
        backgroundColor: '#0f3460',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    detailsBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    detailsBtnText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
});