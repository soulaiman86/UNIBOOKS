import numpy as np
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

# ===== Dataset =====
my_dataset = {
    'Questions': [
        # General Platform Questions
        'What is UNIBOOKS?',
        'How does UNIBOOKS work?',
        'Is UNIBOOKS free to use?',
        'Who can use UNIBOOKS?',
        'What types of books are available on UNIBOOKS?',
        'Is UNIBOOKS available on mobile?',
        'What languages does UNIBOOKS support?',
        'How do I contact UNIBOOKS support?',
        'Is my data safe on UNIBOOKS?',
        'What countries does UNIBOOKS serve?',

        # Registration & Login
        'How do I create an account on UNIBOOKS?',
        'How do I register as a buyer?',
        'How do I register as a seller?',
        'Can I change my role from buyer to seller?',
        'How do I login to UNIBOOKS?',
        'I forgot my password, what should I do?',
        'Can I have multiple accounts?',
        'How do I update my profile?',
        'Can a seller also buy books?',
        'How do I logout from UNIBOOKS?',

        # Buying Books
        'How do I buy a book on UNIBOOKS?',
        'How do I search for a book?',
        'Can I filter books by category?',
        'Can I filter books by price?',
        'Can I filter books by condition?',
        'Can I filter books by seller name?',
        'What does the condition New mean?',
        'What does the condition Used mean?',
        'How do I add a book to my cart?',
        'How do I remove a book from my cart?',
        'Can I buy multiple books at once?',
        'How do I place an order?',
        'What information do I need to place an order?',
        'Can I cancel my order?',
        'When can I cancel my order?',
        'How do I track my order?',
        'What does Pending status mean?',
        'What does Shipped status mean?',
        'What does Delivered status mean?',
        'What does Cancelled status mean?',

        # Cart & Checkout
        'How do I view my cart?',
        'How do I increase quantity in cart?',
        'How do I decrease quantity in cart?',
        'What is the Buy It Now button?',
        'What is the difference between Add to Cart and Buy It Now?',
        'How do I proceed to checkout?',
        'What shipping information do I need?',
        'Is shipping free on UNIBOOKS?',
        'How do I enter my delivery address?',
        'Can I change my order after placing it?',

        # Reviews & Ratings
        'How do I review a book?',
        'When can I leave a review?',
        'How is the seller rating calculated?',
        'Can I edit my review?',
        'How many stars can I give?',
        'Where can I see book reviews?',
        'Can I see the seller rating before buying?',
        'What happens if a seller has bad reviews?',
        'Is the review system anonymous?',
        'How do reviews help other buyers?',

        # Selling Books
        'How do I sell a book on UNIBOOKS?',
        'How do I list a new book?',
        'What information do I need to list a book?',
        'How do I upload a book cover image?',
        'Can I list multiple books?',
        'How many books can I list for free?',
        'What happens when I reach 3 books?',
        'How do I edit my book listing?',
        'How do I delete a book?',
        'How do I update my book stock?',
        'How do I update my book price?',
        'How do I manage my sales?',
        'How do I update order status?',
        'What order statuses can I set?',
        'How do I chat with a buyer?',

        # Subscription Plans
        'What are the subscription plans?',
        'How much does the monthly plan cost?',
        'How much does the semi-annual plan cost?',
        'How much does the annual plan cost?',
        'What is the benefit of subscribing?',
        'How do I subscribe to a plan?',
        'How do I pay for a subscription?',
        'How long does subscription activation take?',
        'Can I cancel my subscription?',
        'What happens when my subscription expires?',
        'Which plan gives the best value?',
        'Do subscribed sellers get priority listing?',
        'Which subscribers appear first on homepage?',
        'Can I upgrade my subscription plan?',
        'Where can I see my subscription status?',

        # Reclamations & Complaints
        'How do I report a problem with a seller?',
        'How do I submit a complaint?',
        'What happens after I submit a complaint?',
        'How long does it take to resolve a complaint?',
        'Can I chat with the admin about my complaint?',
        'What are valid reasons to submit a complaint?',
        'Can the seller see my complaint?',
        'What does Resolved status mean for a complaint?',
        'What does Rejected status mean for a complaint?',
        'What does Under Review status mean for a complaint?',

        # Notifications
        'How do I receive notifications?',
        'What kind of notifications will I receive?',
        'How do I mark a notification as read?',
        'Where can I see my notifications?',
        'Will I be notified when my subscription is activated?',
        'Will I be notified about my complaint status?',
        'Will the seller be notified when I place an order?',
        'How often are notifications updated?',
        'Can I turn off notifications?',
        'What happens when I click a notification?',
        
        'What is the price of the monthly plan?',
        'What is the monthly subscription price?',
        'How much is the monthly subscription?',
        'What is the cost of semi annual plan?',
        'How much does annual subscription cost?',
    ],

    'Answers': [
        # General Platform Questions
        'UNIBOOKS is an online marketplace where you can buy and sell books easily.',
        'UNIBOOKS connects buyers and sellers of books. Buyers can browse and purchase books, while sellers can list their books for sale.',
        'UNIBOOKS is free to use for buyers. Sellers can list up to 3 books for free, and need a subscription to list more.',
        'Anyone can use UNIBOOKS. You can register as a buyer to purchase books or as a seller to sell your books.',
        'UNIBOOKS offers books in categories including Fiction, Science, History, Cooking, and Technology.',
        'UNIBOOKS is accessible via web browser on both desktop and mobile devices.',
        'UNIBOOKS supports multiple languages. The chatbot responds in the same language you use.',
        'You can contact UNIBOOKS support at unibooks@support.com.',
        'Yes, your data is safe on UNIBOOKS. We use secure authentication and encrypted connections.',
        'UNIBOOKS currently serves users in Morocco and surrounding regions.',

        # Registration & Login
        'To create an account, click Register in the navigation bar and fill in your details.',
        'To register as a buyer, go to Register, fill in your name, email, password, and select I want to Buy books.',
        'To register as a seller, go to Register, fill in your details, select I want to Sell books, and optionally upload a profile picture.',
        'Currently you cannot change your role after registration. You would need to create a new account.',
        'To login, click Login in the navigation bar and enter your email and password.',
        'If you forgot your password, please contact support at unibooks@support.com for assistance.',
        'Having multiple accounts is not recommended. Each user should have one account.',
        'You can update your profile by going to your account settings.',
        'Yes, a seller can also buy books on UNIBOOKS without needing a separate account.',
        'To logout, click the Logout button in the navigation bar.',

        # Buying Books
        'To buy a book, browse the homepage, click on a book you like, and click Add to Cart or Buy It Now.',
        'You can search for books using the search bar on the homepage. Search by title or seller name.',
        'Yes, you can filter books by category including Fiction, Science, History, Cooking, and Technology.',
        'Yes, you can filter books by minimum and maximum price using the price filter on the homepage.',
        'Yes, you can filter books by condition: New or Used.',
        'Yes, you can search for books by seller name using the seller search filter on the homepage.',
        'New means the book is brand new and has never been read.',
        'Used means the book has been previously read but is still in good condition.',
        'To add a book to your cart, click the Add to Cart button on the book details page.',
        'To remove a book from your cart, go to your cart and click the Remove button next to the book.',
        'Yes, you can add multiple books to your cart and purchase them all at once.',
        'To place an order, go to your cart, click Proceed to Checkout, fill in your shipping details, and confirm.',
        'To place an order you need your phone number and delivery address.',
        'Yes, you can cancel your order but only when it is in Pending status.',
        'You can only cancel an order when its status is Pending. Once shipped, it cannot be cancelled.',
        'You can track your order by going to My Orders in the navigation bar.',
        'Pending means your order has been placed and is waiting for the seller to process it.',
        'Shipped means the seller has sent your book and it is on its way to you.',
        'Delivered means your book has arrived. You can now leave a review.',
        'Cancelled means the order has been cancelled by you or the seller.',

        # Cart & Checkout
        'You can view your cart by clicking Cart in the navigation bar.',
        'To increase quantity, click the + button next to the book in your cart.',
        'To decrease quantity, click the - button next to the book in your cart.',
        'Buy It Now takes you directly to checkout with just that one book, without adding it to your cart first.',
        'Add to Cart adds the book to your cart for later purchase. Buy It Now takes you directly to checkout.',
        'To proceed to checkout, go to your cart and click the Proceed to Checkout button.',
        'You need your phone number and delivery address to complete checkout.',
        'Yes, shipping is free on all orders on UNIBOOKS.',
        'During checkout, you will find a text field where you can enter your full delivery address.',
        'Once an order is placed, you cannot change it. You can only cancel it if it is still Pending.',

        # Reviews & Ratings
        'To review a book, go to My Orders, select a Delivered order, and fill in the star rating and comment.',
        'You can only leave a review after your order status is Delivered.',
        'The seller rating is calculated as the average of all ratings received from buyers.',
        'Currently you cannot edit a review once it has been submitted.',
        'You can give between 1 and 5 stars in a review.',
        'You can see book reviews on the book details page by scrolling down to the Customer Reviews section.',
        'Yes, you can see the seller average rating on the book details page.',
        'Books from sellers with bad reviews will still be listed but buyers can make informed decisions based on ratings.',
        'Reviews show the buyer name but are otherwise visible to all users.',
        'Reviews help other buyers make informed decisions about books and sellers.',

        # Selling Books
        'To sell a book on UNIBOOKS, register as a seller and then click Add Book in the navigation bar.',
        'To list a new book, click Add Book, fill in the title, description, price, category, condition, stock, and upload a cover image.',
        'You need the book title, description, price, category, condition New or Used, stock quantity, and a cover image.',
        'When listing a book, click the upload area and select an image file from your device.',
        'Yes, you can list multiple books. The free plan allows up to 3 books. For more you need a subscription.',
        'You can list up to 3 books for free on UNIBOOKS without any subscription.',
        'When you reach 3 books, you will be prompted to subscribe to a plan to list more books.',
        'To edit a book, go to Seller Dashboard, click My Books, and click the Edit button next to the book.',
        'To delete a book, go to Seller Dashboard, click My Books, and click the Delete button next to the book.',
        'To update stock, go to Seller Dashboard, click My Books, click Edit on the book, and update the Available Stock field.',
        'To update price, go to Seller Dashboard, click My Books, click Edit on the book, and update the Price field.',
        'You can manage your sales by going to Seller Dashboard and clicking My Sales.',
        'To update order status, go to My Sales, find the order, and use the status dropdown to change it.',
        'You can set order status to Pending, Shipped, Delivered, or Cancelled.',
        'You can chat with a buyer by going to My Sales, selecting the order, and using the chat box.',

        # Subscription Plans
        'UNIBOOKS offers three subscription plans: Monthly at 100 MAD, Semi-Annual at 400 MAD, and Annual at 650 MAD.',
        'The monthly subscription plan costs 100 MAD and is valid for 1 month.',
        'The semi-annual subscription plan costs 400 MAD and is valid for 6 months. You save 33% compared to monthly.',
        'The annual subscription plan costs 650 MAD and is valid for 1 year. You save 46% compared to monthly.',
        'Subscribing allows you to list more than 3 books and gives your books priority placement on the homepage.',
        'To subscribe, go to Subscription Plans page, choose a plan, and click the Choose button.',
        'Payment is done by bank transfer or CCP. Upload a photo of your payment receipt and wait for admin verification.',
        'Subscription activation takes up to 24 hours after the admin verifies your payment proof.',
        'Currently subscriptions cannot be cancelled once activated.',
        'When your subscription expires, your books will still be listed but will lose priority placement.',
        'The annual plan at 650 MAD gives the best value with 46% savings compared to monthly.',
        'Yes, subscribed sellers get priority book listing on the homepage.',
        'Annual subscribers appear first, then Semi-Annual subscribers, then Monthly subscribers, then free sellers.',
        'Yes, you can upgrade by subscribing to a higher plan before your current one expires.',
        'You can see your subscription status in Seller Dashboard under the Subscription section.',

        # Reclamations & Complaints
        'To report a problem, go to My Orders, select the order, and click Report an Issue to Admin.',
        'To submit a complaint, go to My Orders, click Report an Issue, select a reason, describe the problem, and click Send to Admin.',
        'After submitting a complaint, the admin will review it and contact both you and the seller.',
        'Complaint resolution time varies. The admin will update the status as they review your case.',
        'Yes, you can chat with the admin about your complaint in the order chat section.',
        'Valid reasons include: not receiving the book, book different from description, or seller is unresponsive.',
        'Yes, the seller can see the complaint and participate in the investigation chat.',
        'Resolved means the admin has reviewed your complaint and it has been settled.',
        'Rejected means the admin reviewed your complaint and determined it was not valid.',
        'Under Review means the admin is currently investigating your complaint.',

        # Notifications
        'Notifications are sent automatically when there are updates to your orders, complaints, or subscriptions.',
        'You will receive notifications about order status changes, complaint updates, and subscription activation.',
        'To mark a notification as read, click on it in the notification dropdown.',
        'You can see your notifications by clicking the bell icon in the navigation bar.',
        'Yes, you will receive a notification when the admin activates your subscription.',
        'Yes, you will receive notifications when the status of your complaint changes.',
        'Yes, the seller receives a notification when you place an order.',
        'Notifications are updated every 5 seconds automatically.',
        'Currently you cannot turn off notifications on UNIBOOKS.',
        'When you click a notification, you will be taken directly to the relevant page.',
        
        'The monthly subscription plan costs 100 MAD and is valid for 1 month.',
        'The monthly subscription plan costs 100 MAD and is valid for 1 month.',
        'The monthly subscription costs 100 MAD per month.',
        'The semi-annual subscription costs 400 MAD and is valid for 6 months.',
        'The annual subscription costs 650 MAD and is valid for 1 year.',
    ]
}

