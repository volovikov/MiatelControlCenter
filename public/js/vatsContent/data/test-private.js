define([], function() {
    return[/*{
        method:'login',
        data: {
            login:'79312265007',
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
    }
	
    
        ];
});