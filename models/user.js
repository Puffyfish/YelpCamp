const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose);
// will add in the username and password and makes sure the username is unique
// gives additional methods that can be used

module.exports = mongoose.model('User', UserSchema);