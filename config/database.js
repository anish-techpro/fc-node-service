
/*requiring ORM*/
const Sequelize = require('sequelize');
const hostName = 'stagingtrobotsco.cg4w7pt73u0d.us-east-1.rds.amazonaws.com';
/*defining database configuration*/
// const sequelize = new Sequelize('trobotsdb', 'trbsdbusr', 'Trb75dxpNnYTu88', {
//     host: hostName,
//     dialect: 'mysql',
//     operatorsAliases: false,
//     define: {
//         timestamps: false
//     },
//     timezone: '+05:30',

//     dialectOptions: {

//         charset: 'utf8mb4'
//     }

    /* Sequelize will setup a connection pool on initialization 
  so you should ideally only ever create one instance per database 
    if you're connecting to the DB from a single process. 
    If you're connecting to the DB from multiple processes, 
    you'll have to create one instance per process, 
    but each instance should have a maximum connection pool size of 
    "max connection pool size divided by number of instances". 
    So, if you wanted a max connection pool size of 90 and you had 3 worker processes, 
    each process's instance should have a max connection pool size of 30.*/

    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // },
//});






/*defining database configuration for read and write*/

const sequelize = new Sequelize('lumen_fc_master', 'tech', 'redhat456', {
    dialect: 'mysql',
   // port: 3306,
    operatorsAliases: false,
    define: {
        timestamps: false
    },
    timezone: '+05:30',
    dialectOptions: {

        charset: 'utf8mb4'
    },

//   replication: {
//         read: [
//             { host: 'stagingtrobotscoread.cg4w7pt73u0d.us-east-1.rds.amazonaws.com', username: 'trbsdbusr', password: 'Trb75dxpNnYTu88' }
           
//         ],
//       write: { host: 'stagingtrobotsco.cg4w7pt73u0d.us-east-1.rds.amazonaws.com', username: 'trbsdbusr', password: 'Trb75dxpNnYTu88' }
//     },
    pool: { // If you want to override the options used for the read/write pool you can do so here
        max: 20,
        idle: 30000
    },
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:');
        console.error(err);
    });

module.exports.sequelize = sequelize;