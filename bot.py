import os
import re
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from dotenv import load_dotenv

load_dotenv()
bot = Bot(token=os.getenv("BOT_TOKEN"))
dp = Dispatcher()

# --- Заглушки данных ---
STUB_DATA = {
    "auth_users": {
        "test@example.com": {"password": "123", "balance": 1000, "game_id": "123", "best_score": 0}
    },
    "sessions": {},  # telegram_id: email
    "bets": [
        {"id": 1, "game_id": "123", "amount": 100, "status": "Выигрыш"},
        {"id": 2, "game_id": "123", "amount": 50, "status": "Проигрыш"}
    ],
    "leaderboard": [
        {"username": "Player1", "score": 5000},
        {"username": "Player2", "score": 4000}
    ]
}

# --- Состояния FSM ---
class AuthStates(StatesGroup):
    waiting_for_email = State()
    waiting_for_password = State()

class MenuStates(StatesGroup):
    in_wallet = State()
    in_bets = State()
    waiting_for_bet_amount = State()
    waiting_for_deposit = State()

# --- Клавиатуры ---
def get_main_menu(user_id: int = None):
    buttons = [
        [KeyboardButton(text="💰 Кошелёк"), KeyboardButton(text="🎲 Ставки")],
        [KeyboardButton(text="🏆 Таблица лидеров"), KeyboardButton(text="📊 Моя статистика")]
    ]
    
    if user_id and user_id in STUB_DATA["sessions"]:
        buttons.append([KeyboardButton(text="🚪 Выйти")])
    else:
        buttons.append([KeyboardButton(text="🔐 Войти")])
    
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)

def get_wallet_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="История"), KeyboardButton(text="Пополнить")],
            [KeyboardButton(text="🔙 Назад")]
        ],
        resize_keyboard=True
    )

def get_bets_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Создать ставку"), KeyboardButton(text="Мои ставки")],
            [KeyboardButton(text="🔙 Назад")]
        ],
        resize_keyboard=True
    )

# --- Проверка авторизации ---
def check_auth(func):
    async def wrapper(message: types.Message, *args, **kwargs):
        if message.from_user.id not in STUB_DATA["sessions"]:
            await message.answer("❌ Сначала авторизуйтесь через /login!", reply_markup=get_main_menu())
            return
        return await func(message, *args, **kwargs)
    return wrapper

# --- Команда /start ---
@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer(
        "🏃 Добро пожаловать в RunnerBot!",
        reply_markup=get_main_menu(message.from_user.id)
    )

# --- Авторизация ---
@dp.message(Command("login"))
@dp.message(F.text == "🔐 Войти")
async def start_auth(message: types.Message, state: FSMContext):
    await message.answer("📧 Введите ваш email:", reply_markup=types.ReplyKeyboardRemove())
    await state.set_state(AuthStates.waiting_for_email)

@dp.message(AuthStates.waiting_for_email)
async def process_email(message: types.Message, state: FSMContext):
    email = message.text.lower()
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        await message.answer("❌ Неверный формат email! Попробуйте снова:")
        return
        
    if email not in STUB_DATA["auth_users"]:
        await message.answer("❌ Пользователь не найден!", reply_markup=get_main_menu())
        await state.clear()
        return
        
    await state.update_data(email=email)
    await message.answer("🔑 Введите пароль:")
    await state.set_state(AuthStates.waiting_for_password)

@dp.message(AuthStates.waiting_for_password)
async def process_password(message: types.Message, state: FSMContext):
    data = await state.get_data()
    email = data["email"]
    
    if message.text != STUB_DATA["auth_users"][email]["password"]:
        await message.answer("❌ Неверный пароль! Попробуйте снова:")
        return
        
    STUB_DATA["sessions"][message.from_user.id] = email
    await message.answer(
        f"✅ Успешная авторизация! Добро пожаловать, {email}",
        reply_markup=get_main_menu(message.from_user.id)
    )
    await state.clear()

# --- Выход ---
@dp.message(F.text == "🚪 Выйти")
async def logout(message: types.Message):
    if message.from_user.id in STUB_DATA["sessions"]:
        del STUB_DATA["sessions"][message.from_user.id]
    await message.answer("✅ Вы вышли из системы", reply_markup=get_main_menu())

# --- Кошелёк ---
@dp.message(Command("wallet"))
@dp.message(F.text == "💰 Кошелёк")
@check_auth
async def wallet(message: types.Message, state: FSMContext):
    email = STUB_DATA["sessions"][message.from_user.id]
    balance = STUB_DATA["auth_users"][email]["balance"]
    await message.answer(
        f"💼 Ваш кошелёк\n"
        f"Баланс: {balance} токенов\n"
        f"Игровой ID: {STUB_DATA['auth_users'][email]['game_id']}",
        reply_markup=get_wallet_menu()
    )
    await state.set_state(MenuStates.in_wallet)

