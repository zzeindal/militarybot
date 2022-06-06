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

bot.action('donate', async (ctx) => {
    const keyboard = Keyboard.make([
        Key.url('💸 Помочь автору', 'https://t.me'),
        Key.callback(`🔙 Назад`, `go_to_info`)
    ], { columns: 1 }).inline();
    await ctx.editMessageText(ctx.i18n.t("donateText"), keyboard);
});

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

async function isMember(channelId, id) {
    const result = await bot.telegram.getChatMember(channelId, id);
    if (result.status && result.status !== "left") return true;
    return false;
}

bot.action('go_to_info', async (ctx) => {
    const user = await getUser(ctx.from.id);
    const subscription_1 = await isMember(process.env.adminChannel_1, ctx.from.id);
    const subscription_2 = await isMember(process.env.adminChannel_2, ctx.from.id);

    if (moment() > moment(user.timeLeft !== "0" ? user.timeLeft : 0) || !user.timeLeft) {
        if (!subscription_1 || !subscription_2) {
            await ctx.answerCbQuery(ctx.i18n.t("activeAccess"), true);
            return;
        }
    }
    if (subscription_1 && subscription_2) {
        if (!user.timeLeft || user.timeLeft === "0") {
            await ctx.editMessageText(ctx.i18n.t("infoMain_1"), { parse_mode: "HTML", reply_markup: info_keyboard.reply_markup });
            return;
        }
    }
    const time = moment(user.timeLeft).format('MMMM Do YYYY, HH:mm:ss');
    await ctx.editMessageText(ctx.i18n.t("infoMain_2", { time: time }), { parse_mode: "HTML", reply_markup: info_keyboard.reply_markup });
});


bot.action(/info (\d+)\s?(\d+)?$/i, async (ctx) => {
    if(ctx.match[2]) {
        try {
            await ctx.deleteMessage(ctx.match[2])
        } catch(err) {};
    }
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
    if (!buttons || buttons.others.length === 0) return ctx.answerCbQuery(ctx.i18n.t("inProgress"), true);

    var callback = [];
    for (var i = buttons.others.length - 1; i >= 0; i--) {
        callback.push(Key.callback(buttons.others[i], ctx.match[1] != 4 ? `ci ${ctx.match[1]} ${buttons.others[i]}` : `place ${buttons.others[i]}`));
    }
    callback.push(Key.callback('🔙 Назад', 'go_to_info'));
    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();
    await ctx.editMessageText(ctx.i18n.t(`info_${ctx.match[1]}`), { parse_mode: "HTML", reply_markup: keyboard.reply_markup });
});

bot.action(/ci (\d+) (.+)\s?(\d+)?$/i, async (ctx) => {
    const buttons = await $button.findOne({ main: ctx.match[2] });
    if (!buttons || buttons.others.length === 0) return ctx.answerCbQuery(ctx.i18n.t("inProgress"), true);
    if (buttons.others[0].includes('file::')) {
        const uid = ctx.match[3] ? ctx.match[3] : 0;
        const keyboard = Keyboard.make([
            Key.callback('⏪', `ci ${ctx.match[2]} ${uid - 15}`),
            `Страница №${Number((uid / 15).toFixed()) + 1}`,
            Key.callback('⏩', `ci ${ctx.match[2]} ${uid + 15}`),
            Key.callback('🔙 Назад', `info ${ctx.match[1]}`)
        ], { columns: 3 }).inline();

        var roadText = [];
        for (var i = uid; i < 15 && i < buttons.others.length; i++) {
            var split = buttons.others[i].split('::');

            const link = await bot.telegram.getFileLink(split[1]);

            roadText.push(`<a href="${link}">${split[2]}</a>`);
        }

        await ctx.editMessageText(roadText.join('\n'), { parse_mode: "HTML", reply_markup: keyboard.reply_markup });
    } else {

        try {
            await ctx.deleteMessage();
        } catch(err) {};

        var keyboard;
        try {
            const result = await ctx.replyWithPhoto(buttons.photo);
            keyboard = Keyboard.make([Key.callback('🔙 Назад', `info ${ctx.match[1]} ${result.message_id}`)]).inline();
        } catch (err) {
            keyboard = Keyboard.make([Key.callback('🔙 Назад', `info ${ctx.match[1]}`)]).inline();
        };
        return ctx.replyWithHTML(buttons.others[0], keyboard);
    }
})

bot.action(/place (.+)?$/i, async (ctx) => {
    const militaries = await $military.find({ region: ctx.match[1] });
    var callback = [];
    var selected_names = [];

    for (var i = militaries.length - 1; i >= 0; i--) {
        if (!selected_names.includes(militaries[i].city)) {
            callback.push(Key.callback(militaries[i].city, `city ${militaries[i].city}`));
            selected_names.push(militaries[i].city);
        }
    }
    callback.push(Key.callback(`🔙 Назад`, `info 4`))

    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();
    await ctx.editMessageText(`<b>${ctx.match[1]}</b>`, { parse_mode: "HTML", reply_markup: keyboard.reply_markup })
});

bot.action(/city (.+)$/i, async (ctx) => {
    const militaries = await $military.find({ city: ctx.match[1] });

    if(militaries.length === 0) return ctx.answerCbQuery(ctx.i18n.t("inProgress"), true);
    var callback = [];
    for (var i = militaries.length - 1; i >= 0; i--) {
        callback.push(Key.callback(`${militaries[i].name}`, `cv ${militaries[i].uid}`));
    }
    callback.push(Key.callback(`🔙 Назад`, `place ${militaries[0].region}`))
    const keyboard = Keyboard.make(callback, { columns: 1 }).inline();

    await ctx.editMessageText(`Выберите <b>военкомат</b>`, { parse_mode: "HTML", reply_markup: keyboard.reply_markup })

});

bot.action(/cv (\d+)?$/i, async (ctx) => {
    const military = await $military.findOne({ uid: ctx.match[1] });
    if (!military) return ctx.answerCbQuery(ctx.i18n.t("notMilitary"), true);

    const keyboard = Keyboard.make([Key.callback('Закрыть информацию', `close_info`)]).inline();

    return ctx.replyWithHTML(`${military.description}`, keyboard)
});

bot.action(/close_info$/i, async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch(err) {};
});
