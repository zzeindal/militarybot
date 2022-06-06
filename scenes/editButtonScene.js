const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');
const { checkButton } = require('../helpers/utils.js');

const editButtonScene = new BaseScene('editButtonScene');
editButtonScene.enter(async (ctx) => {
    ctx.replyWithHTML(`Отправьте новое название кнопки.\n\nТекущее: <b>${ctx.scene.state.main}</b>`, back_to_admin_keyboard);
});

editButtonScene.on('text', async (ctx) => {
    const result = await checkButton(ctx.message.text);
    if (result) return ctx.replyWithHTML(`Уже существует <b>кнопка</b> с таким названием.`)
    if (ctx.message.text.length > 30) return ctx.replyWithHTML(`Максимальное количество символов: <b>30</b.`)
    var buttons = await $button.findOne({ main: ctx.scene.state.main });
    const allButtons = await $button.find();
    for (var i = allButtons.length - 1; i >= 0; i--) {
        for (var j = allButtons[i].others.length - 1; j >= 0; j--) {
            if (allButtons[i].others[j] === ctx.scene.state.main) {
                allButtons[i].others[j] = ctx.message.text;
                await allButtons[i].save();
                break;
            }
        }
    }
    try {
        await buttons.set("main", ctx.message.text);
    } catch (err) {}
    return ctx.replyWithHTML(`<b>Успешно обновлено название кнопки «${ctx.scene.state.main}» на «${ctx.message.text}».</b>\n\nВы можете обновить на новый текст, либо вернутся в админ-панель.`)
});

module.exports = {
    editButtonScene
}