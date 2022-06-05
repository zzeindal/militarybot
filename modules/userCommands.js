const { Keyboard, Key } = require('telegram-keyboard')
const moment = require('moment');

const { bot } = require('../config/connectTelegram.js');
const {
    buy_keyboard,
    info_keyboard,
    start_keyboard
} = require('../helpers/keyboard.js')
const { getUser, botUsername } = require('../helpers/utils.js')
const { $button, $military } = require('../config/connectMongoose.js');
moment.locale('ru')

bot.action('firstPage', async (ctx) => {
    await ctx.editMessageText(ctx.i18n.t("start", { id: ctx.from.id, bot: botUsername }), { parse_mode: "HTML", reply_markup: start_keyboard.reply_markup });
});

bot.action(/buy\s?(\d+)?$/i, async (ctx) => {
    if (!ctx.match[1]) {
        await ctx.editMessageText(ctx.i18n.t("buy"), { parse_mode: "HTML", reply_markup: buy_keyboard.reply_markup });
        return;

    } else {
        var amount = 0;
        switch (ctx.match[1]) {
            case 1:
                amount = 100;
                break;
            case 2:
                amount = 400;
                break;
            case 3:
                amount = 800;
                break;
        }

        const keyboard = Keyboard.make([
            Key.url('Яндекс Деньги', 'https://telegram.org'),
            Key.url('ЮКасса', 'https://telegram.org'),
            Key.url('Qiwi', 'https://telegram.org'),
            Key.callback('🔙 Назад', 'buy')
        ], { columns: 1 }).inline();

        await ctx.editMessageText(ctx.i18n.t("buy_2"), { parse_mode: "HTML", reply_markup: keyboard.reply_markup })
    }
})

bot.action('go_to_info', async (ctx) => {
    const user = await getUser(ctx.from.id);
    /*if (moment() > moment(user.timeLeft) || !user.timeLeft) {
        await ctx.answerCbQuery(ctx.i18n.t("activeAccess"), true);
        return;
    }*/
    const time = moment(user.timeLeft).format('MMMM Do YYYY, HH:mm:ss');
    await ctx.editMessageText(ctx.i18n.t("infoMain", { time: time }), { parse_mode: "HTML", reply_markup: info_keyboard.reply_markup });
});


bot.action(/info (\d+)$/i, async (ctx) => {
    var text;
    switch (Number(ctx.match[1])) {
        case 1:
            text = "Нормативно-правовые акты";
            break;
        case 2:
            text = "Образцы форм, рапортов, заявлений";
            break;
        case 3:
            text = "Военные ВУЗы";
            break;
        case 4:
            text = "Список военкоматов";
            break;
    }
    const buttons = await $button.findOne({ main: text });
    if(!buttons || buttons.others.length === 0) return ctx.answerCbQuery(ctx.i18n.t("inProgress"), true);

    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(Key.callback(buttons.others[i], ctx.match[1] != 4 ? `check_info ${buttons.others[i]}` : `place ${buttons.others[i]}`));
    }
    callback.push(Key.callback('🔙 Назад', 'go_to_info'));
    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();
    await ctx.editMessageText(ctx.i18n.t(`info_${ctx.match[1]}`), { parse_mode: "HTML", reply_markup: keyboard.reply_markup });
});

bot.action(/check_info (.+)\s?(\d+)?$/i, async (ctx) => {
    const buttons = await $button.findOne({ main: ctx.match[1] });
    if(!buttons || buttons.others.length === 0) return ctx.answerCbQuery(ctx.i18n.t("inProgress"), true);
    if (buttons.others[0].includes('file::')) {
        const uid = ctx.match[2] ? ctx.match[2] : 0;
        const keyboard = Keyboard.make([
            Key.callback('⏪', `checkinfo ${ctx.match[1]} ${uid - 15}`),
            `Страница №${Number((uid / 15).toFixed()) + 1}`,
            Key.callback('⏩', `checkinfo ${ctx.match[1]} ${uid + 15}`),
            Key.callback('🔙 Назад', 'go_to_info')
        ], { columns: 3 }).inline();

        var roadText = [];
        for (var i = uid; i < 15 && i < buttons.others.length; i++) {
            var split = buttons.others[i].split('::');

            const link = await bot.telegram.getFileLink(split[1]);
            roadText.push(`<a href="${link}">№${i}</a>`);
        }

        await ctx.editMessageText(roadText.join('\n'), { parse_mode: "HTML", reply_markup: keyboard.reply_markup });
    } else {
        const keyboard = Keyboard.make([Key.callback('🔙 Назад', 'go_to_info')]).inline();
        try {
        	await ctx.replyWithPhoto(buttons.photo)
        } catch(err) {};
        await ctx.editMessageText(buttons.others[0], { parse_mode: "HTML", reply_markup: keyboard.reply_markup });
    }
})

bot.action(/place (.+)?$/i, async (ctx) => {
    const militaries = await $military.find({ region: ctx.match[1] });
    var callback = [];

    for (var i = militaries.length - 1; i >= 0; i--) {
        callback.push(Key.callback(militaries[i].city, `city 0 ${militaries[i].city}`));
    }
    callback.push(Key.callback(`🔙 Назад`, `info 4`))

    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();
    await ctx.editMessageText(`<b>${ctx.match[1]}</b>`, { parse_mode: "HTML", reply_markup: keyboard.reply_markup })
});

bot.action(/city (\d+) (.+)?$/i, async (ctx) => {
    const militaries = await $military.find({ city: ctx.match[2] });
    if(!militaries[ctx.match[1]]) return ctx.answerCbQuery(ctx.i18n.t("notMilitary"), true);

    const keyboard = Keyboard.make([
        Key.callback('⏪', `city ${ctx.match[1] - 1} ${ctx.match[2]}`),
        `№${Number(ctx.match[1]) + 1}`,
        Key.callback('⏩', `city ${ctx.match[1] + 1} ${ctx.match[2]}`),
        Key.callback('🔙 Назад', `place ${militaries[0].region}`)
    ], { columns: 3 }).inline();

    await ctx.editMessageText(`${militaries[ctx.match[1]].description}`, { parse_mode: "HTML", reply_markup: keyboard.reply_markup })
});