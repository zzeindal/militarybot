const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const addDocumentScene = new BaseScene('addDocumentScene');
addDocumentScene.enter(async (ctx) => {
    ctx.session.main = ctx.scene.state.main;

    ctx.replyWithMarkdown(`Укажите название документа.`, back_to_admin_keyboard);
});

addDocumentScene.on('text', async (ctx) => {
    ctx.session.nameFile = ctx.message.text;
    return ctx.scene.enter("addDocumentScene2")
});

const addDocumentScene2 = new BaseScene('addDocumentScene2');
addDocumentScene2.enter(async (ctx) => {
    ctx.replyWithMarkdown(`Отправьте мне документ.`, back_to_admin_keyboard);
});

addDocumentScene2.on('document', async (ctx) => {
    const file_id = ctx.message.document.file_id;
    const buttons = await $button.findOne({ main: ctx.session.main });
    buttons.others.push(`file::${file_id}::${ctx.session.nameFile}`);
    await buttons.save();
    await ctx.replyWithHTML(`<b>Успешно добавлено в раздел «${ctx.session.main}».</b>\n\nВы можете добавить ещё документ, либо вернутся в админ-панель.`)
    return ctx.scene.enter("addDocumentScene", { main: ctx.session.main });
});

module.exports = {
    addDocumentScene,
    addDocumentScene2
}