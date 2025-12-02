export default {
    apiUrl: {
        baseUrl: 'http://localhost:9090/cobsService/api/v1',
        // baseUrl: 'http://172.16.20.112:9091/cobsService/api/v1',
        // baseUrl: 'http://172.16.19.174/cobsService/api/v1',
        //SIT
        // baseUrl: 'http://172.16.20.214:9095/cobsService/api/v1',
        // UAT
        //    baseUrl: 'https://coopsokouat.co-opbank.co.ke/cobsService/api/v1',
        // baseUrl: 'http://172.16.20.65:9095/cobsService/api/v1',
        //PRE-PROD
        //    baseUrl: 'http://172.16.20.64:9095/cobsService/api/v1',
        //PROD
        //    baseUrl: 'https://coopbanksoko.co-opbank.co.ke/cobsService/api/v1',
        auth: {
            login: '/auth/authenticate',
            validateOtp: '/auth/validateOtp',
            logout: '/user/logout',
            activateUser: '/auth/activate/user',
            forgotPassword: '/auth/forgotPassword',
            resetPassword: '/auth/resetPassword',
        },
        audit:{
          fetchHistory: '/user/read/auditRecords'
        }
        ,farmer: {
            upload:'/farmer/upload/create',
            getFarmerFiles:'/farmer/files/read',
            approveFile:'/farmer/upload/approve',
            getFarmers:'/farmer/read',
            getFarmersUpdates:'/farmer/update/read',
            editFarmers:'/farmer/edit',
            getOrganizationFarmers: '/farmer/orgFarmers/read'
        }
        ,produce:{
            upload:'/farmer/delivery/upload/create',
            getProduceFiles:'/farmer/delivery/files/read',
            approveFile:'/farmer/delivery/upload/approve',
            getProduce:'/farmer/delivery/read',
        },
        dashboard:{
            getStats:'/dashboard/getStats'
        },
        file:{
            downloadTemplate:'/file/template/download',
            downloadFile:'/file/download/',
            downloadCreditLimitFiles:'/file/limitRequests/download/'
        },
        user:{
            getUsers: '/user/read',
            getUserUpdates: '/user/updates/read',
            createUser:'/user/create',
            editUser:'/user/edit',
            fetchAuditRecord: '/user/fetch/auditRecord'

        },
        approvals:{
            approveEntity:'/approvals/approve',
        },
        organization:{
            getOrganizations:'/organization/read',
            getOrganizationUpdates:'/organization/updates/read',
            getOrganizationTypes:'/organization/types/read',
            getOrganizationTypesUpdates:'/organization/types/updates/read',
            createOrganization:'/organization/create',
            editOrganization:'/organization/edit',
            createOrganizationTypes:'/organization/types/create',
            editOrganizationTypes:'/organization/types/edit',
            fetchCounties: '/organization/fetchCounties',
            fetchSubCounties: '/organization/fetchSubCounties',
            fetchWards: '/organization/fetchWards',
            getOrganizationsByOrgType:'/organization/fetchOrgsByOrgType',
            fetchOrgAccountDetails:'/organization/fetchOrgAccountDetails',
        },
        roles:{
            getRolesPerOrganizations:'/user/organization/roles',
            getRoles:'/user/roles/read',
            getRoleUpdates:'/user/roles/updates/read',
            createRoles:'/user/roles/create',
            editRoles:'/user/roles/edit'
        },
        permissions:{
            getPermissionsPerRole:'/user/roles/permissions',
            getPermissions:'/user/permissions/read',
            createPermission:'/user/permissions/create',
        },
        payment:{
            getPaymentInstitutions:'/organization/fetchPaymentInstitutions',
            validateAccounts:'/payments/validateAccounts',
        }
        ,
        supplier:{
            getOrgFinProducts:'/supplier/getOrgInpProducts',
            getProductConfigs:'/supplier/getAvailableInpProducts',
            actionFarmInputs: '/supplier/farmInputs',
            getVoucherDetails:'/supplier/voucherDetails/read',
            initiateFarmerTopup:'/supplier/farmerTopup/initiate',
            checkVoucherStatus: '/supplier/checkVoucherStatus',
            sendFarmerOTP:'/supplier/farmerConsent/send',
            paySupplier:'/supplier/farmInput/pay',
            getVoucherTransactionDetails:'/supplier/getVoucherTransactions',

        },

        credit:{
            getLoanTypes:'/credit/loanTypes/read',
            actionLoanTypes:'/credit/loanTypes/create',
            getChargeTariffs:'/credit/chargeTariffs/read',
            getChargeTariffConfigs:'/credit/chargeTariffs/configs',
            createChargeTariffs:'/credit/chargeTariffs/create',
            getCreditLimitRequests:'/credit/limitRequest/read',
            getLimitBorrowingOrgs:'/credit/limitRequests/borrowers/read',
            getLimitRequestsPerBorrower:'/credit/borrower/limitRequest/read',
            createCreditLimitRequest:'/credit/limitRequest/create',
            getLoanTypesByLender:'/credit/lender/loanTypes/read',
            getCreditLimits:'/credit/creditLimits/read',
            fetchLenderCreditRequests:'/credit/lender/limitRequest/read',
            createCreditLimit:'/credit/creditLimits/create',
            fetchLoanRequests:'/credit/farmer/loanRequests/read',
            fetchBorrowerCreditLimits: '/credit/borrower/creditLimits/read',
            fetchFarmerFCSLimits:'/credit/fetchFarmerLimits',
            applyFarmerLoan:'/credit/farmer/applyLoan',
            validateFarmerCode:'/credit/farmer/loan/validateCode',
            sendValidationCode:'/credit/farmer/loan/sendValidationCode',
            fetchFarmerLimitReport: '/credit/farmer/loanLimitReport/read',
            fetchFCSLimitReport:'/credit/loanLimitReport/read'
        }
    }
}