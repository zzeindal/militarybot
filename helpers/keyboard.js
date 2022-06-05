const { Keyboard, Key } = require('telegram-keyboard')

const start_keyboard = Keyboard.make([
    Key.callback('Произвести оплату', 'buy'),
    Key.callback('Перейти в справочник', 'go_to_info')
], { columns: 1 }).inline();

const buy_keyboard = Keyboard.make([
    Key.callback('1 месяц', 'buy 1'),
    Key.callback('6 месяцев', 'buy 2'),
    Key.callback('1 год', 'buy 3'),
    Key.callback('🔙 Назад', 'firstPage')
], { columns: 1 }).inline();

const info_keyboard = Keyboard.make([
    Key.callback('Нормативно-правовые акты', 'info 1'),
    Key.callback('Образцы форм, рапортов, заявлений', 'info 2'),
    Key.callback('Военные ВУЗы', 'info 3'),
    Key.callback('Список военкоматов', 'info 4'),
], { columns: 1 }).inline();

const back_to_admin_keyboard = Keyboard.make(['Вернутся в админ-панель']).reply();

const admin_keyboard = Keyboard.make([
    'Изменить кнопки',
    'Изменить файлы',
    'Изменить военные ВУЗы',
    'Изменить военкоматы'
], { pattern: [2, 1, 1] }).reply();

const change_keyboard = Keyboard.make([
    '«Нормативно-правовые акты»',
    '«Образцы форм, рапортов, заявлений»',
    '«Военные ВУЗы»',
    '«Список военкоматов»',
    '⏪ Вернутся в админ-панель'
], { columns: 1 }).reply();

const change_keyboard_2 = Keyboard.make([
    '-> «Нормативно-правовые акты»',
    '-> «Образцы форм, рапортов, заявлений»',
    '⏪ Вернутся в админ-панель'
], { columns: 1 }).reply();

module.exports = {
    start_keyboard,
    buy_keyboard,
    info_keyboard,
    back_to_admin_keyboard,
    admin_keyboard,
    change_keyboard,
    change_keyboard_2
}