df = pd.DataFrame(my_dataset)
print(f"Dataset created with {len(df)} questions and answers!")
print(df)

# ===== Preprocessing =====
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    text = re.sub(r'[^a-zA-Z\s]', '', str(text).lower())
    tokens = word_tokenize(text)
    clean_tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(clean_tokens)

df['Cleaned_Questions'] = df['Questions'].apply(preprocess_text)
print("\nText preprocessing done!")

# ===== TF-IDF Model =====
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(df['Cleaned_Questions'])
print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")

# ===== Save Model =====
import pickle
with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

df.to_pickle("chatbot_data.pkl")
print("Model and data saved successfully!")

# ===== Chatbot Response Function =====
def chatbot_response(question):
    print(f"User question: '{question}'\n")
    
    cleaned_question = preprocess_text(question)
    print(f"Cleaned question: '{cleaned_question}'\n")
    
    user_vector = vectorizer.transform([cleaned_question])
    similarities = cosine_similarity(user_vector, tfidf_matrix)[0]
    
    best_match_index = np.argmax(similarities)
    similarity_percentage = similarities[best_match_index] * 100
    
    print(f"Best match similarity: {similarity_percentage:.2f}%\n")
    
    if similarity_percentage > 30:
        best_response = df['Answers'].iloc[best_match_index]
        matched_question = df['Questions'].iloc[best_match_index]
        print(f"Matched question: '{matched_question}'\n")
        print(f"Chatbot Response: '{best_response}'\n")
        return best_response
    else:
        response = "I'm sorry, I can only help with questions related to books and the UNIBOOKS platform. Could you rephrase your question? 📚"
        print(f"Chatbot Response: '{response}'\n")
        return response

