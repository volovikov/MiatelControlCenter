define([], function() {
    return[{      ///////////////////   3
                method: 'refuse-phone',
                data: {
                    elemId: 3,
                    phone: 79312265077
                }
            },{
                method: 'get-detail-input-call',
                data: {
                    elemId: 3
                }
            },{
                method: 'set-detail-input-call',
                data: {
                    elemId: '3',
                    inputCallName: 79312265007
                }
            },{
                method: 'set-detail-external-atc',
                data: {
                    elemId: 3,
                    externalAtcAddress: 79312265007,
                    externalAtcName: 1,
                    login: 1,
                    password: 1,
                    phoneAon: 1,
                    phoneAuthByIp: 1,
                    phoneCallUpTime: 1,
                    phonePrefix: 1
                }
            },{
                method: 'get-detail-external-atc',
                data: {
                    elemId: 3
                   
                }
            },{
                method: 'set-detail-input-call-sip',
                data: {
                    elemId: 3,
                    sipServer: 1,
                    sipUser: 1,
                    sipPassword: 1,
                    inputCallSipName: 1
                }
            },{
                method: 'get-detail-input-call-sip',
                data: {
                    elemId: 3
                }
                },{
                method: 'get-detail-input-callback',
                data: {
                    elemId: 3
                }
                },{
                method: 'set-detail-input-callback',
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
                method: 'set-detail-calls-filter',
                data: {
                    elemId: 3,
                    callsFilterName: 1,
                    numberOrPrefix: 1,
                    prefixByCityId: 1
                }
                },{
                method: 'get-detail-calls-filter',
                data: {
                    elemId: 3
                }
                },{
                method: 'set-detail-shedule',
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
                method: 'get-detail-shedule',
                data: {
                    elemId: 3
                }
                },{
                method: 'set-detail-anonce-menu',
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
                method: 'get-detail-anonce-menu',
                data: {
                    elemId: 3
                }
                },
				
				{
                method: 'set-detail-voice-menu',
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
                method: 'get-detail-voice-menu',
                data: {
                    elemId: 3
                }
                },
				{
                method: 'set-detail-inner-user-group',
                data: {
                    elemId: 3,
                    groupName: 1,
                    callStrategy: 1,
                    queueTime: 1

                }
                },{
                method: 'get-detail-inner-user-group',
                data: {
                    elemId: 3
                }
                },{
                method: 'set-detail-inner-user',
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
                    webLogin: "79312265007",
                    webPassword: "12345678",
                    isWebAccessAdmin: 1

                }
                },{
                method: 'get-detail-inner-user',
                data: {
                    elemId: 'el-978726'
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
                method: 'set-condition',
                data: {
                    elemId: 'el-922383',
                    type: '1',
                    top: 50,
                    left: 50

                }
                },{
                method: 'unset-condition',
                data: {
                    elemId: '133'
                }
                },{
                method: 'set-condition-connections',
                data: {
                    sourceElType: 1,
                    sourceElId: 1,
                    sourceAnchor: 1,
                    targetElId: 1,
                    targetElType: 1,
                    targetAnchor: 1

                }
                },{
                method: 'unset-condition-connections',
                data: {
                    sourceElId: 1,
                    targetElId: 1,
                    sourceAnchor: 1

                }
                },{
                method: 'set-detail-remote-access',
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
                method: 'get-detail-remote-access',
                data: {
                    elemId: 1

                }
                },{
                method: 'set-detail-input-call',
                data: {
                    elemId: 1,
                    inputCallName: 1

                }
                },{
                method: 'get-detail-input-call',
                data: {
                    elemId: 1

                }
                }
				,{
                method: 'get-inner-user-status',
                data: {
                    userId: 1

                }
                }
            ];
});