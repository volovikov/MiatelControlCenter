define([], function() {
    return[{
        method: 'ping-voice-node',
        data: {}
    },{
        method: 'ping-sbc-node',
        data: {}                
    },{
        method: 'ping-mcc-node',
        data: {}
    },{
        method: 'ping-www-node',
        data: {}
    },{
        method: 'check-soap-user',     ////Написать метод test-*      тестирования валидности SOAP  пользователя Mvts  и сделать возможность его запуска через МЦЦ руками принудительно. А также, каждые 30 мин автоматически тестировать
        data: {}
    },{
        method: 'ping-mvts-node',
        data: {}
    },{
        method: 'mysql-sbc-node',
        data: {}
    },{
        method: 'mysql-www-node',
        data: {}
    },{
        method: 'mysql-voice-node',
        data: {}
    }
        
        ];
});