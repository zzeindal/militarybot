const mongo = require('mongoose');

const userSchema = new mongo.Schema({
    uid: Number,
    id: Number,
    userName: String,
    userNick: String,
    timeLeft: String
});

const buttonsSchema = new mongo.Schema({
    main: String,
    others: Array,
    photo: String
});

const militariesSchema = new mongo.Schema({
    uid: Number,
    region: String,
    city: String,
    name: String,
    description: String
});

const $user = mongo.model("Users", userSchema);
const $button = mongo.model("Buttons", buttonsSchema);
const $military = mongo.model("Militaries", militariesSchema);

console.log(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] [MONGOOSE] > Устанавливаем подключение...`)
mongo.connect('mongodb://localhost:27017/military-bot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => { console.log(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] [MONGOOSE] > Подключение установлено.`) }).catch(err => console.log(err));

$user.prototype.set = function(field, value) {
    this[field] = value;
    return this.save();
}
$user.prototype.inc = function(field, value) {
    this[field] += value;
    return this.save();
}
$user.prototype.dec = function(field, value) {
    this[field] -= value;
    return this.save();
}

$button.prototype.set = function(field, value) {
    this[field] = value;
    return this.save();
}
$button.prototype.inc = function(field, value) {
    this[field] += value;
    return this.save();
}
$button.prototype.dec = function(field, value) {
    this[field] -= value;
    return this.save();
}

$military.prototype.set = function(field, value) {
    this[field] = value;
    return this.save();
}
$military.prototype.inc = function(field, value) {
    this[field] += value;
    return this.save();
}
$military.prototype.dec = function(field, value) {
    this[field] -= value;
    return this.save();
}

module.exports = {
	$user,
    $button,
    $military
};