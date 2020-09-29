/**
 * General Database settings
 * 
 * @type type
 */
module.exports = {
    tasksDb: {
        host: 'localhost', 
        user: 'root',
        password: '',
        database: 'taskcontrolcenter',
        multipleStatements: true,
        charset: 'utf8',
        connectionLimit: 50,
        queueLimit: 0,
        waitForConnection: true,        
    },
    voiceipDb: {
        host: '10.10.20.76',    
        //host: 'voip-dev.miatel.ru',
        user: 'volovikov',
        password: 'Tu86@fas!',
        database: 'miatelVoice',
        multipleStatements: true,
        charset: 'utf8'            
    },
    wwwDb: {
        //host: '91.217.178.8',
        host: 'net-dev.miatel.ru',
        user: 'volovikov',
        password: 'Tu86@fas!',
        database: 'miatel_net',
        multipleStatements: true,
        charset: 'utf8'              
    },
    sbcDb: {
        //host: '91.217.178.36',
        host: 'sbc-dev.miatel.ru',
        user: 'volovikov',
        password: 'Tu86@fas!',
        database: 'miatelSbc',
        multipleStatements: true,
        charset: 'utf8'
    }
};
