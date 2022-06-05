const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const changePhotoScene = new BaseScene('changePhotoScene');
changePhotoScene.enter(async (ctx) => {
    ctx.replyWithMarkdown(`Отправьте мне фотографию.`, back_to_admin_keyboard);
});

changePhotoScene.on('photo', async (ctx) => {
    const file_id = ctx.message.photo[0].file_id;
    const buttons = await $button.findOne({ main: ctx.scene.state.main });
    await buttons.set("photo", file_id);
    return ctx.replyWithHTML(`<b>Успешно обновлено фотография в разделе «${ctx.scene.state.main}».</b>\n\nВы можете загрузить новую, либо вернутся в админ-панель.`)
});

module.exports = {
    changePhotoScene
}