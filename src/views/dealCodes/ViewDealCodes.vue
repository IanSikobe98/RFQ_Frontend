<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'
import store from '@/store'
import { prettyDate } from '@/util/filters'
import DealChatModal from '@/components/DealChatModal.vue'   // ← NEW

export default {
  components: { AppLoader, DataTable, DealChatModal },       // ← DealChatModal registered
  data() {
    return {
      tableReady: false,
      permissions: [],
      user: {},
      isUserTeller: false,
      isUserDealer: false,
      tabs: ['Active', 'Pending'],
      activeTab: 'Active',
      accounts: [],
      accountInfo: {},
      customerInfo: {},
      users: [],
      dealRequests: [],
      pendingDealRequests: [],
      pendingDealerRequests: [],
      pendingTellerRequests: [],
      pendingNegotiationRequests: [],
      showEnableModal: false,
      showDisableModal: false,
      showCreateDealModal: false,
      showCustomerModal: false,
      showTellerModal: false,
      showCustomerDetailsModal: false,
      showTellerDetailsModal: false,
      showCreateRFQModal: false,
      showApproveModal: false,
      showRejectModal: false,
      showRetryModal: false,
      loading: false,
      comment: '',
      rfqComment: '',
      currency: '',
      selectedAccount: '',
      purpose: '',
      bankDirection: '',
      strongerCurrency: '',
      weakerCurrency:'',
      directionCurrency: '',
      amountCurrency:'',
      updateRateBankDirection: '',
      updateExpectedValue: '',
      amount: '',
      action: '',
      negotiatedRate: '',
      errors: {},
      idType: '',
      idNumber: '',
      idNumberValue: '',
      idTypeValue: '',
      rateFrom: '',
      multiplyDivide: '',
      multiplyDivideSign: '',
      rateTo: '',
      rateValue: '',
      expectedValue: '',
      expectedCurrency: '',
      sourceAccCurrency: '',
      useCurrentRate: true,
      isCustomer: false,
      useNegotiatedRate: false,
      useUpdateNegotiatedRate: false,
      useUpdateCurrentRate: false,
      showDealDetailsModal: false,
      showAmmendRateModal: false,
      showTreasuryProposalModal: false,
      showDealAcceptedModal: false,
      showNegotiationModal: false,
      showDealChatModal: false,
      offerRate: '',
      proposedRate: '',
      dealerComment: '',
      negotiatiationComment: '',
      dealCode: '',
      thresholdAmount: '',
      availability: true,
      valueDate: new Date().toISOString().split('T')[0],
      options: [
        { id: 'COR',   name: 'Certificate of Registration' },
        { id: 'NATID', name: 'National id' },
        { id: 'ACCNO', name: 'Account Number' }
      ],
      filteredCurrencyOptions: [],
      currencyOptions: [
        { id: 'USD', name: 'United States Dollar' },
        { id: 'KES', name: 'Kenyan Shilling' },
        { id: 'EUR', name: 'Euro' },
        { id: 'GBP', name: 'British Pound Sterling' },
      ],
      row: {}
    }
  },
  computed: {
    columns() {
      const vm = this
      const cols = [
        { title: 'Customer Name',  data: 'customerName' },
        { title: 'Account Number', data: 'accountNumber' },
        {
          title: 'Amount', data: null,
          render: function (data, type, row) {
            return `${row.amountCurrency} ${Number(row.counterNominalAmount)
              .toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
          }
        },
        { title: 'Currency Pair', data: 'currencyPair' },
        {
          title: 'Bank direction', data: null,
          render: function (row) { return `${row.buySell}  ${row.strongCurrency}` }
        },
        {
          title: 'Request Date', data: 'requestDate',
          render: function (data) {
            var a = new Date(data)
            return a.toLocaleString()
          }
        },
        { title: 'Value Date',      data: 'valueDate' },
        { title: 'Negotiated Rate', data: 'negotiatedRate' },
        {
          title: 'Deal Status', data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Accepted</span>`
            if (id === 0) return `<span class="badge bg-danger">Inactive</span>`
            if (id === 3) return `<span class="badge bg-danger">Failed</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            if (id === 8) return `<span class="badge bg-purple">Active</span>`
            if (id === 9) return `<span class="badge bg-warning">Pending</span>`
            if (id === 10) return `<span class="badge bg-warning">Pending</span>`
            if (id === 14) return `<span class="badge bg-dark">Expired</span>`
            return `<span class="badge bg-primary">${data.statusName}</span>`
          }
        }
      ]

      cols.push({
        title: 'Actions', data: null, orderable: false, searchable: false,
        render: function (data, type, row) {
          const disabled = vm.availability === true? '' :'disabled'
          if (row.status.statusId === 8) {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat " data-id="${row.id}">View chat</button>
           <button class="btn btn-sm btn-warning dt-view viewRate" data-id="${row.id}" ${disabled}><i class="fas fa-eye me-2"></i>View Rate</button>`
          } else if (row.status.statusId === 1) {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat " data-id="${row.id}">View chat</button>
             <button class="btn btn-sm btn-success dt-approve" data-id="${row.id}">View Deal</button>`
          } else if (row.status.statusId === 7) {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat " data-id="${row.id}">View chat</button>
                   <button class="btn btn-sm btn-dark dt-noAction" data-id="${row.id}">No Action</button>`
          } else if (row.status.statusId === 3) {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat " data-id="${row.id}">View chat</button>
              <button class="btn btn-sm btn-dark dt-retry" data-id="${row.id}">Retry</button>`
          }
          else if (row.status.statusId === 14) {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat " data-id="${row.id}">View chat</button>
              <button class="btn btn-sm btn-dark dt-noAction" data-id="${row.id}">No Action</button>`
          }
          else {
            return `<button class="btn btn-sm btn-warning me-1 dt-viewChat disabled" data-id="${row.id}">View chat</button>
                 <button class="btn btn-sm btn-secondary dt-awaiting" data-id="${row.id}">Awaiting...</button>`
          }
        }
      })

      cols.push(
        { title: 'Deal Code',    data: 'dealerCode' },
        { title: 'Dealer',       data: 'dealerId' },
        { title: 'Order Number', data: 'orderId' },
        { title: 'Initiator',    data: 'tellerId' },
        { title: 'Branch',    data: 'branchId.branchName' }
      )
      return cols
    },

    dealerColumns() {
      const canApprove = this.canApproveDealCodeRequests
      // const availability = this.isWithinOperatingHours
      const vm = this
      console.log("avail col",this.availability)
      const cols = [
        { title: 'Order Number',   data: 'orderId' },
        { title: 'Customer Name',  data: 'customerName' },
        { title: 'Account Number', data: 'accountNumber' },
        { title: 'Currency Pair',  data: 'currencyPair' },
        {
          title: 'Amount', data: null,
          render: function (data, type, row) {
            return `${row.amountCurrency} ${Number(row.counterNominalAmount)
              .toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
          }
        },
        {
          title: 'Bank direction', data: null,
          render: function (row) { return `${row.buySell}  ${row.strongCurrency}` }
        },
        {
          title: 'Request Date', data: 'requestDate',
          render: function (data) {
            var a = new Date(data)
            return a.toLocaleString()
          }
        },
        {
          title: 'Deal Status', data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Accepted</span>`
            if (id === 0) return `<span class="badge bg-danger">Inactive</span>`
            if (id === 3) return `<span class="badge bg-danger">Failed</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            if (id === 8) return `<span class="badge bg-purple">Active</span>`
            if (id === 9) return `<span class="badge bg-warning">Pending</span>`
            if (id === 10) return `<span class="badge bg-orange">Negotiating</span>`
            if (id === 14) return `<span class="badge bg-dark">Expired</span>`
            return `<span class="badge bg-primary">${data.statusName}</span>`
          }
        }
      ]

      if (canApprove) {
        cols.push({
          title: 'Actions', data: null, orderable: false, searchable: false,
          render: function (data, type, row) {
            if (row.status.statusId === 9) {
              const disabled = vm.availability === true? '' :'disabled'
              return `
                <button class="btn btn-sm btn-dark dt-view viewDetails" data-id="${row.id}"><i class="fas fa-eye me-2"></i>View</button>
                <button class="btn btn-sm btn-warning me-1 dt-edit pickDeal" data-id="${row.id}" ${disabled}>Pick Deal</button>`
            } else if (row.status.statusId === 10) {
              const disabled = vm.availability === true? '' :'disabled'
              return `
                <button class="btn btn-sm btn-dark dt-view viewDetails" data-id="${row.id}"><i class="fas fa-eye me-2"></i>View</button>
                <button class="btn btn-sm btn-warning me-1 dt-edit ammendDeal" data-id="${row.id}" ${disabled}>Ammend Deal</button>`
            } else if (row.status.statusId === 8) {
              return `<button class="btn btn-sm btn-dark dt-view viewDetails" data-id="${row.id}"><i class="fas fa-eye me-2"></i>View</button>`
            } else {
              return ''
            }
          }
        })
      }
      return cols
    },

    updateUser() { return updateUser },
    canCreateDealCodeRequests() {return this.hasPerm('CREATE_DEAL_REQUESTS') },
    isWithinOperatingHours() {
      console.log("avail",this.availability)
      return this.availability === true;
      // return  true
    },
    canApproveDealCodeRequests() { return this.hasPerm('APPROVE_DEAL_REQUESTS') }
  },

  mounted() {
    this.user = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    this.role = this.user?.role
    this.isUserTeller = this.isTeller()
    this.isUserDealer = this.isDealer()
    this.tableReady = true
    this.validateAvailabiltySchedule();
    if (this.isUserTeller) this.fetchDealRequests()
    if (this.isUserDealer) this.fetchPendingDealRequests()
  },

  methods: {
    prettyDate,
    hasPerm(permission) { return this.permissions && this.permissions.includes(permission) },
    isTeller() { return this.role === config.TELLER_ROLE_NAME },
    isDealer() { return this.role === config.DEALER_ROLE_NAME },

    openDealChat(row) {
      this.row = row
      // this.showNegotiationModal = false   // close the negotiation modal first
      this.showDealChatModal = true
    },
    closeDealChat() {
      this.showDealChatModal = false
    },
    handleChatAction({ action }) {
      this.showDealChatModal = false
      if (action === 'accept' || action === 'reject') {
        this.fetchDealRequests()
        if (this.isUserDealer) this.fetchPendingDealRequests()
      }
    },

    filterCurrencyOptions() {
      if (this.selectedAccount) {
        this.sourceAccCurrency = this.selectedAccount?.currency
        this.filteredCurrencyOptions = this.currencyOptions.filter(
          (currency) => currency.id !== this.sourceAccCurrency
        )
        this.checkBankDirection()
      }
    },
    editUsers(item) {
      localStorage.setItem('selectedUser', JSON.stringify(item))
      this.$router.push('/updateUser')
    },
    showEnableDialog(row)  { this.comment = ''; this.row = row; this.showEnableModal = true },
    showDisableDialog(row) { this.comment = ''; this.row = row; this.showDisableModal = true },
    showCreateDealDialog() { this.showCreateDealModal = true },
    showCustomerModalDialog() {
      this.showCreateDealModal = false
      this.showCustomerModal = true
      this.isCustomer = true
      this.idType = ''
      this.idNumber = ''
    },
    showTellerModalDialog() {
      this.showCreateDealModal = false
      this.showTellerModal = true
      this.idType = 'ACCNO'
      this.isCustomer = false
    },
    showCustomerDetailsModalDialog() {
      this.showCustomerModal = false
      this.showCustomerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },
    showTellerDetailsModalDialog() {
      this.showTellerModal = false
      this.showTellerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },
    showCreateRFQModalDialog() {
      this.showCreateRFQModal = true
      this.showTellerDetailsModal = false
      this.showCustomerDetailsModal = false
      this.selectedAccount = ''
      this.action = ''
      this.currency = ''
      this.amount = ''
      this.negotiatedRate = ''
      this.valueDate = new Date().toISOString().split('T')[0]
      this.purpose = ''
      this.rfqComment = ''
      this.expectedValue = ''
      this.rateFrom = ''
      this.rateValue = ''
      this.rateTo = ''
      this.bankDirection = ''
      this.directionCurrency = ''
      this.expectedValue = ''
      this.expectedCurrency = ''
    },
    enableRecord(row)  { this.changeStatus(row, '1') },
    disableRecord(row) { this.changeStatus(row, '0') },

    validateForm() {
      this.errors = {}
      if (!this.selectedAccount) this.errors.selectedAccount = '*Account is required.'
      if (!this.action)          this.errors.action = '*Kindly state if it is credit or a Debit.'
      if (!this.currency)        this.errors.currency = '*Kindly Input Currency.'
      if (!this.amount) {
        this.errors.amount = '*Amount is required.'
      } else if (!config.CURRENCY_REGEX.test(this.amount)) {
        this.errors.amount = '*Amount is invalid'
      }
      else if(this.selectedAccount && this.selectedAccount.requiresLimit && this.amount < Number(this.thresholdAmount)){
        this.errors.amount = '*Amount should be greater than '+this.thresholdAmount +' '+this.amountCurrency
      }
      if (!this.valueDate) this.errors.purpose = '*Purpose is required.'
      if (!this.purpose) {
        this.errors.purpose = '*Purpose is required.'
      }
      else if(this.purpose.length<10){
        this.errors.purpose = '*Minimum 10 characters required.'
      }
      if (!this.rfqComment) {
        this.errors.rfqComment = '*Comments is required.'
      }
      else if(this.rfqComment.length<10){
        this.errors.rfqComment = '*Minimum 10 characters required.'
      }
      return Object.keys(this.errors).length === 0
    },
    validateEnterRateForm() {
      this.errors = {}
      if (!this.proposedRate) {
        this.errors.proposedRate = '*proposed rate is required.'
      } else if (!config.CURRENCY_REGEX.test(this.proposedRate)) {
        this.errors.proposedRate = '*Proposed rate is invalid'
      }
      if (!this.dealerComment) {
        this.errors.dealerComment = '*Comments is required.'
      }
      else if(this.dealerComment.length<10){
        this.errors.dealerComment = '*Minimum 10 characters required.'
      }
      return Object.keys(this.errors).length === 0
    },
    validateNegotiationForm() {
      this.errors = {}
      if (!this.negotiatiationComment) {
        this.errors.negotiatiationComment = '*Negotiation Comment is required.'
      }
      else if(this.negotiatiationComment.length<10){
        this.errors.negotiatiationComment = '*Minimum 10 characters required.'
      }
      return Object.keys(this.errors).length === 0
    },

    submitDealRateRequest() {
      if (!this.validateForm()) return
      this.loading = true
      const counterCurrency = this.currency.id
      const accountCurrency = this.selectedAccount.currency
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.createRFQ
      axios.post(url, {
        customerNo: this.selectedAccount?.customerCif,
        customerName: this.selectedAccount?.accountName,
        idNumber: this.customerInfo?.idNumber,
        amount: this.amount,
        fromCurrency: accountCurrency,
        toCurrency: counterCurrency,
        strongCurrency: this.strongerCurrency,
        weakCurrency: this.weakerCurrency,
        amountCurrency:this.amountCurrency,
        accountNumber: this.selectedAccount?.accountNumber,
        valueDate: this.valueDate,
        tellerAccountName: !this.isCustomer ? this.selectedAccount?.accountName : '',
        purpose: this.purpose,
        comments: this.rfqComment,
        branchCode: this.selectedAccount?.branchCode,
        treasuryRate: this.rateValue,
        bankDirection: this.bankDirection
      }).then((response) => {
        const { responseCode, responseMessage } = response.data
        if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
          Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          return
        }
        Swal.fire({ icon: 'success', title: 'Success!', text: responseMessage, timer: 3000,
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
        this.fetchDealRequests()
      }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during Deal Code Request Creation',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => {
        this.loading = false
        this.showEnableModal = false
        this.showDisableModal = false
        this.showCreateRFQModal = false
      })
    },

    ammendRateRequest() {
      if (!this.validateEnterRateForm()) return
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.ammendRate
      axios.post(url, { orderId: this.row?.id, rate: this.proposedRate, comment: this.dealerComment, expectedCurrency: this.expectedCurrency })
        .then((response) => {
          const { responseCode, responseMessage } = response.data
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          Swal.fire({ icon: 'success', title: 'Success!', text: responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          this.fetchPendingDealRequests()
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during the update of rate for the order selected',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => {
        this.loading = false
        this.showEnableModal = false
        this.showDisableModal = false
        this.showCreateRFQModal = false
        this.showAmmendRateModal = false
      })
    },

    fetchThresholdAmount() {
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.validateAmount
      axios.post(url, { amount: this.amount, currency: this.amountCurrency ,bankDirection:this.bankDirection })
        .then((response) => {
          const { responseCode, responseMessage,entity } = response.data
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          }
          this.thresholdAmount = entity
          console.log("threshold Amount",this.thresholdAmount)
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during the update of rate for the order selected',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })

        }).finally(() => {
        this.loading = false
      })
    },

    validateAvailabiltySchedule() {
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.checkAvailability
      axios.post(url)
        .then((response) => {
          const { responseCode, responseMessage,entity } = response.data
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          }
          this.availability = entity
          console.log("availability",this.availability)
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during the update of rate for the order selected',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })

      }).finally(() => {
        this.loading = false
      })
    },

    fetchDealRequests() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getDealRequests
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`
      axios.post(url, { page: 0, size: 10 })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          this.dealRequests = data.data
          //filter to view only items of people in my branch
          this.dealRequests = this.dealRequests.filter(d => d.branchId?.branchName === this.user?.user?.branchId?.branchName)
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Deal Requests',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => { this.loading = false })
    },

    fetchPendingDealRequests() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getDealRequests
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`
      axios.post(url, { page: 0, size: 10, statuses: [8, 9, 10] })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          this.pendingDealRequests = data.data
          this.pendingDealerRequests = this.pendingDealRequests.filter(d => d.status.statusId === 9)
          this.pendingTellerRequests = this.pendingDealRequests.filter(d => d.status.statusId === 8)
          this.pendingNegotiationRequests = this.pendingDealRequests.filter(d => d.status.statusId === 10)
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Deal Requests',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => { this.loading = false })
    },

    validateAccountsForm() {
      this.errors = {}
      if (!this.idNumber) this.errors.idNumber = '*Id Number is required.'
      if (this.isCustomer && !this.idType) this.errors.idType = '*Id Type is required.'
      return Object.keys(this.errors).length === 0
    },

    fetchAccounts(isCustomer) {
      if (!this.validateAccountsForm()) return
      this.isCustomer = isCustomer
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchAccounts
      axios.post(url, { option: this.idType?.id, customer: isCustomer, identificationNumber: this.idNumber })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          Swal.fire({ icon: 'success', title: 'Success!', text: data.responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          this.accounts = data?.entity?.accounts
          this.customerInfo = data?.entity
          if (isCustomer) this.showCustomerDetailsModalDialog()
          else this.showTellerDetailsModalDialog()
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Accounts',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => { this.loading = false })
    },

    changeCounterCurrency(){
      this.amountCurrency = ''
      this.rateFrom = ''
      this.rateTo = '';
      this.expectedValue = ''
      this.expectedCurrency = ''
      this.checkBankDirection();
    },

    checkBankDirection() {
      if (this.currency && this.selectedAccount && this.action) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getCurrencyDirection
        const counterCurrency = this.currency.id
        const accountCurrency = this.selectedAccount.currency
        let fromCurrency = accountCurrency, toCurrency = counterCurrency
        if (this.action === 'CREDIT') { fromCurrency = counterCurrency; toCurrency = accountCurrency }
        axios.post(url, { fromCurrency, toCurrency })
          .then((response) => {
            const data = response.data
            if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
              Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
                customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
              return
            }
            Swal.fire({ icon: 'success', title: 'Success!', text: data.responseMessage, timer: 3000,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            this.bankDirection = data?.entity

            // Rule 1: IF TO_CURRENCY IS STRONGER, THE BANK IS SELLING
            // Rule 2: IF FROM_CURRENCY IS WEAKER, THE BANK IS SELLING
            // Rule 3: IF TO_CURRENCY IS WEAKER, THE BANK IS BUYING
            // Rule 4: IF FROM_CURRENCY IS STRONGER, THE BANK IS BUYING
            if(this.bankDirection === "Buy"){
              this.strongerCurrency = fromCurrency
              this.weakerCurrency = toCurrency
            }
            else{
              this.strongerCurrency = toCurrency
              this.weakerCurrency = fromCurrency
            }
            this.directionCurrency = this.bankDirection +" "+ this.strongerCurrency
            this.fetchExchangeRates()
          }).catch(() => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred checking bank direction',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
        }).finally(() => { this.loading = false })
      }
    },

    fetchExchangeRates() {
      if (this.currency && this.selectedAccount && this.action && this.amount && this.amountCurrency) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getSinglePairExchangeRate
        const counterCurrency = this.currency.id
        const accountCurrency = this.selectedAccount.currency
        axios.post(url, {
          fromCurrency: counterCurrency, toCurrency: accountCurrency,
          account: this.selectedAccount.accountNumber, transactionAmount: this.amount
        }).then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          Swal.fire({ icon: 'success', title: 'Success!', text: data.responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          // if (this.bankDirection === 'Sell') {
          //   this.rateValue = data.entity?.sellingRate
          //   if (this.action === 'CREDIT') { this.rateFrom = accountCurrency; this.rateTo = counterCurrency; this.multiplyDivide = 'D' }
          //   else if (this.action === 'DEBIT') { this.rateFrom = counterCurrency; this.rateTo = accountCurrency; this.multiplyDivide = 'M' }
          // } else if (this.bankDirection === 'Buy') {
          //   this.rateValue = data.entity?.buyingRate
          //   if (this.action === 'CREDIT') { this.rateFrom = counterCurrency; this.rateTo = accountCurrency; this.multiplyDivide = 'M' }
          //   else if (this.action === 'DEBIT') { this.rateFrom = accountCurrency; this.rateTo = counterCurrency; this.multiplyDivide = 'D' }
          // }


          if (this.bankDirection === 'Sell') {
            this.rateValue = data.entity?.sellingRate
          } else if (this.bankDirection === 'Buy') {
            this.rateValue = data.entity?.buyingRate
          }

          console.log("this.strongerCurrency",this.strongerCurrency)
          console.log("this.weakerCurrency",this.weakerCurrency)
          console.log("acc",accountCurrency)
          console.log("wee",counterCurrency)

          //determine current rate values
          if(accountCurrency === this.strongerCurrency ){
            this.rateFrom = accountCurrency
            this.rateTo = counterCurrency
          }
          else if(counterCurrency  === this.strongerCurrency){
            this.rateFrom = counterCurrency
            this.rateTo = accountCurrency
          }

          //Determine if multiply or divide based on whether the currency selected is multi[ply or divide
          //Set expected value for weaker and stronger currency
          if(this.amountCurrency === this.strongerCurrency){
            this.multiplyDivide = 'M'
            this.expectedCurrency = this.weakerCurrency

          }
          else{
            this.multiplyDivide = 'D'
            this.expectedCurrency = this.strongerCurrency
          }

          this.expectedValue = this.multiplyDivide === 'M'
            ? Number(this.amount * this.rateValue).toFixed(2)
            : Number(this.amount / this.rateValue).toFixed(2)
          this.useCurrentRate = true
          this.useNegotiatedRate = false
          this.fetchThresholdAmount();
        }).catch(() => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Exchange rates',
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
        }).finally(() => { this.loading = false })
      }
    },

    displayNegotiatedRate() {
      if(this.row.amountCurrency === this.row.strongCurrency){
        this.updateExpectedValue = this.row?.counterNominalAmount * this.proposedRate
      }
      else{
        this.updateExpectedValue = this.row?.counterNominalAmount / this.proposedRate
      }
      this.updateExpectedValue = Number(this.updateExpectedValue).toFixed(2)
      this.useUpdateCurrentRate = false
      this.useUpdateNegotiatedRate = true
    },

    updateBankDirection() {
      // this.loading = true

      //Determine if multiply or divide based on whether the currency selected is multi[ply or divide
      //Set expected value for weaker and stronger currency
      if(this.row.amountCurrency === this.row.strongCurrency){
        this.multiplyDivide = 'M'
        this.expectedCurrency = this.row.weakCurrency

      }
      else{
        this.multiplyDivide = 'D'
        this.expectedCurrency = this.row.strongCurrency
      }

      this.updateExpectedValue = this.multiplyDivide === 'M'
        ? Number(this.row?.counterNominalAmount * this.row?.treasuryRate).toFixed(2)
        : Number(this.row?.counterNominalAmount / this.row?.treasuryRate).toFixed(2)

          this.useUpdateCurrentRate = true
          this.useUpdateNegotiatedRate = false
      // const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getCurrencyDirection
      // axios.post(url, { fromCurrency: this.row?.fromCurrency, toCurrency: this.row?.toCurrency })
      //   .then((response) => {
      //     const data = response.data
      //     if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
      //       Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
      //         customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      //       return
      //     }
      //     this.updateRateBankDirection = data?.entity
      //     if (this.updateRateBankDirection === 'Sell') {
      //       this.updateExpectedValue = Number(this.row?.counterNominalAmount / this.row?.treasuryRate).toFixed(2)
      //     } else if (this.updateRateBankDirection === 'Buy') {
      //       this.updateExpectedValue = Number(this.row?.counterNominalAmount * this.row?.treasuryRate).toFixed(2)
      //     }
      //     this.useUpdateCurrentRate = true
      //     this.useUpdateNegotiatedRate = false
      //   }).catch(() => {
      //   Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Direction',
      //     customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      // }).finally(() => { this.loading = false })
    },

    showApproveDialog(row)  { this.comment = ''; this.row = row; this.showApproveModal = true },
    showRetryDialog(row)    { this.row = row; this.showRetryModal = true },
    showRejectionDialog(row){ this.comment = ''; this.row = row; this.showRejectModal = true },

    showNegotiationDialog(row) {
      this.comment = ''
      this.negotiatiationComment = ''
      this.row = row
      this.showTreasuryProposalModal = false
      this.showNegotiationModal = true
    },
    showAmmendRateDialog(row) {
      this.comment = ''
      this.dealerComment = ''
      this.proposedRate = this.row?.negotiated_rate
      this.row = row
      this.showAmmendRateModal = true
      this.offerRate = this.row?.treasuryRate
      this.updateBankDirection()
    },
    showDealAcceptedDialog(row) {
      this.showDealAcceptedModal = true
      this.row = row
      if (!this.dealCode) this.dealCode = this.row?.dealerCode
    },
    showDetailsDialog(row) {
      this.row = row
      this.fetchCustomerInformation()
      this.comment = ''
      this.showDealDetailsModal = true
    },
    showTreasuryProposalDialog(row) { this.row = row;
      this.comment = '';
      this.showTreasuryProposalModal = true
      if(this.row.amountCurrency === this.row.strongCurrency){
        this.multiplyDivideSign = '*'
      }
      else{
        this.multiplyDivideSign = '/'
      }
    },

    approveRecord(row)   { this.approveOrReject(row, 'APPROVE') },
    rejectRecord(row)    { this.approveOrReject(row, 'REJECT') },
    negotiateRecord(row) { if (this.validateNegotiationForm()) this.approveOrReject(row, 'NEGOTIATE') },

    approveOrReject(row, action) {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.approvals.approveEntity
      const comment = action === 'NEGOTIATE' ? this.negotiatiationComment : this.comment
      axios.post(url, { ids: [this.row?.id], action, description: comment, approvalType: 'APPROVED_DEALS' })
        .then((response) => {
          const { responseCode, responseMessage, entity } = response.data
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          Swal.fire({ icon: 'success', title: 'Success!', text: responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          if (action === 'APPROVE') { this.dealCode = entity?.dealCode; this.showDealAcceptedDialog(this.row) }
          this.fetchDealRequests()
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during Deal Request Approval',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => {
        this.loading = false
        this.showTreasuryProposalModal = false
        this.showNegotiationModal = false
        if (action === 'APPROVE') this.showApproveModal = false
        else this.showRejectModal = false
      })
    },

    retryPostDealCode() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.retryPostDealCode
      axios.post(url, { id: this.row?.id })
        .then((response) => {
          const { responseCode, responseMessage, entity } = response.data
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          Swal.fire({ icon: 'success', title: 'Success!', text: responseMessage, timer: 3000,
            customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
          this.dealCode = entity?.dealCode
          this.showDealAcceptedDialog(this.row)
          this.fetchDealRequests()
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'An error occurred during Deal Request Retry',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => { this.loading = false; this.showRetryModal = false })
    },

    fetchCustomerInformation() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchCustomerInfo + this.row?.accountNumber
      axios.post(url)
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
            return
          }
          this.accountInfo = data?.entity
        }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred posting deal code',
          customClass: { confirmButton: 'btn btn-success px-4 me-2', cancelButton: 'btn btn-secondary px-4' } })
      }).finally(() => { this.loading = false })
    }
  }
}
</script>

<template>
  <!-- Loader -->
  <div>
    <AppLoader v-if="loading" />
  </div>

  <div class="main-content-wrapper">
    <!-- Teller table -->
    <div v-if="isUserTeller" class="row">
      <div class="col-sm-12">
        <div class="table-card">
          <div class="table-header">
            <div>
              <h4 class="table-title">Requested Deals</h4>
              <p class="table-subtitle">Manage and track all forex deal requests</p>
            </div>
            <div class="table-actions">
              <button v-if="canCreateDealCodeRequests"  :disabled="!isWithinOperatingHours" class="create-deal-btn" @click="showCreateDealDialog" >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <span>Create Deal Code</span>
              </button>
            </div>
          </div>
          <div class="table-body">
            <div class="table-responsive">
              <data-table v-if="tableReady" :data="dealRequests" :columns="columns" :isFooter="true" :striped="false"
                          @approve="showDealAcceptedDialog" @view="showTreasuryProposalDialog" @retry="showRetryDialog" @viewChat="openDealChat" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <br />

    <!-- Dealer: New Deal Requests -->
    <div v-if="isUserDealer" class="row">
      <div class="col-sm-12">
        <div class="table-card">
          <div class="table-header">
            <div>
              <h4 class="table-title">New Deal Requests ({{ pendingDealerRequests.length }})</h4>
              <p class="table-subtitle">Manage and track all forex deal requests</p>
            </div>
            <div class="table-actions">
              <button v-if="canCreateDealCodeRequests && isWithinOperatingHours" class="create-deal-btn" @click="showCreateDealDialog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <span>Create Deal Code</span>
              </button>
            </div>
          </div>
          <div class="table-body">
            <div class="table-responsive">
              <data-table v-if="tableReady" :data="pendingDealerRequests" :columns="dealerColumns" :isFooter="true"
                          :striped="false" @edit="showAmmendRateDialog" @view="showDetailsDialog" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <br />

    <!-- Dealer: All Deal Requests (tabbed) -->
    <div v-if="isUserDealer" class="row">
      <div class="col-sm-12">
        <div class="table-card">
          <div class="table-header">
            <div>
              <h4 class="table-title">Deal Requests</h4>
            </div>
            <div class="table-actions">
              <button v-if="canCreateDealCodeRequests && isWithinOperatingHours" class="create-deal-btn" @click="showCreateDealDialog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <span>Create Deal Code</span>
              </button>
            </div>
          </div>
          <div class="table-body">
            <div class="tab-bar">
              <button v-for="tab in tabs" :key="tab" type="button"
                      :class="['tab-btn', { 'tab-btn--active': activeTab === tab }]" @click="activeTab = tab">
<!--                <svg v-if="tab === 'Active'" width="15" height="15" viewBox="0 0 24 24" fill="none">-->
<!--                  <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>-->
<!--                </svg>-->
<!--                <svg v-if="tab === 'Pending'" width="15" height="15" viewBox="0 0 24 24" fill="none">-->
<!--                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>-->
<!--                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>-->
<!--                </svg>-->
                {{ tab }}
                <span v-if="tab === 'Active' && pendingNegotiationRequests.length"
                      :class="['tab-count', { 'tab-count--active': activeTab === tab }]">
                  {{ pendingNegotiationRequests.length }}
                </span>
                <span v-if="tab === 'Pending' && pendingTellerRequests.length"
                      :class="['tab-count', { 'tab-count--active': activeTab === tab }]">
                  {{ pendingTellerRequests.length }}
                </span>
              </button>
<!--              &lt;!&ndash; Animated indicator &ndash;&gt;-->
<!--              <div-->
<!--                class="tab-indicator"-->
<!--                :style="{ transform: activeTab === 'Active' ? 'translateX(0%)' : 'translateX(100%)' }"-->
<!--              ></div>-->
            </div>
            <div v-show="activeTab === 'Active'" class="table-responsive">
              <data-table v-if="tableReady" :data="pendingNegotiationRequests" :columns="dealerColumns"
                          :isFooter="true" :striped="false" @edit="showAmmendRateDialog" @view="showDetailsDialog" />
            </div>
            <div v-show="activeTab === 'Pending'" class="table-responsive">
              <data-table v-if="tableReady" :data="pendingTellerRequests" :columns="dealerColumns"
                          :isFooter="true" :striped="false" @edit="showAmmendRateDialog" @view="showDetailsDialog" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════════ -->
  <!-- Create Deal Modal                                            -->
  <!-- ════════════════════════════════════════════════════════════ -->
  <div v-if="showCreateDealModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Request New Deal</h5>
        <button class="modal-close-btn" @click="showCreateDealModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="modal-question">Is this person a Customer?</p>
        <p class="modal-description">Select whether a person has an existing account with us.</p>
        <div class="choice-grid">
          <button class="choice-card" @click="showCustomerModalDialog()">
            <div class="choice-icon customer">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="choice-label">Yes</div>
            <div class="choice-sublabel">Existing Customer</div>
          </button>
          <button class="choice-card" @click="showTellerModalDialog()">
            <div class="choice-icon teller">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="choice-label">No</div>
            <div class="choice-sublabel">Non Customer</div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Customer Modal -->
  <div v-if="showCustomerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Customer Account Lookup</h5>
        <button class="modal-close-btn" @click="showCustomerModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Search for customer by their identification details</p>
        <b-row class="mb-3">
          <b-col lg="6">
            <b-form-group label="Search By" label-for="search value" label-class="fw-semibold">
              <select v-model="idType" class="form-control modern-select">
                <option v-for="option in options" :key="option" :value="option">{{ option.name }}</option>
              </select>
              <small v-if="errors.idType" class="text-danger">{{ errors.idType }}</small>
            </b-form-group>
          </b-col>
          <b-col lg="6">
            <b-form-group label="Search Value" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" class="modern-input" placeholder="Enter Value"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCustomerModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="fetchAccounts(true)"><i class="fas fa-search me-2"></i>Search</button>
      </div>
    </div>
  </div>

  <!-- Teller Modal -->
  <div v-if="showTellerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Teller Account Lookup</h5>
        <button class="modal-close-btn" @click="showTellerModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <p class="modal-description">Enter the teller account number to proceed</p>
        <b-row class="mb-3">
          <b-col lg="12">
            <b-form-group label="Teller Account Number" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" class="modern-input" placeholder="Enter Teller Account"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showTellerModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="fetchAccounts(false)"><i class="fas fa-search me-2"></i>Search</button>
      </div>
    </div>
  </div>

  <!-- Customer Details Modal -->
  <div v-if="showCustomerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Customer Details</h5>
        <button class="modal-close-btn" @click="showCustomerDetailsModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="customer-card">
          <div class="customer-header">
            <div class="customer-avatar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <h6 class="customer-name">{{ customerInfo?.fullName }}</h6>
              <p class="customer-since">Customer since {{ customerInfo?.joiningYear }}</p>
            </div>
          </div>
          <div class="customer-details">
            <div class="detail-item">
              <label>Customer ID</label><label></label><label>Phone Number</label>
            </div>
            <div class="detail-item">
              <p>{{ customerInfo?.customerCif }}</p><p></p><p>{{ customerInfo?.phoneNumber }}</p>
            </div>
          </div>
          <div class="accounts-section">
            <label class="section-label">Available Accounts</label>
            <div class="accounts-grid">
              <div class="account-badge" v-for="(acc, index) in accounts" :key="index">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M9 3V21" stroke="currentColor" stroke-width="2" />
                </svg>
                <span>{{ acc.accountNumber }} ({{ acc.currency }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCustomerDetailsModal = false">Back</button>
        <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">Continue <i class="fas fa-arrow-right ms-2"></i></button>
      </div>
    </div>
  </div>

  <!-- Teller Details Modal -->
  <div v-if="showTellerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Teller Account Details</h5>
        <button class="modal-close-btn" @click="showTellerDetailsModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="teller-card">
          <div class="teller-details">
            <div class="detail-item">
              <label>Account Name</label><label>Account Number</label><label>Branch Code</label>
            </div>
            <div class="detail-item">
              <p>{{ accounts[0]?.accountName }}</p>
              <p>{{ accounts[0]?.accountNumber }}</p>
              <p>{{ accounts[0]?.branchCode }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showTellerDetailsModal = false">Back</button>
        <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">Continue <i class="fas fa-arrow-right ms-2"></i></button>
      </div>
    </div>
  </div>

  <!-- Create RFQ Modal -->
  <div v-if="showCreateRFQModal" class="modal-backdrop">
    <div class="custom-modal modal-xl">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Create Deal Request</h5>
        <button class="modal-close-btn" @click="showCreateRFQModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label">Select Account <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="selectedAccount" @change="filterCurrencyOptions">
                <option value="">Choose an account</option>
                <option v-for="acc in accounts" :key="acc" :value="acc">{{ acc.accountNumber }} - {{ acc.currency }}</option>
              </select>
              <small v-if="errors.selectedAccount" class="text-danger">{{ errors.selectedAccount }}</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Account Action <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="action" @change="checkBankDirection">
                <option value="">Select action</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
              <small v-if="errors.action" class="text-danger">{{ errors.action }}</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Counter Currency <span class="text-danger">*</span></label>
              <select class="form-select modern-select" v-model="currency" @change="changeCounterCurrency">
                <option value="">Select currency</option>
                <option v-for="option in filteredCurrencyOptions" :key="option" :value="option">{{ option.id }} - {{ option.name }}</option>
              </select>
              <small v-if="errors.currency" class="text-danger">{{ errors.currency }}</small>
            </div>
            <div class="col-md-6"  >
              <label class="form-label">Amount <span class="text-danger">*</span></label>
              <div class="row">
              <div class="col-md-3">
                <select class="form-select modern-select" v-model="amountCurrency" @change="fetchExchangeRates">
                  <option selected v-if="selectedAccount" >{{ selectedAccount.currency }}</option>
                  <option v-if = "currency">{{ currency.id }}</option>
                </select>
              </div>
              <div class="col-md-9">
              <input @change="fetchExchangeRates" type="number" class="form-control modern-input" v-model="amount" placeholder="0.00" />
                </div>
            </div>
              <small v-if="errors.amount" class="text-danger">{{ errors.amount }}</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Bank's Direction</label>
              <input class="form-control modern-input" disabled placeholder="Auto-calculated" v-model="directionCurrency" />
            </div>
            <div class="col-md-6">
              <div class="info-box rate-box">
                <div class="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div>
                  <p class="info-label">Current Rate</p>
                  <p class="info-value" v-if="rateFrom && rateValue && rateTo">1 {{ rateFrom }} = {{ rateValue }} {{ rateTo }}</p>
                  <p class="info-value" v-else>---</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Value Date <span class="text-danger">*</span></label>
              <input type="date" class="form-control modern-input" v-model="valueDate" disabled />
              <small v-if="errors.valueDate" class="text-danger">{{ errors.valueDate }}</small>
            </div>
            <div class="col-md-6">
              <div class="info-box total-box">
                <div class="info-icon success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p class="info-label" v-if="useCurrentRate">Expected Total (Current Rate)</p>
                  <p class="info-label" v-if="useNegotiatedRate">Expected Total (Negotiated Rate)</p>
                  <p class="info-value success">{{ expectedValue }} {{ expectedCurrency }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Purpose <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="2" v-model="purpose" placeholder="Enter transaction purpose"></textarea>
              <small v-if="errors.purpose" class="text-danger">{{ errors.purpose }}</small>
            </div>
            <div class="col-md-12">
              <label class="form-label">Comment <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="3" v-model="rfqComment" placeholder="Add any additional comments or notes"></textarea>
              <small v-if="errors.rfqComment" class="text-danger">{{ errors.rfqComment }}</small>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showCreateRFQModal = false">Cancel</button>
        <button class="btn btn-success px-5" @click="submitDealRateRequest"><i class="fas fa-paper-plane me-2"></i>Submit Request</button>
      </div>
    </div>
  </div>

  <!-- Amend Rate Modal -->
  <div v-if="showAmmendRateModal" class="modal-backdrop">
    <div class="custom-modal modal-md">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Enter Rate - {{ row?.orderId }}</h5>
        <button class="modal-close-btn" @click="showAmmendRateModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <div class="col-md-12">
              <div class="rate-card">
                <div class="row">
                  <div class="col-md-6"><p>Customer:</p><p><b>{{ row?.customerName }}</b></p></div>
                  <div class="col-md-6"><p>Branch:</p><p><b>{{ row?.branchId?.branchName }}</b></p></div>
                </div>
                <div class="row">
                  <div class="col-md-6"><p>Amount:</p><p><b>{{ row?.amountCurrency }} {{ row?.counterNominalAmount }}</b></p></div>
                  <div class="col-md-6"><p>Currency Pair:</p><p><b>{{ row?.currencyPair }}</b></p></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Offer Rate</label>
              <input type="number" class="form-control modern-input" v-model="offerRate" placeholder="0.00" disabled />
            </div>
            <div class="col-md-6">
              <div class="info-box total-box">
                <div class="info-icon success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p class="info-label" v-if="useUpdateCurrentRate">Expected Total (Current Rate)</p>
                  <p class="info-label" v-if="useUpdateNegotiatedRate">Expected Total (Proposed Rate)</p>
                  <p class="info-value success">{{ updateExpectedValue }} {{ this.expectedCurrency }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Proposed Rate <span class="text-danger">*</span></label>
              <input @change="displayNegotiatedRate" type="number" class="form-control modern-input" v-model="proposedRate" placeholder="0.00" />
              <small v-if="errors.proposedRate" class="text-danger">{{ errors.proposedRate }}</small>
            </div>
            <div class="col-md-12">
              <div class="rate-card">
                <p class="form-label"><b>Teller Notes:</b></p>
                <p>{{ row && row.commentsDtoList && row.commentsDtoList.length > 0 ? row.commentsDtoList[row.commentsDtoList.length-1].comment : '' }}</p>
              </div>
            </div>
            <div class="col-md-12">
              <label class="form-label">Treasury Comments <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="3" v-model="dealerComment" placeholder="Add any additional comments or notes"></textarea>
              <small v-if="errors.dealerComment" class="text-danger">{{ errors.dealerComment }}</small>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showAmmendRateModal = false">Cancel</button>
        <button class="btn btn-chat px-3 me-2" @click="openDealChat(row)">
          <i class="fas fa-comments me-2"></i><b>Open Chat</b>
        </button>
        <button class="btn btn-success px-3" @click="ammendRateRequest"><i class="fas fa-paper-plane me-2"></i>Submit Request</button>
      </div>
    </div>
  </div>

  <!-- Treasury Proposal Modal -->
  <div v-if="showTreasuryProposalModal" class="modal-backdrop">
    <div class="custom-modal modal-md">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Treasury Rate Proposal - {{ row?.orderId }}</h5>
        <button class="modal-close-btn" @click="showTreasuryProposalModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <div class="col-md-12">
              <div class="rate-card">
                <div class="row">
                  <div class="col-md-6"><p>Customer:</p><p><b>{{ row?.customerName }}</b></p></div>
                  <div class="col-md-6"><p>Branch:</p><p><b>{{ row?.branchId?.branchName }}</b></p></div>
                </div>
                <div class="row">
                  <div class="col-md-6"><p>Amount:</p><p><b>{{ row?.amountCurrency }} {{ row?.counterNominalAmount }}</b></p></div>
                  <div class="col-md-6"><p>Currency Pair:</p><p><b>{{ row?.currencyPair }}</b></p></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box offer-box">
                <div><p class="info-teller-info">Offer Rate</p><p class="info-value success">{{ row?.treasuryRate }}</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box total-box">
                <div><p class="info-teller-info">Proposed Rate</p><p class="info-value success">{{ row?.negotiatedRate }}</p></div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="info-box total-box">
                <div>
                  <p class="info-teller-info">Expected Total</p>
                  <p class="info-value success">{{ row?.expectedAmount }} {{ row?.expectedCurrency }}</p>
                  <p class="info-teller-info">{{ row?.counterNominalAmount }} {{ row?.amountCurrency }} {{ this.multiplyDivideSign }} {{ row?.negotiatedRate }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="rate-card">
                <p class="form-label"><b>Treasury Notes:</b></p>
                <p>{{ row && row.commentsDtoList && row.commentsDtoList.length > 0 ? row.commentsDtoList[row.commentsDtoList.length-1].comment : '' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-danger px-3" @click="showRejectionDialog(row)"><b><i class="far fa-times-circle me-2"></i>Reject Deal</b></button>
        <button class="btn btn-outline-warning px-3" @click="showNegotiationDialog(row)"><b><i class="far fa-message me-2"></i>Negotiate</b></button>
        <button class="btn btn-success px-3" @click="showApproveDialog(row)"><b><i class="fas fa-check-circle me-2"></i>Accept Deal</b></button>
      </div>
    </div>
  </div>

  <!-- Deal Accepted Modal -->
  <div v-if="showDealAcceptedModal" class="modal-backdrop">
    <div class="custom-modal modal-md">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Deal Accepted - {{ row?.orderId }}</h5>
        <button class="modal-close-btn" @click="showDealAcceptedModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <div class="col-md-12">
              <div class="rate-card">
                <div class="row">
                  <div class="col-md-6"><p>Customer:</p><p><b>{{ row?.customerName }}</b></p></div>
                  <div class="col-md-6"><p>Branch:</p><p><b>{{ row?.branchId?.branchName }}</b></p></div>
                </div>
                <div class="row">
                  <div class="col-md-6"><p>Amount:</p><p><b>{{ row?.amountCurrency }} {{ row?.counterNominalAmount }}</b></p></div>
                  <div class="col-md-6"><p>Currency Pair:</p><p><b>{{ row?.currencyPair }}</b></p></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box offer-box">
                <div><p class="info-teller-info">Offer Rate</p><p class="info-value success">{{ row?.treasuryRate }}</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box total-box">
                <div><p class="info-teller-info">Proposed Rate</p><p class="info-value success">N/A</p></div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="info-box total-box">
                <div><p class="info-teller-info">Deal Code</p><p class="info-value success">{{ dealCode }}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-success px-3" @click="showDealAcceptedModal = false"><b>Close</b></button>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════════ -->
  <!-- Negotiation Modal  ← CHAT BUTTON ADDED HERE                 -->
  <!-- ════════════════════════════════════════════════════════════ -->
  <div v-if="showNegotiationModal" class="modal-backdrop">
    <div class="custom-modal modal-md">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Treasury Rate Proposal - {{ row?.orderId }}</h5>
        <button class="modal-close-btn" @click="showNegotiationModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="rfq-form">
          <div class="row g-4">
            <div class="col-md-12">
              <div class="rate-card">
                <div class="row">
                  <div class="col-md-6"><p>Customer:</p><p><b>{{ row?.customerName }}</b></p></div>
                  <div class="col-md-6"><p>Branch:</p><p><b>{{ row?.branchId?.branchName }}</b></p></div>
                </div>
                <div class="row">
                  <div class="col-md-6"><p>Amount:</p><p><b>{{ row?.amountCurrency }} {{ row?.counterNominalAmount }}</b></p></div>
                  <div class="col-md-6"><p>Currency Pair:</p><p><b>{{ row?.currencyPair }}</b></p></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box offer-box">
                <div><p class="info-teller-info">Offer Rate</p><p class="info-value success">{{ row?.treasuryRate }}</p></div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box total-box">
                <div><p class="info-teller-info">Proposed Rate</p><p class="info-value success">{{ row?.negotiatedRate }}</p></div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="info-box total-box">
                <div>
                  <p class="info-teller-info">Expected Total</p>
                  <p class="info-value success">{{ row?.expectedAmount }} {{ row?.expectedCurrency }}</p>
                  <p class="info-teller-info">{{ row?.counterNominalAmount }} {{ row?.amountCurrency }} {{ this.multiplyDivideSign}} {{ row?.negotiatedRate }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <div class="rate-card">
                <p class="form-label"><b>Treasury Notes:</b></p>
                <p>{{ row && row.commentsDtoList && row.commentsDtoList.length > 0 ? row.commentsDtoList[row.commentsDtoList.length-1].comment : '' }}</p>
              </div>
            </div>
            <div class="col-md-12">
              <label class="form-label">Negotiation Comments <span class="text-danger">*</span></label>
              <textarea class="form-control modern-input" rows="3" v-model="negotiatiationComment"
                        placeholder="Add any additional comments or notes"></textarea>
              <small v-if="errors.negotiatiationComment" class="text-danger">{{ errors.negotiatiationComment }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Footer with Chat button ── -->
      <div class="modal-footer">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showNegotiationModal = false">Cancel</button>

        <!-- ★ NEW: Open Deal Chat button -->
        <button class="btn btn-chat px-3 me-2" @click="openDealChat(row)">
          <i class="fas fa-comments me-2"></i><b>Open Chat</b>
        </button>

        <button class="btn btn-warning px-3" @click="negotiateRecord(row)"><b>Submit Negotiation</b></button>
      </div>
    </div>
  </div>

  <!-- Approve Modal -->
  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Approve Deal Request</h5>
        <button class="modal-close-btn" @click="showApproveModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="modal-question">Approve this deal request?</p>
        <p class="modal-description">You are about to approve order <strong>{{ row?.orderId }}</strong>. This action cannot be undone.</p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showApproveModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="approveRecord(row)"><i class="fas fa-check me-2"></i>Approve</button>
      </div>
    </div>
  </div>

  <!-- Reject Modal -->
  <div v-if="showRejectModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-reject">
        <h5 class="modal-title text-white">Reject Deal Request</h5>
        <button class="modal-close-btn" @click="showRejectModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="modal-icon danger">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#dc3545" stroke-width="2" />
            <path d="M15 9L9 15M9 9L15 15" stroke="#dc3545" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <p class="modal-question">Reject this deal request?</p>
        <p class="modal-description">You are about to reject order <strong>{{ row?.orderId }}</strong>. Please provide a reason.</p>
        <div class="mt-3">
          <label for="rejectComment" class="form-label">Rejection Reason <span class="text-danger">*</span></label>
          <textarea id="rejectComment" class="form-control modern-input" v-model="comment" rows="3"
                    placeholder="Explain why you're rejecting this request..."></textarea>
        </div>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showRejectModal = false">Cancel</button>
        <button class="btn btn-danger px-4" @click="rejectRecord(row)"><i class="fas fa-times me-2"></i>Reject</button>
      </div>
    </div>
  </div>

  <!-- Deal Details Modal -->
  <div v-if="showDealDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-xl">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Deal Details</h5>
        <button class="modal-close-btn" @click="showDealDetailsModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="deal-details-grid">
          <div class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
              <h6>Deal Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="detail-row"><span class="detail-label">Order ID</span><span class="detail-value">{{ row.orderId }}</span></div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="badge" :class="{
                  'bg-success': row?.status?.statusId === 1, 'bg-warning': row?.status?.statusId === 6 || row?.status?.statusId === 9 ,
                  'bg-purple': row?.status?.statusId === 8, 'bg-orange': row?.status?.statusId === 10,
                  'bg-danger': row?.status?.statusId === 0, 'bg-dark': row?.status?.statusId === 7
                }">{{ row?.status?.statusId === 8 ?'Active':
                      row?.status?.statusId === 9 ?'Pending':
                        row?.status?.statusId === 10 ?'Negotiating':
                          row?.status?.statusName
                  }}</span>
              </div>
              <div class="detail-row"><span class="detail-label">Currency Pair</span><span class="detail-value">{{ row?.currencyPair }}</span></div>
              <div class="detail-row">
                <span class="detail-label">Side</span>
                <span class="badge" :class="row.buySell === 'BUY' ? 'bg-primary' : 'bg-danger'">{{ row?.buySell}} {{ row.strongCurrency }}</span>
              </div>
              <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">{{ row.amountCurrency }} {{ row?.counterNominalAmount }}</span></div>
              <div class="detail-row"><span class="detail-label">Account</span><span class="detail-value">{{ row?.accountNumber }}</span></div>
              <div class="detail-row"><span class="detail-label">Request Date</span><span class="detail-value">{{ prettyDate(row?.requestDate) }}</span></div>
              <div class="detail-row"><span class="detail-label">Value Date</span><span class="detail-value">{{ row?.valueDate }}</span></div>
              <div class="detail-row"><span class="detail-label">Purpose</span><span class="detail-value">{{ row?.purpose }}</span></div>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h6>Customer Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">{{ accountInfo?.accountName }}</span></div>
              <div class="detail-row"><span class="detail-label">Issuer</span><span class="detail-value">{{ row.createdBy }}</span></div>
              <div class="detail-row"><span class="detail-label">Originator</span><span class="detail-value">{{ row.createdBy }}</span></div>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h6>Branch Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="detail-row"><span class="detail-label">Branch</span><span class="detail-value">{{ row?.branchId?.branchName }}</span></div>
              <div class="detail-row"><span class="detail-label">Branch initiator(Teller)</span><span class="detail-value">{{ row.tellerId }}</span></div>
            </div>
          </div>
          <div class="detail-card ">
            <div class="detail-card-header">
              <div class="detail-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h6>Rate Information</h6>
            </div>
            <div class="detail-card-body">
              <div class="rate-info-grid">
                <div class="rate-info-item"><span class="rate-label">Offer Rate</span><span class="rate-value">{{ row.treasuryRate }}</span></div>
                <div class="rate-info-item"><span class="rate-label">Negotiated Rate</span><span class="rate-value highlight">{{ row.negotiatedRate }}</span></div>
                <div class="rate-info-item primary"><span class="rate-label">Expected Total</span><span class="rate-value primary">{{ row.expectedAmount }} {{ row.expectedCurrency }}</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer justify-content-end">
        <button class="btn btn-outline-secondary px-4" @click="showDealDetailsModal = false"><i class="fas fa-times me-2"></i>Close</button>
      </div>
    </div>
  </div>

  <!-- Retry Modal -->
  <div v-if="showRetryModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-white">Retry Deal Request</h5>
        <button class="modal-close-btn" @click="showRetryModal = false"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="modal-question">Retry this deal request?</p>
        <p class="modal-description">You are about to retry order <strong>{{ row?.orderId }}</strong>. This action cannot be undone.</p>
      </div>
      <div class="modal-footer justify-content-center">
        <button class="btn btn-outline-secondary px-4 me-2" @click="showRetryModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="retryPostDealCode()"><i class="fas fa-check me-2"></i>Retry</button>
      </div>
    </div>
  </div>


  <DealChatModal
    :showDealChatModal="showDealChatModal"
    :row="row"
    @close="closeDealChat"
    @action="handleChatAction"
  />
</template>

<style scoped>
/* ── Main wrapper ── */
.main-content-wrapper {
  min-height: calc(100vh - 280px - 80px);
  padding-top: 20px;
  padding-bottom: 60px;
}


:deep(.dt-retry) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #fff;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

:deep(.dt-viewChat) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: #fff;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

:deep(.dt-awaiting) {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
  color: #374151;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.2);
}

:deep(.viewRate) {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

:deep(.viewDetails) {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
  color: #374151;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.2);
}


:deep(.dt-approve) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

:deep(.dt-noAction) {
  background: linear-gradient(135deg, #4b5563, #374151) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.2);
}

:deep(.ammendDeal) {
  background: linear-gradient(135deg, #fb923c, #ea580c) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.25);
}

:deep(.pickDeal) {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

:deep(.badge.bg-orange) {
  background: linear-gradient(135deg, #fb923c, #ea580c) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.25);
}

:deep(.badge.bg-purple) {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

/* Custom Badge Styles */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

:deep(.badge.bg-danger) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

:deep(.badge.bg-warning) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

:deep(.badge.bg-dark) {
  background: linear-gradient(135deg, #4b5563, #374151) !important;
  padding: 6px 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.2);
}


/* ── Table card ── */
.table-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  border: 2px solid rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
}
.table-card:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.2);
}
.table-header {
  padding: 28px;
  border-bottom: 2px solid #f0fdf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  flex-wrap: wrap;
  gap: 16px;
}
.table-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}
.table-subtitle { font-size: 14px; color: #059669; margin: 0; }
.table-actions  { display: flex; gap: 12px; flex-wrap: wrap; }
.table-body     { padding: 28px; }

.create-deal-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.create-deal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* ── Modal backdrop + shell ── */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 20px;
  overflow-y: auto;
}
.custom-modal {
  background: #fff;
  border-radius: 16px;
  width: 600px;
  max-width: 95%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  max-height: 100vh;
  overflow-y: auto;
}
.modal-lg  { width: 900px; }
.modal-xl  { width: 1200px; }
.modal-md  { width: 700px; }

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
.modal-header {
  padding: 20px 24px;
  border-bottom: 2px solid #f0fdf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header-approve { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.modal-header-reject  { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.modal-title  { font-size: 18px; font-weight: 700; margin: 0; }
.modal-close-btn {
  background: none; border: none; color: white; font-size: 20px;
  cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s;
}
.modal-close-btn:hover { background: rgba(255,255,255,0.2); }
.modal-body   { padding: 28px; }
.modal-footer {
  padding: 20px 24px;
  border-top: 2px solid #f0fdf4;
  display: flex;
  gap: 12px;
}

/* ── Chat button (new) ── */
.btn-chat {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff;
  border: none;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-chat:hover {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #fff;
  transform: translateY(-1px);
}

/* ── Modal icons ── */
.modal-icon        { display: flex; justify-content: center; margin-bottom: 20px; }
.modal-icon.success svg { filter: drop-shadow(0 4px 12px rgba(16,185,129,0.3)); }
.modal-icon.danger  svg { filter: drop-shadow(0 4px 12px rgba(220,53,69,0.3)); }
.modal-question    { font-size: 18px; font-weight: 600; color: #1f2937; text-align: center; margin-bottom: 12px; }
.modal-description { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0; }

/* ── Choice grid ── */
.choice-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-top: 24px; }
.choice-card {
  background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px;
  padding: 24px; text-align: center; cursor: pointer; transition: all 0.3s;
}
.choice-card:hover {
  border-color: #10b981; background: #f0fdf4;
  transform: translateY(-4px); box-shadow: 0 8px 20px rgba(16,185,129,0.15);
}
.choice-icon {
  width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; transition: all 0.3s;
}
.choice-icon.customer { background: linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.05)); color: #059669; }
.choice-icon.teller   { background: linear-gradient(135deg,rgba(52,211,153,0.1),rgba(16,185,129,0.05)); color: #10b981; }
.choice-card:hover .choice-icon { transform: scale(1.1); }
.choice-label    { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.choice-sublabel { font-size: 13px; color: #6b7280; }

/* ── Customer / dealCodes cards ── */
.customer-card, .teller-card {
  background: linear-gradient(135deg,#f0fdf4,#ecfdf5);
  border: 2px solid #d1fae5; border-radius: 16px; padding: 24px;
}
.rate-card {
  background: linear-gradient(135deg,#f8fafc,#f1f5f9);
  border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px;
}
.customer-header {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #d1fae5;
}
.customer-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg,#10b981,#059669);
  display: flex; align-items: center; justify-content: center; color: white;
}
.customer-name  { font-size: 18px; font-weight: 700; color: #064e3b; margin-bottom: 4px; }
.customer-since { font-size: 13px; color: #059669; margin: 0; }
.customer-details, .teller-details {
  display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
  gap: 20px; margin-bottom: 24px;
}
.detail-item label { font-size: 12px; font-weight: 600; color: #059669; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; display: block; }
.detail-item p     { font-size: 15px; font-weight: 600; color: #064e3b; margin: 0; }
.accounts-section  { margin-top: 24px; }
.section-label     { font-size: 13px; font-weight: 600; color: #059669; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; display: block; }
.accounts-grid     { display: flex; flex-wrap: wrap; gap: 10px; }
.account-badge {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px;
  background: white; border: 2px solid #d1fae5; border-radius: 8px;
  font-size: 13px; font-weight: 600; color: #064e3b; transition: all .2s;
}
.account-badge:hover { border-color: #10b981; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,.15); }
.account-badge svg   { color: #10b981; }

/* ── Form elements ── */
.modern-select, .modern-input {
  border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; transition: all .2s;
}
.modern-select:focus, .modern-input:focus {
  border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.1); outline: none;
}
.form-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }

/* ── Info boxes ── */
.info-box {
  background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px;
  padding: 16px; display: flex; align-items: center; gap: 12px;
}
.info-box.rate-box  { background: linear-gradient(135deg,#f0fdf4,#ecfdf5); border-color: #d1fae5; }
.info-box.total-box { background: linear-gradient(135deg,#ecfdf5,#d1fae5); border-color: #10b981; }
.info-box.offer-box { background: linear-gradient(135deg,#eff6ff,#dbeafe); border-color: #3b82f6; }
.info-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg,rgba(16,185,129,.1),rgba(5,150,105,.05));
  color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.info-icon.success { background: linear-gradient(135deg,#10b981,#059669); color: white; }
.info-label       { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
.info-value       { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
.info-value.success { font-size: 20px; color: #059669; }
.info-teller-info { font-size: 12px; font-weight: 400; color: #6b7280; margin-bottom: 4px; }

/* ── Deal details grid ── */
.deal-details-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
.detail-card { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.detail-card.full-width { grid-column: 1 / -1; }
.detail-card-header {
  background: linear-gradient(135deg,#f0fdf4,#ecfdf5); padding: 16px 20px;
  border-bottom: 2px solid #d1fae5; display: flex; align-items: center; gap: 12px;
}
.detail-card-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg,#10b981,#059669); color: white;
  display: flex; align-items: center; justify-content: center;
}
.detail-card-header h6 { font-size: 15px; font-weight: 700; color: #064e3b; margin: 0; }
.detail-card-body { padding: 20px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
.detail-row:last-child { border-bottom: none; }
.detail-label { font-size: 13px; font-weight: 600; color: #6b7280; }
.detail-value { font-size: 14px; font-weight: 600; color: #1f2937; }
.rate-info-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.rate-info-item { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; }
.rate-info-item.primary { background: linear-gradient(135deg,#ecfdf5,#d1fae5); border-color: #10b981; }
.rate-label   { font-size: 12px; font-weight: 600; color: #6b7280; display: block; margin-bottom: 8px; }
.rate-value   { font-size: 18px; font-weight: 700; color: #1f2937; display: block; }
.rate-value.highlight { color: #059669; }
.rate-value.primary   { font-size: 22px; color: #10b981; }

/* ── Badge overrides ── */
:deep(.badge.bg-success) {
  background: linear-gradient(135deg,#10b981,#059669) !important;
  padding: 6px 12px; font-weight: 600; box-shadow: 0 2px 8px rgba(16,185,129,.2);
}
:deep(.dt-approve) { background: linear-gradient(135deg,#10b981,#059669) !important; border: none !important; box-shadow: 0 2px 8px rgba(16,185,129,.2); }
:deep(.dt-approve):hover { background: linear-gradient(135deg,#059669,#047857) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,.3); }

/* ── Tab bar ── */
.tab-bar {
  display: flex; gap: 4px; padding: 5px;
  background: #f0f4f9; border-radius: 12px;
  width: fit-content; margin-bottom: 24px;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .deal-details-grid { grid-template-columns: 1fr; }
  .rate-info-grid    { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .tab-bar { width: 100%; }
  .main-content-wrapper { padding-top: 16px; padding-bottom: 40px; }
  .table-header { padding: 20px; flex-direction: column; align-items: flex-start; }
  .table-body   { padding: 16px; }
  .choice-grid  { grid-template-columns: 1fr; }
  .customer-details, .teller-details { grid-template-columns: 1fr; }
  .modal-xl, .modal-lg { width: 95%; }
}
@media (max-width: 576px) {
  .table-title    { font-size: 18px; }
  .create-deal-btn { width: 100%; justify-content: center; }
  .accounts-grid  { flex-direction: column; }
  .account-badge  { width: 100%; }
}

.tab-bar {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: transparent;
  border: none;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.tab-btn--active {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #FFFFFF;
}

.tab-count {
  background: #e5e7eb;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

.tab-count--active  {
  background: #064e3b;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

/* Indicator */
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 2px;
  background: #064e3b;
  transition: transform 0.3s ease;
}


button:disabled {
 background: grey;
  box-shadow: none;
}

button:disabled:hover {
  transform: translateY(0px);
  box-shadow: none;
  background: grey;
}

</style>
