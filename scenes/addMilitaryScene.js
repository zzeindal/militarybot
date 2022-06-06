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
	ctx.session.city = ctx.message.text;
	return ctx.scene.enter("addMilitaryScene_1")
});

const addMilitaryScene_1 = new BaseScene('addMilitaryScene_1');
addMilitaryScene_1.enter(async (ctx) => {
	ctx.replyWithHTML(`Укажите <b>название</b> военкомата`, back_to_admin_keyboard);
});

addMilitaryScene_1.on('text', async (ctx) => {
	if(ctx.message.text.length > 30) return ctx.replyWithHTML(`<b>Максимальное количество символов: 30</b>`)
	ctx.session.name = ctx.message.text;
	return ctx.scene.enter("addMilitaryScene_2")
});

const addMilitaryScene_2 = new BaseScene('addMilitaryScene_2');
addMilitaryScene_2.enter(async (ctx) => {
	ctx.replyWithHTML(`Укажите <b>описание.</b>`, back_to_admin_keyboard);
});

addMilitaryScene_2.on('text', async (ctx) => {
	const count = await $military.countDocuments();

	const newM = new $military({
		uid: count + 1,
		region: ctx.session.region,
		city: ctx.session.city,
		name: ctx.session.name,
		description: ctx.message.text
	})	
	await newM.save();

	await ctx.replyWithHTML(`<b>Успешно добавлено в раздел «${ctx.session.region}».</b>\n\nВы можете добавить ещё военкоматы, либо вернутся в админ-панель.`)
	return ctx.scene.enter("addMilitaryScene", { region: ctx.session.region });
});

module.exports = {
	addMilitaryScene,
	addMilitaryScene_1,
	addMilitaryScene_2
}