# ===== Flask API =====
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_question = data.get('question', '')
        
        if not user_question:
            return jsonify({'error': 'No question provided'}), 400
        
        cleaned_question = preprocess_text(user_question)
        user_vector = vectorizer.transform([cleaned_question])
        similarities = cosine_similarity(user_vector, tfidf_matrix)[0]
        
        best_match_index = np.argmax(similarities)
        similarity_percentage = similarities[best_match_index] * 100
        
        if similarity_percentage > 30:
            best_response = df['Answers'].iloc[best_match_index]
            return jsonify({
                'response': best_response,
                'similarity': round(similarity_percentage, 2),
                'matched_question': df['Questions'].iloc[best_match_index]
            })
        else:
            return jsonify({
                'response': "I'm sorry, I can only help with questions related to books and the UNIBOOKS platform. Could you rephrase your question? 📚",
                'similarity': 0
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI chatbot is running!'})

if __name__ == '__main__':
    print("\n🤖 UniBot AI Server is starting...")
    print("🚀 Running on http://localhost:5001/api/chat")
    app.run(host='0.0.0.0', port=5001, debug=False)

# ===== Test =====
print("\n" + "="*50)
print("TESTING CHATBOT")
print("="*50 + "\n")

chatbot_response("How do I buy a book?")
print("-"*50)
chatbot_response("What is the price of monthly subscription?")
print("-"*50)
chatbot_response("How do I report a problem?")
print("-"*50)
chatbot_response("What is machine learning?")