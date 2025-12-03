export default {
    apiUrl: {
        baseUrl: 'http://localhost:9072/rfqService/api/v1',
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
        getUsers: '/user/read',
      },
      approvals:{
        approveEntity:'/approvals/approve',
      },
      roles:{
        getRoles:'/user/roles/read',
        createRoles:'/user/roles/create',
      },

    }
}
