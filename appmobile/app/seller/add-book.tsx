import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CATEGORIES = ['FICTION', 'SCIENCE', 'HISTORY', 'COOKING', 'TECHNOLOGY'];

export default function AddBook() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'FICTION',
        condition: 'New',
        seller_id: '',
    });
    const [stock, setStock] = useState('1');
    const [imageFile, setImageFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (!user || user.role !== 'SELLER') {
                Alert.alert('Access Denied', 'This page is for sellers only!');
                router.replace('/(tabs)' as any);
            } else {
                setFormData(prev => ({ ...prev, seller_id: user.id }));
            }
        };
        init();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setImageFile(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.price) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }
        if (!imageFile) {
            Alert.alert('Error', 'Please select a book cover image.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('condition', formData.condition);
            data.append('seller_id', formData.seller_id);
            data.append('stock', stock);
            data.append('image', {
                uri: imageFile.uri,
                type: 'image/jpeg',
                name: 'book-cover.jpg',
            } as any);

            await axios.post(`${API_URL}/books/add`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Book added successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)' as any) },
            ]);
        } catch (error: any) {
            if (error.response?.data?.error === 'SUBSCRIPTION_REQUIRED') {
                Alert.alert(
                    '⚠️ Subscription Required',
                    'You have reached the free limit of 3 books.\n\nUpgrade your subscription to add more books.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'View Plans',
                            onPress: () => router.push('/subscription/plans' as any),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', error.response?.data?.error || 'Server Error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>📚 UNIBOOKS</Text>
                <Text style={styles.title}>List a New Book</Text>
                <Text style={styles.subtitle}>Fill in the details to list your book for sale</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>

                {/* Title */}
                <Text style={styles.label}>Book Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter book title"
                    placeholderTextColor="#94a3b8"
                    value={formData.title}
                    onChangeText={val => setFormData({ ...formData, title: val })}
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the book..."
                    placeholderTextColor="#94a3b8"
                    value={formData.description}
                    onChangeText={val => setFormData({ ...formData, description: val })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Price & Stock Row */}
                <View style={styles.row}>
                    <View style={styles.rowField}>
                        <Text style={styles.label}>Price ($)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#94a3b8"
                            value={formData.price}
                            onChangeText={val => setFormData({ ...formData, price: val })}
                            keyboardType="decimal-pad"
                        />
                    </View>
                    <View style={styles.rowField}>
                        <Text style={styles.label}>Stock</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1"
                            placeholderTextColor="#94a3b8"
                            value={stock}
                            onChangeText={setStock}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                >
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                formData.category === cat && styles.categoryChipActive,
                            ]}
                            onPress={() => setFormData({ ...formData, category: cat })}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                formData.category === cat && styles.categoryChipTextActive,
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Condition */}
                <Text style={styles.label}>Book Condition</Text>
                <View style={styles.conditionRow}>
                    <TouchableOpacity
                        style={[
                            styles.conditionCard,
                            formData.condition === 'New' && styles.conditionCardActive,
                        ]}
                        onPress={() => setFormData({ ...formData, condition: 'New' })}
                    >
                        <Text style={styles.conditionIcon}>✨</Text>
                        <Text style={styles.conditionTitle}>New</Text>
                        <Text style={styles.conditionDesc}>Brand new book</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.conditionCard,
                            formData.condition === 'Used' && styles.conditionCardActive,
                        ]}
                        onPress={() => setFormData({ ...formData, condition: 'Used' })}
                    >
                        <Text style={styles.conditionIcon}>📖</Text>
                        <Text style={styles.conditionTitle}>Used</Text>
                        <Text style={styles.conditionDesc}>Previously read</Text>
                    </TouchableOpacity>
                </View>

                {/* Image Picker */}
                <Text style={styles.label}>Book Cover Image</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Text style={styles.imagePickerIcon}>🖼️</Text>
                    <Text style={styles.imagePickerText}>
                        {imageFile ? '✅ Image Selected' : 'Tap to upload book cover'}
                    </Text>
                    <Text style={styles.imagePickerHint}>PNG, JPG supported</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>📚 List Book for Sale</Text>
                    )}
                </TouchableOpacity>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>← Go Back</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#0f3460',
    },
    pageContent: {
        paddingBottom: 40,
    },

    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
    },
    logo: {
        fontSize: 26,
        fontWeight: '800',
        color: 'white',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },

    // Card
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 16,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },

    // Form Fields
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1a1a2e',
        marginBottom: 16,
    },
    textArea: {
        height: 100,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    rowField: {
        flex: 1,
    },

    // Category
    categoryScroll: {
        marginBottom: 16,
    },
    categoryChip: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        backgroundColor: '#f8fafc',
    },
    categoryChipActive: {
        backgroundColor: '#0f3460',
        borderColor: '#0f3460',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryChipTextActive: {
        color: 'white',
    },

    // Condition
    conditionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    conditionCard: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    conditionCardActive: {
        borderColor: '#0f3460',
        backgroundColor: '#f0f4ff',
    },
    conditionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    conditionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    conditionDesc: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
    },

    // Image Picker
    imagePicker: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        marginBottom: 20,
    },
    imagePickerIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    imagePickerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    imagePickerHint: {
        fontSize: 12,
        color: '#94a3b8',
    },

    // Buttons
    submitBtn: {
        backgroundColor: '#0f3460',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    backBtn: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 15,
    },
});