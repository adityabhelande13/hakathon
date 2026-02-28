"""
Orchestrator Agent — The main entry point for chat messages.
Routes to the appropriate sub-agent based on intent detection.
Supports multilingual responses (English, Hindi, Marathi).
"""
from agents.conversational import extract_order_intent
from agents.safety import validate_order
from agents.tools import place_order, trigger_fulfillment, send_notification

# ── Multilingual response templates ──────────────────────

RESPONSES = {
    "en": {
        "greeting": "Hello! 👋 I'm your AI Pharmacist. I can help you order medicines, check your prescriptions, or refill your regular medications. What do you need today?",
        "help": "I can help you with:\n• **Order medicines** — just tell me what you need\n• **Refill prescriptions** — I'll remember your regular medications\n• **Check drug safety** — I verify prescriptions and allergies\n• **Track orders** — see your order history\n\nTry saying something like \"I need paracetamol\" or \"refill my diabetes medicine\".",
        "confirm": "✅ Your order has been confirmed! The pharmacy will process it shortly. You'll receive a confirmation notification.\n\n📦 Estimated delivery: 30–60 minutes",
        "not_found": "I couldn't find a specific medicine in your message. Could you tell me the name of the medicine you need? For example: \"I need Dolo 650\" or \"something for headache\".",
        "safety_alert": "⚠️ {}",
        "found_single": "I found **{}** for you. {}The total would be **₹{:.2f}**. Would you like to confirm the order?",
        "found_multi": "I found the following medicines for you: {}. Total: **₹{:.2f}**. Would you like to confirm?",
        "rx_on_file": "✅ Your prescription is on file. ",
        "rejected_note": "\n\n⚠️ Note: {} could not be added — {}",
    },
    "hi": {
        "greeting": "नमस्ते! 👋 मैं आपका AI फार्मासिस्ट हूँ। मैं आपको दवाइयाँ ऑर्डर करने, प्रिस्क्रिप्शन चेक करने, या नियमित दवाइयाँ रिफ़िल करने में मदद कर सकता हूँ। आज आपको क्या चाहिए?",
        "help": "मैं आपकी इन चीज़ों में मदद कर सकता हूँ:\n• **दवाइयाँ ऑर्डर करें** — बस बताइए आपको क्या चाहिए\n• **प्रिस्क्रिप्शन रिफ़िल** — मैं आपकी नियमित दवाइयाँ याद रखूँगा\n• **दवा सुरक्षा जाँच** — मैं प्रिस्क्रिप्शन और एलर्जी जाँचता हूँ\n• **ऑर्डर ट्रैक करें** — अपना ऑर्डर इतिहास देखें\n\nजैसे: \"मुझे पेरासिटामोल चाहिए\" या \"मेरी डायबिटीज की दवा रिफ़िल करो\"।",
        "confirm": "✅ आपका ऑर्डर कन्फ़र्म हो गया है! फार्मेसी शीघ्र ही इसे प्रोसेस करेगी। आपको कन्फ़र्मेशन नोटिफ़िकेशन मिलेगा।\n\n📦 अनुमानित डिलीवरी: 30–60 मिनट",
        "not_found": "मुझे आपके मैसेज में कोई दवाई नहीं मिली। कृपया दवाई का नाम बताइए। जैसे: \"मुझे Dolo 650 चाहिए\" या \"सिरदर्द के लिए कुछ दो\"।",
        "safety_alert": "⚠️ {}",
        "found_single": "मुझे **{}** मिली। {}कुल राशि **₹{:.2f}** होगी। क्या आप ऑर्डर कन्फ़र्म करना चाहते हैं?",
        "found_multi": "मुझे ये दवाइयाँ मिलीं: {}। कुल: **₹{:.2f}**। क्या आप कन्फ़र्म करना चाहते हैं?",
        "rx_on_file": "✅ आपका प्रिस्क्रिप्शन फाइल में है। ",
        "rejected_note": "\n\n⚠️ ध्यान दें: {} नहीं जोड़ा जा सका — {}",
    },
    "mr": {
        "greeting": "नमस्कार! 👋 मी तुमचा AI फार्मासिस्ट आहे. मी तुम्हाला औषधे ऑर्डर करण्यात, प्रिस्क्रिप्शन तपासण्यात किंवा नियमित औषधे रिफिल करण्यात मदत करू शकतो. आज तुम्हाला काय हवे आहे?",
        "help": "मी तुम्हाला या गोष्टींमध्ये मदत करू शकतो:\n• **औषधे ऑर्डर करा** — फक्त सांगा काय हवे आहे\n• **प्रिस्क्रिप्शन रिफिल** — मी तुमची नियमित औषधे लक्षात ठेवतो\n• **औषध सुरक्षितता तपासणी** — मी प्रिस्क्रिप्शन आणि अॅलर्जी तपासतो\n• **ऑर्डर ट्रॅक करा** — तुमचा ऑर्डर इतिहास पहा\n\nउदा: \"मला पॅरासिटामॉल हवे\" किंवा \"माझ्या डायबिटीजचे औषध रिफिल करा\".",
        "confirm": "✅ तुमचा ऑर्डर कन्फर्म झाला आहे! फार्मसी लवकरच प्रक्रिया करेल. तुम्हाला कन्फर्मेशन सूचना मिळेल.\n\n📦 अंदाजे डिलिव्हरी: 30–60 मिनिटे",
        "not_found": "मला तुमच्या संदेशात कोणतेही विशिष्ट औषध सापडले नाही. कृपया औषधाचे नाव सांगा. उदा: \"मला Dolo 650 हवे\" किंवा \"डोकेदुखीसाठी काहीतरी द्या\".",
        "safety_alert": "⚠️ {}",
        "found_single": "मला **{}** सापडले. {}एकूण रक्कम **₹{:.2f}** असेल. तुम्ही ऑर्डर कन्फर्म करू इच्छिता?",
        "found_multi": "मला ही औषधे सापडली: {}. एकूण: **₹{:.2f}**. तुम्ही कन्फर्म करू इच्छिता?",
        "rx_on_file": "✅ तुमचे प्रिस्क्रिप्शन फाइलमध्ये आहे. ",
        "rejected_note": "\n\n⚠️ लक्षात ठेवा: {} जोडता आले नाही — {}",
    },
}

