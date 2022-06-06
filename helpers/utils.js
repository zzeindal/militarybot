const { $user, $button } = require('../config/connectMongoose.js');
const botUsername = process.env.botUsername;
const admins = process.env.admins;

async function saveUser(ctx) {
    const count = await $user.countDocuments();
    let user = new $user({
        uid: count,
        id: ctx.from.id,
        userName: `${ctx.from.first_name}`,
        userNick: `${ctx.from.username !== undefined ? ctx.from.username : 'Без никнейма'}`,
        timeLeft: 0
    })
    await user.save();
}

async function getUser(id) {
    const user = await $user.findOne({ id: id })
    return user;
}

async function checkButton(name) {
    const allButtons = await $button.find();
    for (var i = allButtons.length - 1; i >= 0; i--) {
        if (allButtons[i].main === name) {
            return true;
        } else {
            for (var j = allButtons[i].others.length - 1; j >= 0; j--) {
                if (allButtons[i].others[j] === name) {
                    return true;
                }
            }
        }
    }

    return false;
}

module.exports = {
    botUsername,
    admins,
    saveUser,
    getUser,
    checkButton
}