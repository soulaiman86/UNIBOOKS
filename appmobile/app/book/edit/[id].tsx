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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const CATEGORIES = ['FICTION', 'SCIENCE', 'HISTORY', 'COOKING', 'TECHNOLOGY'];

export default function EditBook() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('FICTION');
    const [condition, setCondition] = useState('New');
    const [stock, setStock] = useState('1');
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await axios.get(`${API_URL}/books/${id}`);
                const book = res.data;
                setTitle(book.title);
                setDescription(book.description);
                setPrice(String(book.price));
                setCategory(book.category);
                setCondition(book.condition || 'New');
                setStock(String(book.stock || 1));
            } catch (err: any) {
                Alert.alert('Error', 'Failed to load book details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !price) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('condition', condition);
            formData.append('stock', stock);
            if (image) {
                formData.append('image', {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: 'book-cover.jpg',
                } as any);
            }

            await axios.put(`${API_URL}/books/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Book updated successfully!', [
                { text: 'OK', onPress: () => router.push(`/book/${id}` as any) },
            ]);
        } catch (err: any) {
            Alert.alert('Error', 'Failed to update book.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f3460" />
                <Text style={styles.loadingText}>Loading book data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>📚 UNIBOOKS</Text>
                <Text style={styles.title}>Edit Book Details</Text>
                <Text style={styles.subtitle}>Update your book information</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>

                {/* Title */}
                <Text style={styles.label}>Book Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#94a3b8"
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#94a3b8"
                />

                {/* Price & Stock Row */}
                <View style={styles.row}>
                    <View style={styles.rowField}>
                        <Text style={styles.label}>Price ($)</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <View style={styles.rowField}>
                        <Text style={styles.label}>Stock</Text>
                        <TextInput
                            style={styles.input}
                            value={stock}
                            onChangeText={setStock}
                            keyboardType="number-pad"
                            placeholderTextColor="#94a3b8"
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
                                category === cat && styles.categoryChipActive,
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                category === cat && styles.categoryChipTextActive,
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
                        style={[styles.conditionCard, condition === 'New' && styles.conditionCardActive]}
                        onPress={() => setCondition('New')}
                    >
                        <Text style={styles.conditionIcon}>✨</Text>
                        <Text style={styles.conditionTitle}>New</Text>
                        <Text style={styles.conditionDesc}>Brand new book</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.conditionCard, condition === 'Used' && styles.conditionCardActive]}
                        onPress={() => setCondition('Used')}
                    >
                        <Text style={styles.conditionIcon}>📖</Text>
                        <Text style={styles.conditionTitle}>Used</Text>
                        <Text style={styles.conditionDesc}>Previously read</Text>
                    </TouchableOpacity>
                </View>

                {/* Image Picker */}
                <Text style={styles.label}>Update Cover Image (Optional)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Text style={styles.imagePickerIcon}>🖼️</Text>
                    <Text style={styles.imagePickerText}>
                        {image ? '✅ New Image Selected' : 'Tap to upload a new cover'}
                    </Text>
                    <Text style={styles.imagePickerHint}>PNG, JPG supported</Text>
                </TouchableOpacity>

                {/* Buttons Row */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>💾 Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    loadingText: {
        color: '#64748b',
        marginTop: 12,
        fontSize: 14,
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

    // Form
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
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#94a3b8',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#27ae60',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    saveBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    saveBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});