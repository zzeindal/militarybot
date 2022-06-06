const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { checkButton } = require('../helpers/utils.js');
const { $button } = require('../config/connectMongoose.js');

const addButtonScene = new BaseScene('addButtonScene');
addButtonScene.enter(async (ctx) => {
    ctx.replyWithMarkdown(`Укажите название кнопки, которое нужно добавить.`, back_to_admin_keyboard);
});

addButtonScene.on('text', async (ctx) => {
    if (ctx.message.text.length > 30) return ctx.replyWithHTML(`<b>Максимальное количество символов: 30</b>`)
    const result = await checkButton(ctx.message.text);
    if (result) return ctx.replyWithHTML(`Уже присутствует <b>кнопка</b> с таким названием.`);
    
    const buttons = await $button.findOne({ main: ctx.scene.state.main });
    buttons.others.push(ctx.message.text);
    await buttons.save();
    return ctx.replyWithHTML(`<b>Успешно добавлено в раздел «${ctx.scene.state.main}».</b>\n\nВы можете добавить ещё кнопки, либо вернутся в админ-панель.`)
});

module.exports = {
    addButtonScene
}