const express = require('express');
const router = express.Router();

// قاموس التنقل
const navigationMap = {
    'home': '/',
    'login': '/login',
    'register': '/register',
    'sign up': '/register',
    'cart': '/cart',
    'my orders': '/my-orders',
    'orders': '/my-orders',
    'seller dashboard': '/seller-dashboard',
    'dashboard': '/seller-dashboard',
    'add book': '/add-book',
    'subscription': '/subscription/plans',
    'plans': '/subscription/plans',
    'subscription plans': '/subscription/plans',
    'admin dashboard': '/admin-dashboard',
    'admin panel': '/admin-dashboard',
    'control panel': '/admin-dashboard',
};

// دالة للتحقق من نية التنقل
const checkNavigationIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    const navigationKeywords = ['go to', 'take me to', 'navigate to', 'open', 'show me', 'i want to go'];
    const hasNavigationIntent = navigationKeywords.some(keyword => lowerMessage.includes(keyword));
    if (hasNavigationIntent) {
        for (const [key, route] of Object.entries(navigationMap)) {
            if (lowerMessage.includes(key)) {
                return route;
            }
        }
    }
    return null;
};

// دالة للتحقق من ردود الموافقة
const checkAffirmativeResponse = (message, messages) => {
    const lowerMessage = message.toLowerCase().trim();
    const affirmativeWords = ['yes', 'sure', 'ok', 'okay', 'yeah', 'yep', 'please', 'go ahead'];
    if (affirmativeWords.includes(lowerMessage)) {
        const lastBotMessage = messages.filter(m => m.role === 'assistant').pop();
        if (lastBotMessage && lastBotMessage.content.includes('browse books')) {
            return '/';
        }
    }
    return null;
};

router.post('/chat', async (req, res) => {
    try {
        const { messages, userRole } = req.body;

        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) {
            return res.status(400).json({ error: 'No user message found' });
        }

        const userQuestion = lastUserMessage.content;

        // 1. التحقق من رسائل الترحيب
        const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy', 'greetings', 'salut', 'bonjour', 'salam', 'مرحبا', 'السلام عليكم'];
        const isGreeting = greetingWords.some(word => userQuestion.toLowerCase().trim() === word || userQuestion.toLowerCase().trim().startsWith(word));

        if (isGreeting) {
            const greetingResponses = {
                'BUYER': `Hey ${req.body.userName || 'there'}! 👋 I'm UniBot, your UNIBOOKS assistant. I can help you find books, track your orders, or answer any questions about our platform. What can I do for you today? 📚`,
                'SELLER': `Hey ${req.body.userName || 'there'}! 👋 I'm UniBot, your UNIBOOKS assistant. I can help you manage your books, track your sales, or learn about subscription plans. How can I assist you today? 📚`,
                'admin': `Welcome back Admin! 👋 🛡️ I'm UniBot. You have full control over the platform. You can manage users, books, reclamations, and subscriptions from your dashboard. How can I assist you today?`,
                'guest': `Hey there! 👋 I'm UniBot, your UNIBOOKS assistant. I can help you discover great books or learn how to join our platform. What can I help you with? 📚`
            };
            const role = req.body.userRole || 'guest';
            return res.json({
                reply: greetingResponses[role] || greetingResponses['guest']
            });
        }

        // 2. التحقق من ردود الموافقة
        const affirmativeRoute = checkAffirmativeResponse(userQuestion, messages);
        if (affirmativeRoute) {
            return res.json({
                reply: `Sure! Taking you to the Home page to browse books. [NAVIGATE:/]`
            });
        }

        // 3. التحقق من نية التنقل
        const navigationRoute = checkNavigationIntent(userQuestion);
        if (navigationRoute) {
            const sellerOnlyRoutes = ['/seller-dashboard', '/add-book', '/subscription/plans'];
            const adminOnlyRoutes = ['/admin-dashboard'];

            if (adminOnlyRoutes.includes(navigationRoute) && userRole !== 'admin') {
                return res.json({
                    reply: "⛔ Sorry, the Admin Dashboard is only accessible to administrators. Is there anything else I can help you with? 📚"
                });
            }

            if (sellerOnlyRoutes.includes(navigationRoute) && userRole !== 'SELLER') {
                return res.json({
                    reply: "This page is only available for sellers. Would you like to browse books instead? 📚"
                });
            }

            const routeNames = {
                '/': 'Home',
                '/login': 'Login',
                '/register': 'Register',
                '/cart': 'Cart',
                '/my-orders': 'My Orders',
                '/seller-dashboard': 'Seller Dashboard',
                '/add-book': 'Add Book',
                '/subscription/plans': 'Subscription Plans',
                '/admin-dashboard': 'Admin Dashboard',
            };

            return res.json({
                reply: `Sure! Taking you to ${routeNames[navigationRoute]} page. [NAVIGATE:${navigationRoute}]`
            });
        }

        // 4. إرسال السؤال إلى سيرفر Python
        const response = await fetch('http://localhost:5001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userQuestion })
        });

        const data = await response.json();
        res.json({ reply: data.response });

    } catch (err) {
        console.error("Chatbot error:", err.message);
        res.status(500).json({ error: "Chatbot error", details: err.message });
    }
});

module.exports = router;