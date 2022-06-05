const { $user } = require('../config/connectMongoose.js');
const botUsername = process.env.botUsername;
const admins = process.env.admins;

async function saveUser(ctx) {
    const count = await $user.countDocuments();
    let user = new $user({
        uid: count,
        id: ctx.from.id,
        userName: `${ctx.from.first_name}`,
        userNick: `${ctx.from.username !== undefined ? ctx.from.username : 'Без никнейма'}`
    })
    await user.save();
}

async function getUser(id) {
    const user = await $user.findOne({ id: id })
    return user;
}

module.exports = {
    botUsername,
    admins,
    saveUser,
    getUser
}