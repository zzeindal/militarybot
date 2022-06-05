const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const changeTextScene = new BaseScene('changeTextScene');
changeTextScene.enter(async (ctx) => {
    ctx.replyWithMarkdown(`Отправьте новое описание.`, back_to_admin_keyboard);
});

changeTextScene.on('text', async (ctx) => {
    const buttons = await $button.findOne({ main: ctx.scene.state.main });
    buttons.others[0] = ctx.message.text;
    await buttons.save();

    return ctx.replyWithHTML(`<b>Успешно обновлено описание в разделе «${ctx.scene.state.main}».</b>\n\nВы можете обновить на новый текст, либо вернутся в админ-панель.`)
});

module.exports = {
    changeTextScene
}