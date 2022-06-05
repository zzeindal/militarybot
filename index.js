process
 .on('unhandledRejection', (reason, p) => {
    console.log(`Unhandled Rejection at Promise: ${reason}`);
 })
 .on('uncaughtException', err => {
    console.log(`Uncaught Exception thrown: ${err}`);
 });

const { bot } = require('./config/connectTelegram.js');
const { $user } = require('./config/connectMongoose.js');
const { saveUser, botUsername } = require('./helpers/utils.js')
const { start_keyboard } = require('./helpers/keyboard.js')

require('./modules/userCommands.js');
require('./modules/adminCommands.js');

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}\n\n${err}`)
})

bot.start(async (ctx) => {
	const user = await $user.findOne({ id: ctx.from.id })
    if (!user) {
        await saveUser(ctx)
    }
    return ctx.replyWithHTML(ctx.i18n.t("start"), start_keyboard);
});

bot.on('text', async (ctx) => {
    if (ctx.chat.id < 0) return;
});

bot.startPolling();