# --- Пополнение баланса ---
@dp.message(F.text == "Пополнить")
@check_auth
async def deposit(message: types.Message, state: FSMContext):
    await message.answer("💵 Введите сумму для пополнения:", reply_markup=types.ReplyKeyboardRemove())
    await state.set_state(MenuStates.waiting_for_deposit)

@dp.message(MenuStates.waiting_for_deposit)
@check_auth
async def process_deposit(message: types.Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("❌ Введите число!", reply_markup=get_wallet_menu())
        return
        
    amount = int(message.text)
    email = STUB_DATA["sessions"][message.from_user.id]
    STUB_DATA["auth_users"][email]["balance"] += amount
    
    await message.answer(
        f"✅ Баланс пополнен на {amount} токенов!\n"
        f"💰 Текущий баланс: {STUB_DATA['auth_users'][email]['balance']}",
        reply_markup=get_main_menu(message.from_user.id)
    )
    await state.clear()

# --- Ставки ---
@dp.message(Command("bets"))
@dp.message(F.text == "🎲 Ставки")
@check_auth
async def bets_menu(message: types.Message, state: FSMContext):
    await message.answer(
        "🎲 Раздел ставок",
        reply_markup=get_bets_menu()
    )
    await state.set_state(MenuStates.in_bets)

@dp.message(F.text == "Создать ставку")
@check_auth
async def create_bet(message: types.Message, state: FSMContext):
    email = STUB_DATA["sessions"][message.from_user.id]
    balance = STUB_DATA["auth_users"][email]["balance"]
    await message.answer(
        f"💰 Ваш баланс: {balance} токенов\n"
        "Введите сумму ставки:",
        reply_markup=types.ReplyKeyboardRemove()
    )
    await state.set_state(MenuStates.waiting_for_bet_amount)

@dp.message(MenuStates.waiting_for_bet_amount)
@check_auth
async def process_bet(message: types.Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("❌ Введите число!", reply_markup=get_bets_menu())
        return
        
    amount = int(message.text)
    email = STUB_DATA["sessions"][message.from_user.id]
    
    if amount > STUB_DATA["auth_users"][email]["balance"]:
        await message.answer("❌ Недостаточно средств!", reply_markup=get_bets_menu())
        return
        
    STUB_DATA["auth_users"][email]["balance"] -= amount
    bet_id = len(STUB_DATA["bets"]) + 1
    STUB_DATA["bets"].append({
        "id": bet_id,
        "game_id": STUB_DATA["auth_users"][email]["game_id"],
        "amount": amount,
        "status": "В процессе"
    })
    
    await message.answer(
        f"✅ Ставка на {amount} токенов создана!\n"
        f"💰 Остаток: {STUB_DATA['auth_users'][email]['balance']}",
        reply_markup=get_main_menu(message.from_user.id)
    )
    await state.clear()

# --- Таблица лидеров ---
@dp.message(Command("leaderboard"))
@dp.message(F.text == "🏆 Таблица лидеров")
async def leaderboard(message: types.Message):
    leaderboard_text = "🏆 Топ игроков:\n"
    for i, player in enumerate(STUB_DATA["leaderboard"], 1):
        leaderboard_text += f"{i}. {player['username']} - {player['score']}\n"
    await message.answer(leaderboard_text)

# --- Статистика ---
@dp.message(Command("stats"))
@dp.message(F.text == "📊 Моя статистика")
@check_auth
async def stats(message: types.Message):
    email = STUB_DATA["sessions"][message.from_user.id]
    user_data = STUB_DATA["auth_users"][email]
    bets = [bet for bet in STUB_DATA["bets"] if bet["game_id"] == user_data["game_id"]]
    
    await message.answer(
        f"📊 Ваша статистика:\n"
        f"• Токены: {user_data['balance']}\n"
        f"• Рекорд: {user_data['best_score']} м\n"
        f"• Ставок: {len(bets)}\n"
        f"• Активные ставки: {len([b for b in bets if b['status'] == 'В процессе'])}",
        reply_markup=get_main_menu(message.from_user.id)
    )

# --- Назад ---
@dp.message(F.text == "🔙 Назад")
async def back(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("Главное меню:", reply_markup=get_main_menu(message.from_user.id))

# --- Запуск ---
async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())