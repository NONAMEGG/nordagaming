import logging
import requests
from telegram import Update, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ConversationHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

BASE_URL = "http://localhost:3001/api"

ASK_EMAIL, ASK_PASSWORD = range(2)
SESSIONS = {}

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        ["/login", "/logout"],
        ["/leaders", "/points", "/transactions"]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await update.message.reply_text(
        "Привет!\nВыберите команду:",
        reply_markup=reply_markup
    )

# ========== Логин ==========
async def login_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Введите ваш email:")
    return ASK_EMAIL

async def ask_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["email"] = update.message.text.strip()
    await update.message.reply_text("Теперь — пароль:")
    return ASK_PASSWORD

async def do_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    email = context.user_data.get("email")
    password = update.message.text.strip()
    try:
        resp = requests.post(
            f"{BASE_URL}/user/login",
            json={"email": email, "password": password},
            timeout=5
        )
        resp.raise_for_status()
        user = resp.json()

        SESSIONS[chat_id] = {
            'id': user['id'],
            'email': user['email'],
            'total_score': user.get('total_score', 0)
        }

        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Мои очки", callback_data="points")],
            [InlineKeyboardButton("Топ игроков", callback_data="leaders")]
        ])

        await update.message.reply_text(
            f"✅ Успешный вход: {user.get('name')}\n"
            f"💰 Ваши очки: {user.get('total_score', 0)}",
        )
    except requests.HTTPError as e:
        err = e.response.text
        await update.message.reply_text(f"Ошибка авторизации: {err}")
    except Exception as e:
        await update.message.reply_text(f"Сетевая ошибка: {e}")

# ========== Выход из аккаунта ==========
async def logout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    if chat_id in SESSIONS:
        del SESSIONS[chat_id]
        await update.message.reply_text("Вы вышли из аккаунта.")
    else:
        await update.message.reply_text("Вы не авторизованы.")

# ========== Лидерборд ==========
async def leaders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat.id not in SESSIONS:
        await update.message.reply_text("Сначала выполните /login")
        return

    try:
        resp = requests.get(
            f"{BASE_URL}/records",
            params={"limit": 10, "page": 1},
            timeout=5
        )
        resp.raise_for_status()
        data = resp.json()
        recs = data.get('records', [])
        recs = sorted(
            recs,
            key=lambda r: r.get('total_score', r.get('score', 0)),
            reverse=True
)
        if not recs:
            await update.message.reply_text("Пока нет записей.")
            return

        text = "🏆 Топ-10:\n"
        for i, r in enumerate(recs, 1):
            name = r.get("name") or f"User {r['id']}"
            text += f"{i}. {name}: {r['total_score']}\n"
        await update.message.reply_text(text)
    except Exception as e:
        await update.message.reply_text(f"Ошибка при получении лидеров: {e}")

# ========== Ваши очки ==========
async def points(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    session = SESSIONS.get(chat_id)
    if not session:
        await update.message.reply_text("Сначала выполните /login")
        return

    user_id = session['id']
    try:
        resp = requests.get(
            f"{BASE_URL}/records/{user_id}",
            timeout=5
        )
        resp.raise_for_status()
        data = resp.json()
        record_data = data.get('record')
        # record_data может быть списком или dict
        if isinstance(record_data, list) and record_data:
            record = record_data[0]
        elif isinstance(record_data, dict):
            record = record_data
        else:
            record = {}

        total = record.get('total_score', session.get('total_score', 0))
        await update.message.reply_text(f"🎯 Ваши очки: {total}")
    except Exception as e:
        await update.message.reply_text(f"Ошибка при получении ваших очков: {e}")

async def transactions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    session = SESSIONS.get(chat_id)
    if not session:
        await update.message.reply_text("Сначала выполните /login")
        return
    user_id = session['id']
    try:
        resp = requests.get(f"{BASE_URL}/transaction/{user_id}", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        txs = data.get('data', [])
        if not txs:
            await update.message.reply_text("У вас нет транзакций.")
            return
        text = "💼 Ваши транзакции:\n\n"
        for tx in txs:
            ttype = tx.get('type', '?')
            amt = tx.get('amount', 0)
            created = tx.get('created_at', '')
            text += f"• [{created}] {ttype}: {amt}\n"
        await update.message.reply_text(text)
    except Exception as e:
        await update.message.reply_text(f"Ошибка при получении транзакций: {e}")
async def handle_error(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logging.error(f"Ошибка: {context.error}")
    await update.message.reply_text("Произошла ошибка. Попробуйте еще раз позже.")

def main():
    app = ApplicationBuilder().token("7578873168:AAEdWdH7Y252Tz4kwW_3_nbUVh0o4ArBiXY").build()

    conv = ConversationHandler(
        entry_points=[CommandHandler("login", login_command)],
        states={
            ASK_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_password)],
            ASK_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, do_login)],
        },
        fallbacks=[]
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(conv)
    app.add_handler(CommandHandler("logout", logout))
    app.add_handler(CommandHandler("leaders", leaders))
    app.add_handler(CommandHandler("points", points))
    app.add_handler(CommandHandler("transactions", transactions))
    app.add_error_handler(handle_error)

    app.run_polling()
if __name__ == "__main__":
    main()