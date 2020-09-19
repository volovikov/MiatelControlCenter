define([], function() {
    return[{
        method: 'is-user-logined',
        
    },{
        method: 'get-department-list-tree',
        data: {
            
        }
    },{
        method: 'get-department-list',
        data: {
			
			//sort: [{
			//field: 'string',
			//dir: 'string'
			//},{
			
		//}],
			skip: 1,
			take: 5 }
	},{
        method: 'add-department',
        data: {
            departmentId:'',
            departmentName:'AutoBet_org',
            departmentInfo:'',
            parentId:'',
            departmentStatus:'',
            dateDelete:'',
            userName:''

        }
    }/*,
        {
        method: 'del-department',
        data: {
            userHash: 'string',
			departmentId: number


        }
    },
        {
        method: 'update-department',
        data: {
            userHash: 'string',
			departmentId: number,
			name: 'string'

        }
    },
        {
        method: 'get-department',
        data: {
            userHash: 'string',
			name: 'string'

        }
    }*/
        ,{
        method: 'get-member-list-tree',
        data: {
            
			
        }
    },
        {
        method: 'get-member-list',
        data: {
            	
		//sort: [{
		//field: 'string',
		//dir: 'string'
		//	},{
		
		//	}],
		//filter: {
		//logic: 'string',
		//filters: [{
		//	field: 'string',
		//	operator: 'string',
		//	value: 'string'
		//},{
			
		//}]
		//},
		skip: 1,
		take: 10

        }
    },
        {
        method: 'add-member',
        data: {
            // userId:'',
            // departmentId:61,
            // userName:'bet_adm',
            // userPassword:'',
            // accessRole:'Администратор органа'
            // startDate:'2016-09-01 13:08:41',
            // endDate:'2099-01-01 00:00:00',
            // dateDelete:'',     //Thu Sep 01 2016 13:08:41 GMT+0300 (RTZ 2 (зима))
            // userStatus:'активен'
			
        }
    },/*
        {
        method: 'del-member',
        data: {
            userHash: 'string',
			memberId: number
			
        }
    },
        {
        method: 'update-member',
        data: {
            userHash: 'string',
			memberId: number,
			departmentId: number,
			name: 'string',
			login: 'string',
			password: 'string',
			accessRole: 'string',
			accessPerod: {
				begin: 'string',
				end: 'string'
			},
			status: 'string'
			
        }
    },*/
        {
        method: 'get-member',
        data: {
           memberId: 6336
			
        }
    },
        {
        method: 'get-task-list-tree',
        data: {
            
			
        }
    },
        {
        method: 'get-task-list',
        data: {
           
			departmentId: 777,
			skip: 7,
			take: 77
			//filter: {
			//	logic: 'string',
			//	filters: [{
			//		field: 'string',
			//		operator: 'string',
			//		value: 'string'
			//	},{
			//		
			//	}]
			//},
			//sort: [{
			//	field: 'string',
			//	dir: 'string'
			//},{
			//	
			//}]

			
        }
    },
        {
        method: 'add-task',
        data: {
            
			departmentId: 77,
			departmentName: 'testauto',
			taskId: 555,
			aliace: '55',
			memberId:7,
			//runPeriod: {
			//	begin: 'string',
			//	end: 'string'
			//},
			controlType: '11',
			remark: '22'
	
        }
    }/*,
        {
        method: 'del-task',
        data: {
            userHash: 'string',
			taskId: number
        }
    },
        {
        method: 'update-task',
        data: {
            taskId: number,
			userHash: 'string',
			departmentId: number,
			departmentName: 'string',
			taskId: number,
			aliace: 'string',
			memberId: number,
			runPeriod: {
				begin: 'string',
				end: 'string'
			},
			controlType: 'string',
			remark: 'string'
			
        }
    },
        {
        method: 'get-task',
        data: {
            userHash: 'string',
			taskId: number
        }
    },
        {
        method: 'get-assent-list-tree',
        data: {
            userHash: 'string',
			
        }
    },
        {
        method: 'get-assent-list',
        data: {
            userHash: 'string',
			departmentId: number,
			skip: number,
			take: number,
			filter: {
				logic: 'string',
				filters: [{
					field: 'string',
					operator: 'string',
					value: 'string'
				},{
						
				}]
			},
			sort: [{
				field: 'string',
				dir: 'string'
			},{
					
			}]

			
        }
    },
        {
        method: 'add-assent',
        data: {
            userHash: 'string',
			departmentId: number,
			status: ‘string’,
			assentMemberId: number
					
        }
    },
        {
        method: 'del-assent',
        data: {
            userHash: 'string',
			assentId: number

        }
    },
        {
        method: 'update-assent',
        data: {
            userHash: 'string',
			assentId: number,
			departmentId number,
			assentMemberName: 'string',
			assentMemberId: number,
			assentPeriod: {
				begin: 'string',
				end: 'start'
			},
			status: ‘string’
			
        }
    },
        {
        method: 'get-assent',
        data: {
            userHash: 'string',
			assentId: number

        }
    }*/
        ,{
        method: 'get-log',
        data: {
            userHash: 'string',	
			skip: 1,
				take: 1,
				filter: {
					logic: 'string',
					filters: [{
						field: 'string',
						operator: 'string',
						value: 'string'
					},{
							
					}]
				},
				sort: [{
					field: 'string',
					dir: 'string'
				},{
						
				}]

        }
    },
        {
        method: 'get-harware-status-list',
        data: {
            //userHash: 'string',
			

        }
    }/*,
        {
        method: 'add-ipaddress',
        data: {
            userHash: 'string',
			address: 'string'

			

        }
    },
        {
        method: 'update-ipaddress',
        data: {
            userHash: 'string',
			addressId: number,
			address: 'srting'
        }
    },
        {
        method: 'get-ipaddress',
        data: {
            userHash: 'string',
			
        }
    },
        {
        method: 'del-ipaddress',
        data: {
            userHash: 'string',
			addressId: number,
			
        }
    },
        {
        method: 'get-task-result-list',
        data: {
            userHash: 'string',
			departmentId: number,
			taskId: number,
			aliace: 'string',
			controlType: 'string',	
			isTaskRun: false
        }
    }*/
        
        ];
});