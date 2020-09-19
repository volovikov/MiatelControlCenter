define([], function() {
    return[     
				{
				method:'get-document-list',
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
				method:'set-contract',
				data:{
					contractNumber: '111',
					date: '2016-05-25 17:27:19',
					signed: '0',
					type: '123',
					//userGlobalId: 'string'
					method:'qwertyuuuuuu'
				}
				},{
				method:'update-contract',
				data:{
					contractNumber: '123',
					signed: '1',
					//userGlobalId: 'string'
				}
				},{
				method:'make-user-agreement',
				data:{
					//userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718',
					userPhone: 'string',
					ip: 'string',
					confirmCode: 'string'
				}
				},{
				method:'make-contract-service-ur',
				data:{
					//userGlobalId: 'customer_IP_Volovikov__Vladimir_Serge_79112639718',
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
				method:'make-contract-service-fiz',
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
				method:'make-contract-change-tariff',
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
				method:'make-contract-change-phone-num',
				data:{
					companyName: 'string',
					userName: 'string',	
					//userGlobalId: 'string',
					contractDate: 'string',
					contractNumber: 'string',	
					phoneNumber: 'string',
					tariff: 'string'
				}
				},{
				method:'make-contract-service-mgmn',
				data:{
					//userGlobalId: 'string',
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
				
				];
});