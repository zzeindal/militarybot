const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $military } = require('../config/connectMongoose.js');

const deleteMilitaryScene = new BaseScene('deleteMilitaryScene');
deleteMilitaryScene.enter(async (ctx) => {
    ctx.replyWithHTML(`Укажите <b>область</b> военкомата`, back_to_admin_keyboard);
});

deleteMilitaryScene.on('text', async (ctx) => {
    if (ctx.message.text.length > 25) return ctx.replyWithHTML(`<b>Максимальное количество символов: 25</b>`)
    if (ctx.message.text.includes(['.', ',', '/'])) return ctx.replyWithHTML(`В тексте <b>найдены символы.</b>`)
    const military = await $military.findOne({ region: ctx.scene.state.region, city: ctx.message.text });
    if (!military) return ctx.replyWithHTML(`Военкомат <b>не найден.</b>`);
    await military.remove();
    await ctx.replyWithHTML(`<b>Успешно убрано из раздела «${ctx.scene.state.region}».</b>\n\nВы можете удалить ещё военкоматы, либо вернутся в админ-панель.`)
});

module.exports = {
    deleteMilitaryScene
}