const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const addDocumentScene = new BaseScene('addDocumentScene');
addDocumentScene.enter(async (ctx) => {
    ctx.replyWithMarkdown(`Отправьте мне документ.`, back_to_admin_keyboard);
});

addDocumentScene.on('document', async (ctx) => {
    const file_id = ctx.message.document.file_id;
    const buttons = await $button.findOne({ main: ctx.scene.state.main });
    buttons.others.push(`file::${file_id}`);
    await buttons.save();
    return ctx.replyWithHTML(`<b>Успешно добавлено в раздел «${ctx.scene.state.main}».</b>\n\nВы можете добавить ещё документ, либо вернутся в админ-панель.`)
});

module.exports = {
    addDocumentScene
}