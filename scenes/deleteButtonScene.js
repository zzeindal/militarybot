const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $button } = require('../config/connectMongoose.js');

const deleteButtonScene = new BaseScene('deleteButtonScene');
deleteButtonScene.enter(async (ctx) => {
	ctx.replyWithMarkdown(`Укажите название кнопки, которое нужно удалить.`, back_to_admin_keyboard);
});

deleteButtonScene.on('text', async (ctx) => {
	const checkButtons = await $button.findOne({ main: ctx.message.text });
	if(!checkButtons) return ctx.replyWithHTML(`Нет <b>кнопки</b> с таким названием.`);

	const buttons = await $button.findOne({ main: ctx.scene.state.main });
	var index = buttons.others.indexOf(ctx.scene.state.main);
	buttons.others.splice(index, 1);

	await buttons.save();
	return ctx.replyWithHTML(`<b>Успешно удалено из раздела «${ctx.scene.state.main}».</b>\n\nВы можете удалить ещё кнопки, либо вернутся в админ-панель.`)
});

module.exports = {
	deleteButtonScene
}
