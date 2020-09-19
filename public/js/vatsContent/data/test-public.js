define([], function() {
    return[{
        method: 'get-country-list',
        data: {}
    },{
        method: 'get-city-list',
        data: {
            countryId: 1 // Россия
        }                
    },{
        method: 'get-phone-list',
        data: {
            countryId: 1,
            cityId: 9,
            type: 'other'
        }
    },{
        method: 'get-tariff-list',
        data: {}
        },
        {
        method: 'get-tariff-list-cost',
        data: {
            /**
             * ВВ
             * 
             * Сначала нужно получить список тарифов. get-tarif-list
             * Потом запустить этот метод. В него передать сл. числом номер тарифа
             * Также и с городами. Получить их список, потом подставить
             * Можно и нужно сделать несолько тестов
             * 
             * - Подставляем реальные данные
             * - Подставляем не верные данные
             * - Подставляем ошибочные данные, Javascript код, строки, -1 и т.д.
             * 
             * @type Array
             */
            tariffId: 5, // номер тарифного плана, не обязательно. 
            countryId: 1 // не обязательно
        }
    }
        
        ];
});