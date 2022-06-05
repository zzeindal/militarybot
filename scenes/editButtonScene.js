const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const editButtonScene = new BaseScene('editButtonScene');
editButtonScene.enter(async (ctx) => {
    ctx.replyWithHTML(`Отправьте новое название кнопки.\n\nТекущее: <b>${ctx.scene.state.main}</b>`, back_to_admin_keyboard);
});

editButtonScene.on('text', async (ctx) => {
    const checkButtons = await $button.findOne({ main: ctx.message.text })
    if(checkButtons) return ctx.replyWithHTML(`Уже существует <b>кнопка</b> с таким названием.`)

    const buttons = await $button.findOne({ main: ctx.scene.state.main });
    await buttons.set("main", ctx.message.text);

    return ctx.replyWithHTML(`<b>Успешно обновлено название кнопки «${ctx.scene.state.main}» на «${ctx.message.text}».</b>\n\nВы можете обновить на новый текст, либо вернутся в админ-панель.`)
});

module.exports = {
    editButtonScene
}