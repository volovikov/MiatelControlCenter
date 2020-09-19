/**
 * General Database settings
 * 
 * @type type
 */
module.exports = {
    tasksDb: {
        host: 'mcc-dev.miatel.ru', 
        user: 'volovikov',
        password: 'Tu86@fas!',
        database: 'tasks',
        multipleStatements: true,
        charset: 'utf8'        
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
