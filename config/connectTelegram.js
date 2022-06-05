require('dotenv').config()

const { Stage, BaseScene, Telegraf } = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const LocalSession = require('telegraf-session-local')
const path = require('path')

const bot = new Telegraf(process.env.telegram_token);

const i18n = new TelegrafI18n({
    directory: path.resolve(__dirname, 'locales'),
    defaultLanguage: 'ru',
    sessionName: 'session',
    useSession: true,
    templateData: {
        pluralize: TelegrafI18n.pluralize,
        uppercase: (value) => value.toUpperCase()
    }
});

const { admin_keyboard } = require('../helpers/keyboard.js');
const { addButtonScene } = require('../scenes/addButtonScene.js');
const { deleteButtonScene } = require('../scenes/deleteButtonScene.js');
const { addDocumentScene } = require('../scenes/addDocumentScene.js');
const { changePhotoScene } = require('../scenes/changePhotoScene.js');
const { changeTextScene } = require('../scenes/changeTextScene.js');
const { addMilitaryScene, addMilitaryScene_2 } = require('../scenes/addMilitaryScene.js');
const { deleteMilitaryScene } = require('../scenes/deleteMilitaryScene.js');

const stage = new Stage([
    addButtonScene,
    deleteButtonScene,
    addDocumentScene,
    changePhotoScene,
    changeTextScene,
    addMilitaryScene,
    addMilitaryScene_2,
    deleteMilitaryScene
]);

stage.hears('Вернутся в админ-панель', async (ctx) => {
    await ctx.replyWithHTML(`Вы в <b>админ-панели</b>`, admin_keyboard);
    return ctx.scene.leave();
});

bot.use((new LocalSession({ database: 'session.json' })).middleware())
bot.use(i18n.middleware());
bot.use(stage.middleware());

module.exports = {
    bot,
    i18n
}