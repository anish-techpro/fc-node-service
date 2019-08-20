/*requiring ORM*/
var Sequelize = require('sequelize');

/*requiring DB configuration*/
var sequelize = require('./database').sequelize;

var withPrefix = (tableName) => process.env.TABLE_PREFIX + tableName;

const VideoRooms = sequelize.define(withPrefix('video_rooms'), {
    host_id: { type: Sequelize.INTEGER },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    consumers: Sequelize.JSON,
    start_at: Sequelize.DATE,
    duration: Sequelize.INTEGER,
    publish: Sequelize.BOOLEAN
}, { underscored: true, freezeTableName: true, paranoid: true, timestamps: true });

const Users = sequelize.define(withPrefix('users'), {
    status: Sequelize.ENUM('0', '1'),
    type: Sequelize.ENUM('0', '1', '2', '3', '4', '5'),
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    image: Sequelize.STRING
}, { underscored: true, freezeTableName: true, paranoid: true, timestamps: true });

const VideoRoomTextChats = sequelize.define(withPrefix('video_room_text_chats'), {
    user_id: Sequelize.INTEGER,
    video_room_id: Sequelize.INTEGER,
    msg: Sequelize.TEXT,
}, { underscored: true, freezeTableName: true, paranoid: true, timestamps: true });

module.exports = {
    VideoRooms,
    Users,
    VideoRoomTextChats
};


// force: true will drop the table if it already exists.
// .sync function will make the db structure automatically.

//MODEL_NAME.sync({ force: false }).then(() => {});