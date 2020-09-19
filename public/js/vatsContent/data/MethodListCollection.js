define([], function() {
    return[
 publicMethodList = [/*{        /////0
                url: 'remind',
                data: {
                    
                }
            },*/{
                url: 'get-country-list',
                data: {
                
				
                }
            },{
                url: 'get-city-list',
                data: {
                    take: 10,
                    countryId: 1, // ВВ, 1 -- россия
                    skip: 0
                }
            },{
                url: 'get-phone-list',
                data: {
                    cityId: 9,
                    take: 4,
                    skip: 0
                }
            },{
                url: 'get-tariff-list',
                data: {
                    
                }
            },
            {
                url: 'get-tariff-list-cost',
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
            },
            {
                url: 'send-detail-callback',
                data: {
                    /**
                     * ВВ
                     * 
                     * Надо создать тестового пользователя, тестовую компани.
                     * В ней должно быть обязательно форма обратно связи
                     * И вот уже реальные данные этой компании и подставлять. 
                     * Сейчас этот код не работает
                     * 
                     * @type Array
                     */
                    
                    companyId: 812,
                    phoneNumber: 79523784792, //номер на который нужно перезвонить
                    userIp: '10.10.20.74', // IP адрес сервера сайта на котором виджет 
                    userUrl: 'miatel.net', // URL сайта на котором виджет стоит
                    elemId: '3-432' // из DOM, в схеме 
                }
        
            },
            {
                url: 'upload-image',
                data: {
                    mccRootPassword: 'vfvfvskfhfve414116'
                        }
        
            }
        ],			
			
 privateMethodList = [/*{     /////////////1
                url: 'set-property-general',
                data: {
                    phoneReservedPeriod: 3
                }
            },*/{
                url: 'get-property-general',
                data: {
                    
                }
            },
			{
                url: 'get-balance',
                data: {
                    //userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718'
                }
            },
			
			{
                url: 'get-atc-chime',
                data: {
                    
                    chimeId: 3
                }
            },
            {
                url: 'update-atc-chime',
                data: {
                    chimeId: '123',
                    chimeName: '1235',
                    chimeFileUrl: '4214443',
                    chimeComment: '31453466',
                    chimeOrder: 777


                }
            },
            {
                url: 'del-atc-chime',
                data: {
                    chimeId: '123'

                }
            }
            ,{
                url: 'get-atc-chime-list',
                data: {
                   /*sort: {
                        field: '',
                        dir: ''
                        }
					*/
                }
            },
        {
                url: 'set-contract-data',
                data: {
                    companyVersion: 'fiz', 
                    companyName: 'Autotest',
                    companyAction: 'Autotest',
                    companyWorkerCount: 111,
                    ownerName: 'Autotest',
                    ownerFamily: 'Autotest',
                    ownerSurname: 'Autotest',
                    ownerEmail: 'Autotest@Autotest.ru',
                    ownerPhone: '79523784792', /// Тут надо посьтавить везде данные с login, Нельзя затирать эти данные. Это поле изменгять нельзя!!!!!!!
                    ownerStatus: 'fiz' // fiz, ur, ip
                     }
            },
            {
                url: 'set-contract-data-more',
                data: {
                    companyPassport: "1111111111",
					companyBankAccount: "123",
                    companyBankKorAccount: "123",
                    companyBankName: "Autotest",
                    companyBik: "123",
                    companyInn: "111111111111", // ATTENTION!
                    companyKpp: '123',
                    companyOgrn: "123",
                    companyPostCity: "Autotest",
                    companyPostCountry: "Autotest",
                    companyPostHouse: "Autotest",
                    companyPostIndex: "Autotest",
                    companyPostStreet: "Autotest",
                    companyRealCity: "123",
                    companyRealCountry: "Autotest",
                    companyRealHouse: "Autotest",
                    companyRealIndex: "Autotest",
                    companyRealStreet: "Autotest",
                    companyVersion: 'fiz'
	
    }
            },
            
        {
                url: 'get-calls-list',
                data: {
                    callType: 'all', //all, in, out, inner (внутренние, между устр.                    
                    skip: 1,
                    take: 12//,
                    //src: ['100','101','79112639718'], // можно внутр. можно внеш. можно несколько
                    //dst: ['100','101','79112639718']

                }
            },{
                url: 'change-tariff',
                data: {
                    tarifId: 17
                }
            },/*{
                url: 'buy-city-numbers',
                data: {
                    reserved: {
		phoneList: ['78123836602', '']
                    }
                }
            },*/{
                url: 'get-server-list-tree',
                data: {
                    
                }
            },{
                url: 'get-server-list',
                data: {
                    skip: 0,
                    take: 10
                }
            },{
                url: 'get-server',
                data: {
                    serverId: 3
                }
            },{
                url: 'get-server-statistics',
                data: {
                    serverId: 3
                }
            },{
                url: 'get-asterisk-list',
                data: {
                    serverId: 3
                }
            }/*{
                url: 'get-voice-content',
                data: {
                    content: 'string'
                }
            },{
                url: 'get-sound-content',
                data: {
                    content: 'string'
                }
            }*/,{
                url: 'get-asterisk-list',
                data: {
                    serverId: 3
                }
            },{
                url: 'get-asterisk-statistics',
                data: {
                    serverId: 3
                }
            }
        ],
atcMethodList = [{      ///////////////////   2
                url: 'refuse-phone',
                data: {
                    elemId: 3,
                    phone: 79312265077
                }
            },{
                url: 'get-detail-input-call',
                data: {
                    elemId: 3
                }
            },{
                url: 'set-detail-input-call',
                data: {
                    elemId: '3',
                    inputCallName: 79523784792
                }
            },{
                url: 'set-detail-external-atc',
                data: {
                    elemId: 3,
                    externalAtcAddress: 79523784792,
                    externalAtcName: 1,
                    login: 1,
                    password: 1,
                    phoneAon: 1,
                    phoneAuthByIp: 1,
                    phoneCallUpTime: 1,
                    phonePrefix: 1
                }
            },{
                url: 'get-detail-external-atc',
                data: {
                    elemId: 3
                   
                }
            },{
                url: 'set-detail-input-call-sip',
                data: {
                    elemId: 3,
                    sipServer: 1,
                    sipUser: 1,
                    sipPassword: 1,
                    inputCallSipName: 1
                }
            },{
                url: 'get-detail-input-call-sip',
                data: {
                    elemId: 3
                }
                },{
                url: 'get-detail-input-callback',
                data: {
                    elemId: 3
                }
                },{
                url: 'set-detail-input-callback',
                data: {
                    elemId: 3,
                    sipServer: 1,
                    inputCallbackName: 1,
                    inputCallbackStatus: 1,
                    inputCallbackStyle: 1,
                    file: 1,
                    fileUploaded: 1,
                    robotSpeechText: 1,
                    robotVoiceType: 1,
                    userWelcomeTxt: 1,
                    userLanguage: 1,
                    userIp: 1,
                    userUrl: 1,
                    userDefineFileUrl: 1,
                    strategy: 1
                }
            },{
                url: 'set-detail-calls-filter',
                data: {
                    elemId: 3,
                    callsFilterName: 1,
                    numberOrPrefix: 1,
                    prefixByCityId: 1
                }
                },{
                url: 'get-detail-calls-filter',
                data: {
                    elemId: 3
                }
                },{
                url: 'set-detail-shedule',
                data: {
                    elemId: 3,
                    friday: 1,
                    fridayStart: 1 ,      
                    fridayStop: 1  ,    
                    monday: 1     ,   
                    mondayStart: 1 ,     
                    mondayStop: 1,
                    saturday: 1,
                    saturdayStart: 1,
                    saturdayStop: 1,
                    sheduleName: 1,
                    sundayStart: 1,
                    sundayStop: 1,
                    thursday: 1,
                    thursdayStart: 1,
                    thursdayStop: 1,
                    tuesday: 1,
                    tuesdayStart: 1,
                    tuesdayStop: 1,
                    wednesday: 1,
                    wednesdayStart: 1,
                    wednesdayStop: 1
                }
                },{
                url: 'get-detail-shedule',
                data: {
                    elemId: 3
                }
                },{
                url: 'set-detail-anonce-menu',
                data: {
                    elemId: 3,
                    anonceMenuName: 1,
                    anonceMenuCompleteMessageId: 1,
                    userDefineFileUrl: 1,
                    file: 1,
                    fileUploaded: 1,
                    robotSpeechText: 1, 
                    robotVoiceType: 2

                }
                },{
                url: 'get-detail-anonce-menu',
                data: {
                    elemId: 3
                }
                },
				
				{
                url: 'set-detail-voice-menu',
                data: {
                    elemId: '333',
						voiceMenuName: 'qwer',
						voiceMenuCompleteMessageId: 12,
						userDefineFileUrl: 'qwer' ,// может не быть параметра если выбран готовый
						robotSpeechText: 'qwer',//Какойто текст
						robotVoiceType: 'male' //male,female


                }
                },
				{
                url: 'get-detail-voice-menu',
                data: {
                    elemId: 3
                }
                },
				{
                url: 'set-detail-inner-user-group',
                data: {
                    elemId: 3,
                    groupName: 1,
                    callStrategy: 1,
                    queueTime: 1

                }
                },{
                url: 'get-detail-inner-user-group',
                data: {
                    elemId: 3
                }
                },{
                url: 'set-detail-inner-user',
                data: {
                    elemId: 'el-274172',
                    innerPhoneNumber: "",
                    phoneStatus: 'offline', // offline, online
                    phoneAon: "7(911)2639718",
                    phoneAonList: '7(911)2639718, 7(911)2639717',
                    phoneCallUpTime: "5",
                    phoneRedirect: "on",
                    phoneTalkRec: "on",
                    sipPassword: "1234",
                    sipServer: "1234",
                    sipUser: "1234",
                    userEmail: "1234",
                    userFullName: "1234",
                    userMobilePhone: "1234",
                    userRoumingNumber: "1234",
                    webLogin: "79523784792",
                    webPassword: "12345678",
                    isWebAccessAdmin: 1

                }
                },{
                url: 'get-detail-inner-user',
                data: {
                    elemId: 'el-978726'
                }
                },{
                url: 'get-condition',
                data: {
                    
                }
                },{
                url: 'get-condition-connections',
                data: {
                    

                }
                },{
                url: 'set-condition',
                data: {
                    elemId: 'el-922383',
                    type: '1',
                    top: 50,
                    left: 50

                }
                },{
                url: 'unset-condition',
                data: {
                    elemId: '133'
                }
                },{
                url: 'set-condition-connections',
                data: {
                    sourceElType: 1,
                    sourceElId: 1,
                    sourceAnchor: 1,
                    targetElId: 1,
                    targetElType: 1,
                    targetAnchor: 1

                }
                },{
                url: 'unset-condition-connections',
                data: {
                    sourceElId: 1,
                    targetElId: 1,
                    sourceAnchor: 1

                }
                },{
                url: 'set-detail-remote-access',
                data: {
                   
                    elemId: 1,
                    remoteAccesName: 1,
                    innerUserList:[{
                    innerPhoneNumber: 1,
                    userFullName: 1,
                    remoteAccess: 1
	},{
                    innerPhoneNumber: 1,
                    userFullName: 1,
                    remoteAccess: 1
	}]

                }
                },{
                url: 'get-detail-remote-access',
                data: {
                    elemId: 1

                }
                },{
                url: 'set-detail-input-call',
                data: {
                    elemId: 1,
                    inputCallName: 1

                }
                },{
                url: 'get-detail-input-call',
                data: {
                    elemId: 1

                }
                }
				,{
                url: 'get-inner-user-status',
                data: {
                    userId: 1

                }
                },{
                url: 'set-detail-sms-informer',
                data: {
                    smsInformerName: 'string',
                    smsText: 'string',
                    smsReceiversList: {
                        cellPhoneNumber:'string',
                        innerPhoneNumber:"200",
                        sendSms: "off",            //// ”on”,
                        userFullName: 'string'
                        }
                    }
                },{
                url: 'get-detail-sms-informer',
                data: {
                    elemId: 'string'
                    
                    }
                }
            ],
            
 mccMethodList = [{      ///////////3
                url: 'user-is-logined',
                data: {
                    
                }
            },{
                url: 'logoff',
                data: {
                    
                }
            },{
                url: 'get-task-comment-list',
                data: {
                    taskId: 1
                }
            },{
                url: 'add-task-comment',
                data: {
                    comment: 1,
                    commentAuthorId: 1,
                    commentDate: 1,
                    taskId: 1

                }
            },{
                url: 'get-company',
                data: {
                    id: 1
                }
            },{
                url: 'del-company',
                data: {
                    userGlobalId: 1

                }
            },{
                url: 'update-company',
                data: {
                    
                }
            }    
                ],
                
        proxyMethodList = [{  /////////////////////4
                url: 'get-mvts-tariff-list',
                data: {
                    
               }
            },{
                url: 'create-partner',
                data: {
                    userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718'

                }
            },{
                url: 'create-partner-contract',
                data: {
                    userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718',
                    partnerId: '7d2e586f-232c-11e6-80ca-005056b98e60', // номер контрагента в 1с
                    contractName: 'qwertyqwertyqwerty' // название договора, то что в шапке будет


                }
            },{
                url: 'create-partner-account',
                data: {
                    contractNumber: 1,
                    partnerId: 1,
                    tax: '', // НДС, 18 по умолчанию
                    accountInfo: {
                        id: 1,
                        serviceName: 1,
                        serviceCount: 1,
                        servicePrice: 1
                }
                }
            }    
                ],
cdrMethodList=[{       ///////////////////    5 
            url:'get-cdr-list',
                data:{
                skip: 1,
            take: 10,
                period: {
                dateBegin: '2016-04-11', // формат 2017-06-12		
                dateEnd: '2016-04-11',
                timeBegin: '10:29', // формат 12:29:55
                timeEnd: '11:45'
            },
            sort: [{
                field: 'duration', // srcInput/srcOutput/dst/date/duration
                dir: 'asc'  //desc or asc
                      
            }]//,
               //filter: {
                 //  field: '', // srcInput/srcOutput/dst/duration
                   // value: '',  
                    //operator: '' // eq/startswith/neq/en/el (=/начиная с ../<>/>/<)
                 //}
                    }
                        },
                {url:'get-cdr-list-stat',
                data:{
                number: 18625792465,
                type: 'dst', // srcInput/srcOutput/dst
                period: {
                dateBegin: '2016-04-11', // формат 2017-06-		
                dateEnd: '2016-04-12',
                timeBegin: '17:13', // формат 12:29
                timeEnd: '23:13'
            }
        }

                }
                        
                    ],
aonMethodList=[{      ////////  6
            url:'get-pull',
                data:{
                skip:'0' ,
                take: '10', // не обязателен
                q: '',
                sort: {
                    field: 'pullId', // pullId/pullName/clientId
                    dir: 'asc'
                        }
                    }
            },{
            url:'get-pull-number',
                data:{
                skip: 1,
            take: 1, // не обязателен
                q: 'string',
            sort: {
                field: 'string', // pullId/pullName/clientId
                dir: 'asc'
                        }
                    }
            },{
                url:'get-prefix',
                data:{
                skip: 1,
            take: 1, // не обязателен
                q: 'string',
            sort: {
                field: 'string', // prefix
                dir: 'asc'
            }

            }},{
                url:'get-number',
                data:{
                skip: 1,
            take: 1, // не обязателен
                q: 'string',
            sort: {
                field: 'string', // prefix
                dir: 'asc'
            }

            }},{
                url:'get-number-stat',
                data:{
            number: 1,
                period: {
                dateBegin: 'string', // формат 2017-06-12		
                dateEnd: 'string',
                timeBegin: 'string', // формат 12:29:55
                timeEnd: 'string'
                        }

        }
        },{
            url:'get-pull-stat',
            data:{
            pullName: 'string',
                period: {
                dateBegin: 'string', // формат 2017-06-12		
                dateEnd: 'string',
                timeBegin: 'string', // формат 12:29:55
                timeEnd: 'string'
            }

        }

        },{
            url:'get-pull-usage',
            data:{
               skip: 1,
            take: 1, // не обязателен
               q: 'string',
            sort: {
                field: 'string', // not use
                dir: 'asc'
            }
        }

        }/*{
            url:'del-prefix',
            data:{
            prefixId: 1,
               prefixName: 'string' // не обязателен
                }

        },{
            url:'del-number',
            data:{
            numberId: 1,
                number: 'string' // не обязателен
        }
        },{
            url:'del-pull',
            data:{
            pullId: 1,
               pullName: 'string' // не обязателен
        }
        }*/,{
            url:'add-number',
            data:{
            //number: 1,// не обязателен
           // pullID: '1' // не обязателен default 1
        }
        },{
            url:'add-prefix',
            data:{
            prefix: 1,// не обязателен
                info: 'string' // не обязателен
        }
        },{
            url:'add-pull',
            data:{
            pullName: 1,// не обязателен
               clientID: 'string' // не обязателен default “01”
        }
        },{
            url:'set-prefix',
            data:{
               prefixId: 1,
            prefix: 'string',
               info: 'string'
        }
        },{
            url:'set-number',
            data:{
               numberId: 1,
            number: 'string',
               pullId: 1
        }
        },{
            url:'set-pull',
            data:{
               pullId: 1,
            pullName: 'string',
               clientId: 1
        }
        }
             ],
             
whitelistMethodList=[      ///////   7
	 {
		url:'get-white-list',
        data:{
        skip: '0',
		take: 10,
		sort: {
		field: 'type', //только number
		dir: 'asc'
                },
               
            }
    },{
		url:'get-client-list',
        data:{
        skip: '0',
		take: 10,
		sort: {
		field: 'type', //только number
		dir: 'asc'
                },
               
            }
    },{
		url:'get-property-general',
        data:{
        
            }
    },/*{
		url:'set-property-general',
        data:{
        durationCall: 120
            }
    },*/{
		url:'add-white-number',
        data:{
			number: 999999
            }
    },{
		url:'del-white-number',
        data:{
			number: 999999
            }
    },{
		url:'add-white-client',
        data:{
			clientId: "01.138.2336"
            }
    },{
		url:'get-white-client-list',
        data:{
			skip: 0,
			take: 10,
			//q: 'string', // не обязателен
			sort: {
				field: 'string', // не используется
				dir: 'asc'
	}

            }
    },{
		url:'get-white-client-property',
        data:{
			clientId: "01.119.118"
            }
    },{
		url:'update-white-client-property',
        data:{
			clientId: "01.138.2336",
			clientInfo: 'test test test'

            }
    },{
		url:'del-white-client',
        data:{
			clientId: "01.138.2336"
            }
    }
	,{
		url:'get-whitelist-stat',
        data:{
			period: {
				dateBegin: '2016-05-12', // формат 2017-06-12		
				dateEnd: '2016-05-22',
				timeBegin: '12:29:55',  //формат 12:29:55
				timeEnd: '23:29:55'
			},
			skip: 1,
			take: 10,
			//sort: {
			//	field: 'string', // не используется
			//	dir: 'asc'
	//}

            }
		}
	
	 
	 ],
	 
blacklistMethodList=[{       ///////    8
                url:'get-black-list',
                data:{
                skip: '0',
                take: 10,
                sort: [{
                field: 'type', //только number
                dir: 'asc'
                        }],
                        /* filter:{
                            filters:[{
                            field: 'string', //только number
                            value: 'string'
                  }]*/

                    }//}
                },{
                url:'del-black-list-number',
                data:{
                    type: 'string',
                    number: 'string'
                    }
                },{
                url:'get-black-list-detail',
                data:{
                    slice:'2016-05-22 23:33:45',
                    number:'12025570005',
                    type:'src'

                    }
                },{
                url:'get-fraud-list-detail',
                data:{
                    slice:'2016-05-22 23:33:45',
                    number:'12025570005',
                    type:'src',
                    ecxl: '1'  //0 или 1

                    }
                },{
                url:'get-rules',
                data:{
                    skip: '0',
                    take: '10',
                    /*sort: [{
                field: 'string', // не используется
                dir: 'asc'
                }],
                filter:{
                  filters:[{
                      field: 'string', //только nameFilter
                      value: 'string'  
                  }]
                },
                nameFilter: 'string' // не обязателен

                  */  }
                },/*{
                url:'add-rules',
                data:{
                    nameFilter: '',
                    dataE: '10',  // json-строка с телом фильтра
                    info: '10',
                    active: 'no'  // yes/no


                    }
                },*/{
                url:'set-rules',
                data:{
                    nameFilter: 'New filter',
                    dataE: '111',  // json-строка с телом фильтра
                    info: '111222',
                    active: '111'  // yes/no
                     }
                },{
                url:'del-rules',
                data:{
                    nameFilter: '10'
                     }
                },{
                url:'get-config',
                data:{
                     }
                }/*{
                url:'set-config',
                data:{
                    rate_a: 1, // порог срабатывания блокировки по номеру A
                    rate_b: 1, // порог срабатывания блокировки по номеру B
                    blacklist_period: 1, // временной интервал выборки cdr в                 
                                  // секундах
                    blacklist_lifetime: 1 // время блокировки номера  в                 
                                    // секундах

                     }
                }*/,{
                url:'get-exclusion',
                data:{
                    skip: '0',
                    take: 10,
                    sort: [{
                field: 'typeE', // не используется или typeE/dataE
                dir: 'asc'
                        }],
                /* filter:{
                  filters: [{
                field: 'idE', // не используется или typeE/dataE
                value: '2'
                }]
                        }*/

                     }
                },{
                url:'del-exclusion',
                data:{
                    idE: 10
                     }
                },{
                url:'add-exclusion',
                data:{
                    dataE: 'string',
                    typeE: 'enum', // src/dst/client/partner
                    infoE: 'text'

                     }
                },{
                url:'set-exclusion',
                data:{
                    dataE: 'string',
                    typeE: 'enum', // src/dst/client/partner
                    idE: 'enum',
                    infoE: 'enum'

                     }
                },{
                url:'get-rules-tree',
                data:{
                     }
                }


                ],
				
 billsMethodList=[{     ///////   9
				url:'create-company-bills-auto&mccRootPassword=vfvfvskfhfve414116',
				data:{
					userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718',
					partnerId: '7d2e586f-232c-11e6-80ca-005056b98e60',
					
					}
			 
				},{
				url:'create-company-bills',
				data:{
					userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718',
					sum: '111',
					
					}
			 
				},{
				url:'get-bills',
				data:{
					userHash:11111,
					accountId: '1518'

					}
			 
				},{
				url:'get-bills-list',
				data:{
					
					userHash: 111111111,
					/*period: {
							dateStart: '2016-06-12 12:30:41', // формат 2017-06-12 12:30:41
							dateStop: '2016-06-12 18:30:41',
							timeStart: 'string', //12:30:41
							timeStop : 'string'

					}*/
			 
				}
				}
				
				],
				
 messagesMethodList=[    ///////   10
				{
				url:'get-message-list',
				data:{
				//sort: {
				//	field: 'id',
				//	dir: 'asc'
				//},
				skip: '1',
				take: '10',
				messageTargetId: '', // если пустое, то все, или через запятую
				//userHash: 'string'

				}
				},{
				url:'get-unread-message-list',
				data:{
				//sort: {
				//	field: 'id',
				//	dir: 'asc'
				//			},
				skip: '1',
				take: '10',
				messageTargetId: '1803', 
				//userHash: 'string'


				}
				},{
				url:'add-message',
				data:{
					messageType: 'alert', // alert, info, crytical
					messageAuthorId: '234',
					messageDate: '2016-05-25 17:27:19'	,
					messageRead:[{
					id: 1,
					userName: '23421'
				}],
				messageTarget: [{
					id: 1803,
					companyName: 'ИП 9999999999 9999999999 9999999999'
				},{
					id: 1803,
					companyName: 'ИП 9999999999 9999999999 9999999999'
				}],
				messageShort: '123123123' ,
				messageFull: '5695897689'

				}
				},{
				url:'del-message',
				data:{
					id: '471', 
					
				}
				},
				{
				url:'update-message',
				data:{
					id: 5467,
					messageType: 'alert',
					messageAuthorId: 222,
					messageDate: '2016-05-25 17:27:19',
					messageFull: '5695897689',
					messageShort: '12121212',
						messageRead:[{
						id: 1815,
						userName: '9999999999 9999999999 9999999999'
					}],
					messageTarget: [{
					id: 1518,
					companyName: 'string'
				}
]
 
					
				}
				}
				
				
				],
				
 documentsMethodList=[      /////////  11
				{
				url:'get-document-list',
				data:{
					//userGlobalId: '123456',
					sort: {
						field: 'id',
						dir: 'asc'
					},
					skip: 0,
					take: 10,
					q: '10%'
				}
				},{
				url:'set-contract',
				data:{
					contractNumber: '111',
					date: '2016-05-25 17:27:19',
					signed: '0',
					type: '123',
					//userGlobalId: 'string'
					url:'qwertyuuuuuu'
				}
				},{
				url:'update-contract',
				data:{
					contractNumber: '123',
					signed: '1',
					}
				},{
				url:'make-user-agreement',
				data:{
					userPhone: 'string',
					ip: 'string',
					confirmCode: 'string'
				}
				},{
				url:'make-contract-service-ur',
				data:{
					contractDate: 'string',
					contractNumber: 'string',	
						ownerName: 'string',
						ownerFamily: 'string',
						ownerSurname: 'string',
					ownerEmail: 'string',
					ownerPhone: 'string',
					companyInn: 'string',
					companyKpp: 'string',
					companyOgrn: 'string',
					companyBankName: 'string',
					companyBik: 'string',
					companyBankKorAccount: 'string',
					companyRealAddress: 'string'
				}
				},{
				url:'make-contract-service-fiz',
				data:{
					//userGlobalId: 'string',
					contractDate: 'string',
					contractNumber: 'string',	
						ownerName: 'string',
						ownerFamily: 'string',
						ownerSurname: 'string',
					ownerEmail: 'string',
					ownerPhone: 'string',
					ownerPassportDetail: 'string',
					ownerAddress: 'string'
				}
				},{
				url:'make-contract-change-tariff',
				data:{
					companyName: 'string',
					userName: 'string',
					//userGlobalId: 'string',
					contractDate: 'string',
					contractNumber: 'string',	
					tariffOld: 'string',
					tariffNew: 'string'
				}
				},{
				url:'make-contract-change-phone-num',
				data:{
					companyName: 'string',
					userName: 'string',	
					contractDate: 'string',
					contractNumber: 'string',	
					phoneNumber: 'string',
					tariff: 'string'
				}
				},{
				url:'make-contract-service-mgmn',
				data:{
					contractDate: 'string',
					contractNumber: 'string',	
					companyRealAddress: 'string',
					companyPostAddress: 'string',
					companyName: 'string',
					userName: 'string',
					userPhone: 'string',
					companyBankDetail: 'string'
				}
				}
				
				],
				
				 smsMethodList=[
				{
				url:'send-sms-web-settings',
				data:{
					userMobilePhone: '79523784792',
					webLogin: '79523784792',
					webPassword: '12345678'
				}
				},{
				url:'send-sms-sip-settings',
				data:{
					userMobilePhone: '79523784792',
					sipServer: '91.218.178.36',
					sipUser: '79523784792',
					sipPassword: '12345678'
				}
				},{
				url:'send-confirm-phone-code',
				data:{
					phone: '79523784792'
				}
				},{
				url:'check-confirm-phone-code',
				data:{
					phone: '79523784792'
				}
				}
				],

				 addClientMethodList=[
				{
					companyVersion: 'ooo', // ooo, oao, zao, other 
					companyName: 'Autotest',
					companyAction: 'Autotest',
					companyWorkerCount: 22,
					ownerName: 'Autotest',
					ownerFamily: 'Autotest',
					ownerSurname: 'Autotest',
					ownerEmail: 'Autotest@Autotest.ru',
					ownerPhone: '79523784792',
					ownerStatus: 'ur', // fiz, ur, ip ,
					rootPassword : "414116vfvfvskfhfve2128506",
					reserved: {
						phoneList: ['8(800)2343223', '8(800)2345623'],
						tariffId: 17
					}
				}
				]
				/* del-company&mccRootPasswordvfvfvskfhfve414116=[
				{
					companyVersion: 'ooo', // ooo, oao, zao, other 
					companyName: 'Autotest',
					companyAction: 'Autotest',
					companyWorkerCount: 22,
					ownerName: 'Autotest',
					ownerFamily: 'Autotest',
					ownerSurname: 'Autotest',
					ownerEmail: 'Autotest@Autotest.ru',
					ownerPhone: '79523784792',
					ownerStatus: 'ur', // fiz, ur, ip ,
					rootPassword : "414116vfvfvskfhfve2128506",
					reserved: {
						phoneList: ['8(800)2343223', '8(800)2345623'],
						tariffId: 17
					}
				}
				],*/
                
                ];
});