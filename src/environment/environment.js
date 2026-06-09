export default {
    apiUrl: {
        baseUrl: 'http://localhost:9072/rfqService/api/v1',
      //SIT
      // baseUrl: 'http://10.0.1.209:9072/rfqService/api/v1',
        auth: {
            login: '/auth/authenticate',
            validateOtp: '/auth/validateOtp',
            logout: '/user/logout',
            activateUser: '/auth/activate/user',
            forgotPassword: '/auth/forgotPassword',
            resetPassword: '/auth/resetPassword',
        },
      user:{
        createUser:'/user/create',
        editUser:'/user/edit',
        getUsers: '/user/read',
        getUserApprovals: '/user/pendingApprovals/read'
      },
      approvals:{
        approveEntity:'/approvals/approve',
      },
      roles:{
        getRoles:'/user/roles/read',
        createRoles:'/user/roles/create',
        getUserApprovals: '/user/pendingApprovals/read',
        getRoleApprovals: '/user/roles/pendingApprovals/read',
        editRole:'/user/roles/edit',
      },
      permissions:{
          getPermissions:'/user/permissions/read',
          getPermissionsByRoles:'/role/permissions/read',
      },
      rfq:{
          fetchAccounts: '/rfq/fetchAccounts',
        getCurrencyDirection: '/rfq/getCurrencyDirection',
        getSinglePairExchangeRate:'/rfq/getSinglePairExchangeRate',
        createRFQ: '/rfq/createRFQ',
        getDealRequests:'/rfq/getDealRequests',
        fetchCustomerInfo: '/rfq/fetchAccountDetails/',
        getAllExchangeRates:'/rfq/getAllExchangeRates',
        ammendRate:'/rfq/updateRate',
        retryPostDealCode:'/rfq/retryPostDealCode',
        validateAmount: '/rfq/validateAmount',
        checkAvailability:'/rfq/checkAvailability',
        updateSchedule:'/rfq/updateSchedule',
        fetchSchedule:'/rfq/fetchSchedule',
        fetchAmountThreshold:'/rfq/fetchAmountConfiguration',
        updateAmountThreshold:'/rfq/updateAmountConfiguration',
        fetchBranches:'/rfq/fetchBranches',
      },
      dashboard:{
       fetchDashStats: '/dashboard/fetchDashStats'
      }
    }
    ,websocketUrl:{
      baseUrl: 'http://localhost:9072/rfqService/ws/notifications',
    //SIT
    // baseUrl: 'http://10.0.1.209:9072/rfqService/ws/notifications',
    }
}
