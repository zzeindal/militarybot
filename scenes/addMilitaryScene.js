const { BaseScene } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard');
const { back_to_admin_keyboard } = require('../helpers/keyboard.js');
const { $military } = require('../config/connectMongoose.js');

const addMilitaryScene = new BaseScene('addMilitaryScene');
addMilitaryScene.enter(async (ctx) => {
	ctx.replyWithHTML(`Укажите <b>область</b> военкомата`, back_to_admin_keyboard);
});

addMilitaryScene.on('text', async (ctx) => {
	if(ctx.message.text.length > 30) return ctx.replyWithHTML(`<b>Максимальное количество символов: 30</b>`)
	if(ctx.message.text.includes(['.', ',', '/'])) return ctx.replyWithHTML(`В тексте <b>найдены символы.</b>`)
	ctx.session.region = ctx.scene.state.region;
	const military = await $military.findOne({ city: ctx.message.text })
	if(military) return ctx.replyWithHTML(`Уже присутствует <b>военкомат</b> в этой области.`);

	ctx.session.city = ctx.message.text;
	return ctx.scene.enter("addMilitaryScene_2")
});

const addMilitaryScene_2 = new BaseScene('addMilitaryScene_2');
addMilitaryScene_2.enter(async (ctx) => {
	ctx.replyWithHTML(`Укажите <b>описание.</b>`, back_to_admin_keyboard);
});

addMilitaryScene_2.on('text', async (ctx) => {
	const newM = new $military({
		region: ctx.session.region,
		city: ctx.session.city,
		description: ctx.message.text
	})	
	await newM.save();

	await ctx.replyWithHTML(`<b>Успешно добавлено в раздел «${ctx.session.region}».</b>\n\nВы можете добавить ещё военкоматы, либо вернутся в админ-панель.`)
	return ctx.scene.enter("addMilitaryScene")
});

module.exports = {
	addMilitaryScene,
	addMilitaryScene_2
}
