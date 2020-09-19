define([], function() {
    return[    ///////   10
				{
				 method:'get-message-list',
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
				 method:'get-unread-message-list',
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
				 method:'add-message',
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
				 method:'del-message',
				data:{
					id: '471', 
					
				}
				},
				{
				 method:'update-message',
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
				
				
				];
});