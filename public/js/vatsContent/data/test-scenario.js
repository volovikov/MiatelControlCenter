define([], function() {
    return[/*{
        method:'login',
        data: {
            login:'79523784792',
            password:'vfvfvskfhfve414116'
        }
    },*/{
        method:'get-balance',
        data: {
            
        }
    },{
        method:'get-unread-message-list',
        data:{
            //sort: {
            //	field: 'id',
            //	dir: 'asc'
            //			},
            skip: '1',
            take: '10',
            messageTargetId: '1803', 
        }
    },{
        method: 'get-calls-list',
        data: {
            callType: 'all', //all, in, out, inner (внутренние, между устр.                    
            skip: 1,
            take: 12//,
            //src: ['100','101','79112639718'], // можно внутр. можно внеш. можно несколько
            //dst: ['100','101','79112639718']

        }
    },{
        method: 'get-atc-chime-list',
        data: {
           /*sort: {
                field: '',
                dir: ''
                }
            */
        }
    },{
        method: 'get-condition',
        data: {
            
        }
    },{
        method: 'get-condition-connections',
        data: {
            

        }
    },{
        method: 'get-calls-list',
        data: {
            callType: 'all', //all, in, out, inner (внутренние, между устр.                    
            skip: 1,
            take: 12//,
            //src: ['100','101','79112639718'], // можно внутр. можно внеш. можно несколько
            //dst: ['100','101','79112639718']

        }
    },{
		method: 'set-contract-data',
		data: {
			tariff:7,
            companyVersion: 'ooo', 
			companyName: 'Autotest',
			companyAction: 'Autotest',
			companyWorkerCount: 111,
			ownerName: 'Autotest',
			ownerFamily: 'Autotest',
			ownerSurname: 'Autotest',
			ownerEmail: 'Autotest@Autotest.ru',
			ownerPhone: '79523784792', /// Тут надо посьтавить везде данные с login, Нельзя затирать эти данные. Это поле изменгять нельзя!!!!!!!
			ownerStatus: 'ur' // fiz, ur, ip
			 }
	},
            {
                method: 'set-contract-data-more',
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
                    companyVersion: 'yur'
					}
    },{
                method: 'create-partner',
                data: {
                    userGlobalId: 'customer79523784792'

                }
            },{
                method: 'create-partner-contract',
                data: {
                    userGlobalId: 'customer79523784792',
                    partnerId: '7d2e586f-232c-11e6-87ca-005056b98e60', // номер контрагента в 1с
                    contractName: 'qwertyqwertyqwerty' // название договора, то что в шапке будет


                }
            },{
                method: 'create-partner-account',
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
            },{     
				method:'create-company-bills-auto&mccRootPassword=vfvfvskfhfve414116',
				data:{
					userGlobalId: 'customer79523784792',
					partnerId: '7d2e586f-232c-11e6-80ca-005056b98e60',
					
					}
			 
				},{
				method:'create-company-bills',
				data:{
					userGlobalId: 'customer79523784792',
					sum: '111',
					
					}
			 
				},,{
				method:'get-bills-list',
				data:{
					take: 20
				}
				}
	
    
        ];
});