# Keywords for intent detection (multilingual)
GREETINGS_ALL = [
    "hello", "hi", "hey", "good morning", "good evening", "howdy",
    "नमस्ते", "नमस्कार", "हेलो", "हाय",
]
HELP_KEYWORDS = [
    "help", "what can you do", "what do you do", "how does this work",
    "मदद", "सहायता", "काय करता", "काय करू शकतो",
]
CONFIRM_KEYWORDS = [
    "confirm", "yes", "place order", "order it", "go ahead", "proceed",
    "हाँ", "हां", "कन्फ़र्म", "ऑर्डर करो", "हो", "होय",
]


def process_message(patient_id: str, message: str, language: str = "en") -> dict:
    """
    Process a user's chat message through the full agent pipeline.
    Supports multilingual responses via the `language` parameter ('en', 'hi', 'mr').
    """
    message_lower = message.lower()
    lang = language if language in RESPONSES else "en"
    t = RESPONSES[lang]

    # ── Intent: Greeting ──
    if any(g == message_lower.strip().rstrip("!.") for g in GREETINGS_ALL):
        return {"reply": t["greeting"], "card_data": None}

    # ── Intent: Help ──
    if any(kw in message_lower for kw in HELP_KEYWORDS):
        return {"reply": t["help"], "card_data": None}

    # ── Intent: Confirm ──
    if any(kw in message_lower for kw in CONFIRM_KEYWORDS):
        return {
            "reply": t["confirm"],
            "card_data": {
                "type": "order_status",
                "status": "confirmed",
                "message": "Order placed successfully",
            },
        }

    # ── Intent: Order medicine ──
    items = extract_order_intent(message)

    if not items:
        return {"reply": t["not_found"], "card_data": None}

    # Safety validation
    validation = validate_order(patient_id, items)

    if not validation["approved"]:
        return {
            "reply": t["safety_alert"].format(validation["message"]),
            "card_data": {
                "type": "safety_alert",
                "message": validation["message"],
                "rejected_items": validation.get("rejected", []),
            },
        }

    # Build confirmation card
    first_item = validation["items"][0]
    total = sum(i["price"] * i.get("qty", 1) for i in validation["items"])

    if len(validation["items"]) == 1:
        rx_msg = t["rx_on_file"] if first_item.get("prescription_required") else ""
        reply = t["found_single"].format(
            first_item["product_name"],
            rx_msg,
            first_item["price"] * first_item.get("qty", 1),
        )
    else:
        item_list = ", ".join([f"{i['product_name']} (₹{i['price']})" for i in validation["items"]])
        reply = t["found_multi"].format(item_list, total)

    card_data = {
        "type": "order_confirmation",
        "product_name": first_item["product_name"],
        "price": first_item["price"],
        "product_id": first_item["product_id"],
        "quantity": first_item.get("qty", 1),
        "total": total,
        "items": validation["items"],
    }

    if validation.get("rejected"):
        rejected_names = ", ".join([r["product_name"] for r in validation["rejected"]])
        reply += t["rejected_note"].format(rejected_names, validation["rejected"][0]["reason"])

    return {"reply": reply, "card_data": card_data}
