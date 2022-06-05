const { bot } = require('../config/connectTelegram.js');
const { $button, $military } = require('../config/connectMongoose.js');
const { Keyboard, Key } = require('telegram-keyboard')
const { admin_keyboard, change_keyboard, change_keyboard_2 } = require('../helpers/keyboard.js');
const { admins } = require('../helpers/utils.js');

var buttonNames = {
    "Нормативно-правовые акты": 1,
    "Образцы форм, рапортов, заявлений": 2,
    "Военные ВУЗы": 3,
    "Список военкоматов": 4
}

bot.hears(['/admin', '⏪ Вернутся в админ-панель'], async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;
    return ctx.reply(`Выберите раздел: `, admin_keyboard);
});

bot.hears('Изменить кнопки', async (ctx) => {
		if(!admins.includes(ctx.from.id)) return;
    return ctx.reply(`Выберите раздел в котором нужно изменить кнопки:`, change_keyboard);
})

bot.hears(/^«(.+)»$/i, async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: ctx.match[1] });
    if (!checkButtons) {
        let newButtons = new $button({
            main: ctx.match[1],
            others: []
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: ctx.match[1] });

    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(buttons.others[i]);
    }

    callback.push(Key.callback('Добавить кнопку', `addButton ${buttonNames[ctx.match[1]]}`));
    callback.push(Key.callback('Удалить кнопку', `deleteButton ${buttonNames[ctx.match[1]]}`));
    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();
    await ctx.reply(`Раздел выглядит сейчас так:`, keyboard);
});

bot.action(/addButton (.+)$/i, async (ctx) => {
    var main;
    switch (Number(ctx.match[1])) {
        case 1:
            main = "Нормативно-правовые акты";
            break;
        case 2:
            main = "Образцы форм, рапортов, заявлений";
            break;
        case 3:
            main = "Военные ВУЗы";
            break;
        case 4:
            main = "Список военкоматов";
            break;
    }
    return ctx.scene.enter("addButtonScene", { main: main });
});

bot.action(/deleteButton (.+)$/i, async (ctx) => {
    var main;
    switch (Number(ctx.match[1])) {
        case 1:
            main = "Нормативно-правовые акты";
            break;
        case 2:
            main = "Образцы форм, рапортов, заявлений";
            break;
        case 3:
            main = "Военные ВУЗы";
            break;
        case 4:
            main = "Список военкоматов";
            break;
    }
    return ctx.scene.enter("deleteButtonScene", { main: main });
});

bot.hears('Изменить файлы', async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    return ctx.replyWithHTML(`Выберите раздел:`, change_keyboard_2);
});


bot.hears(/-> «(.+)»$/i, async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: ctx.match[1] });
    if (!checkButtons) {
        let newButtons = new $button({
            main: ctx.match[1],
            others: []
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: ctx.match[1] });
    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(`<- «${buttons.others[i]}»`);
    }

    callback.push(`⏪ Вернутся в админ-панель`);
    const keyboard = Keyboard.make(callback, { columns: 1 }).reply();
    return ctx.replyWithHTML(`Выберите <b>подраздел</b>`, keyboard);
});

bot.hears(/<- «(.+)»$/i, async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: ctx.match[1] });
    if (!checkButtons) {
        let newButtons = new $button({
            main: ctx.match[1],
            others: []
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: ctx.match[1] });

    var roadText = [];
    for (var i = 0; i < buttons.others.length; i++) {
        var split = buttons.others[i].split('::');

        const link = await bot.telegram.getFileLink(split[1]);
        roadText.push(`<a href="${link}">№${i}</a>`);
    }
    const keyboard = Keyboard.make([Key.callback('Добавить образец', `addDocument ${ctx.match[1]}`)]).inline();
    await ctx.replyWithHTML(`Раздел <b>выглядит</b> сейчас так:\n\n${roadText.join('\n')}`, keyboard);
});

bot.action(/addDocument (.+)$/i, async (ctx) => {
    return ctx.scene.enter("addDocumentScene", { main: ctx.match[1] });
});

bot.hears('Изменить военные ВУЗы', async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: "Военные ВУЗы" });
    if (!checkButtons) {
        let newButtons = new $button({
            main: "Военные ВУЗы",
            others: []
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: "Военные ВУЗы" });
    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(`❗️ «${buttons.others[i]}»`);
    }

        callback.push(`⏪ Вернутся в админ-панель`);
    const keyboard = Keyboard.make(callback, { columns: 1 }).reply();
    return ctx.replyWithHTML(`Выберите <b>раздел:</b>`, keyboard);
});

bot.hears(/❗️ «(.+)»$/i, async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: ctx.match[1] });
    if (!checkButtons) {
        let newButtons = new $button({
            main: ctx.match[1],
            others: [],
            photo: ''
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: ctx.match[1] });
    const keyboard = Keyboard.make([
        Key.callback('Изменить фотографию', `changePhoto ${ctx.match[1]}`),
        Key.callback('Изменить текст', `changeText ${ctx.match[1]}`)
    ], { columns: 1 }).inline();

    try {
        await ctx.replyWithPhoto(buttons.photo);
    } catch (err) { console.log(err) };
    return ctx.replyWithHTML(`Вот так выглядит описание:\n\n${buttons.others[0]}`, keyboard);
});

bot.action(/changePhoto (.+)$/i, async (ctx) => {
    return ctx.scene.enter("changePhotoScene", { main: ctx.match[1] })
});

bot.action(/changeText (.+)$/i, async (ctx) => {
    return ctx.scene.enter("changeTextScene", { main: ctx.match[1] })
});

bot.hears('Изменить военкоматы', async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const checkButtons = await $button.findOne({ main: "Список военкоматов" });
    if (!checkButtons) {
        let newButtons = new $button({
            main: "Список военкоматов",
            others: []
        })
        await newButtons.save();
    }

    const buttons = await $button.findOne({ main: "Список военкоматов" });

    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(`⚙️ «${buttons.others[i]}»`);
    }

    callback.push(`⏪ Вернутся в админ-панель`);

    const keyboard = Keyboard.make(callback, { columns: 1 }).reply();
    return ctx.replyWithHTML(`Выберите <b>подраздел:</b>`, keyboard);
});

bot.hears(/⚙️ «(.+)»$/i, async (ctx) => {
	if(!admins.includes(ctx.from.id)) return;

    const militaries = await $military.find({ region: ctx.match[1] });

    var callback = [];
    for (var i = militaries.length - 1; i >= 0; i--) {
        callback.push(Key.callback(militaries[i].city));
    }

    callback.push(Key.callback(`Добавить военкомат`, `addMilitary ${ctx.match[1]}`));
    callback.push(Key.callback(`Удалить военкомат`, `deleteMilitary ${ctx.match[1]}`))
    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();

    return ctx.replyWithHTML(`Вот так выглядит <b>данный раздел</b> сейчас:`, keyboard);
});

bot.action(/addMilitary (.+)$/i, async (ctx) => {
    return ctx.scene.enter("addMilitaryScene", { region: ctx.match[1] });
});

bot.action(/deleteMilitary (.+)$/i, async (ctx) => {
    return ctx.scene.enter("deleteMilitaryScene", { region: ctx.match[1] });
});