<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'
import store from '@/store'

export default {

  components: { AppLoader, DataTable },
  data() {
    return {
      tableReady: false,
      permissions: [],
      user: {},
      accounts: [],
      customerInfo: {},
      users: [],
      dealRequests:[],
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
      loading: false,
      comment: '',
      rfqComment: '',
      currency: '',
      selectedAccount: '',
      purpose: '',
      valueDate: '',
      bankDirection: '',
      amount: '',
      action: '',
      negotiatedRate:'',
      errors: {},
      idType: '',
      idNumber: '',
      idNumberValue: '',
      idTypeValue: '',
      rateFrom: '',
      rateTo: '',
      rateValue: '',
      expectedValue: '',
      sourceAccCurrency: '',
      useCurrentRate:true,
      isCustomer:false,
      useNegotiatedRate:false,
      options: [
        { id: 'COR', name: 'Certificate of Registration' },
        { id: 'NATID', name: 'National id' },
        { id: 'ACCNO', name: 'Account Number' }
      ],
      currencyOptions: [
        { id: 'USD', name: 'United States Dollar' },
        { id: 'KES', name: 'Kenyan Shilling' },
        { id: 'EUR', name: 'Euro' },
        { id: 'GBP', name: 'British Pound Sterling' },
        { id: 'ZAR', name: 'South African Rand' },
        { id: 'CAD', name: 'Canadian Dollar' },
        { id: 'CHF', name: 'Swiss Franc' },
        { id: 'JPY', name: 'Japanese Yen' },
        { id: 'AUD', name: 'Australian Dollar' },
        { id: 'DKK', name: 'Danish Krone' },
        { id: 'SEK', name: 'Swedish Krona' },
        { id: 'NOK', name: 'Norwegian Krone' },
        { id: 'INR', name: 'Indian Rupee' },
        { id: 'AED', name: 'United Arab Emirates Dirham' },
        { id: 'CNY', name: 'Chinese Yuan' },
        { id: 'TZS', name: 'Tanzanian Shilling' },
        { id: 'RWF', name: 'Rwandan Franc' },
        { id: 'UGX', name: 'Ugandan Shilling' }
      ],
      row: {}
    }
  },
  computed: {
    columns() {
      const canApprove = this.canApproveDealCodeRequests;

      const cols = [
        { title: 'Customer Name', data: 'customerName' },
        { title: 'AccountNumber', data: 'accountNumber' },
        { title: 'Amount', data: 'counterNominalAmount' },
        { title: 'Currency Pair', data: 'currencyPair' },

        { title: 'Buy/Sell', data: 'buySell' },
        {
          title: 'Request Date', data: 'requestDate',
          render: function(data) {
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },
        { title: 'Value Date', data: 'valueDate' },
        { title: 'Negotiated Rate', data: 'negotiatedRate' },


        {
          title: 'Deal Status',
          data: 'status',
          render: function(data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 0) return `<span class="badge bg-danger ">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            else return `<span class="badge bg-primary">data.statusName</span>`
          }
        },
        { title: 'Deal Code', data: 'dealerCode' },
        { title: 'Order Number', data: 'orderId' }
      ]

      //Push final row if user has permission
      if (canApprove) {
        cols.push({
            title: 'Actions',
            data: null, // We don’t need data from backend here
            orderable: false,
            searchable: false,
            render: function(data, type, row) {
              if (canApprove) {
                const approveDisabled = row.status.statusId === 6 ? '' : 'disabled'
                return `<button class="btn btn-sm btn-primary me-1 dt-approve" data-id="${row.id}"  ${approveDisabled}>Approve</button>
                   <button class="btn btn-sm btn-danger dt-reject" data-id="${row.id}" ${approveDisabled}>Reject</button>`
              } else return ''
            }
          }
        )
      }
      return cols;
    },



    updateUser() {
      return updateUser
    },
    canCreateDealCodeRequests() {
      return this.hasPerm("CREATE_DEAL_REQUESTS");
    },
    canApproveDealCodeRequests() {
      return this.hasPerm("APPROVE_DEAL_REQUESTS");
    },

  },
    mounted() {
      // setTimeout(() => {
      //   this.loading = false;
      // }, 100);
      this.user = JSON.parse(store.state.user);
      this.permissions = this.user?.usersPerm;


      this.tableReady = true;
      this.fetchDealRequests()
    },
    methods: {
      hasPerm (permission) {
        return this.permissions && this.permissions.includes(permission)
      },
      filterCurrencyOptions() {
        if (this.selectedAccount) {
          console.log("test " ,this.selectedAccount)
          this.sourceAccCurrency = this.selectedAccount?.currency
          this.currencyOptions = this.currencyOptions.filter(
            currency => currency.id !== this.sourceAccCurrency
          );
          this.checkBankDirection();
        }
      },
    editUsers(item) {
      console.log('user ', JSON.stringify(item))
      localStorage.setItem('selectedUser', JSON.stringify(item))
      this.$router.push('/updateUser')
    },
    showEnableDialog(row) {
      this.comment = ''
      this.row = row
      this.showEnableModal = true
    },
    showDisableDialog(row) {
      this.comment = ''
      this.row = row
      this.showDisableModal = true
    },

    showCreateDealDialog() {
      this.showCreateDealModal = true
    },
    showCustomerModalDialog() {
      this.showCreateDealModal = false
      this.showCustomerModal = true
      this.isCustomer = true;
    },
    showTellerModalDialog() {
      this.showCreateDealModal = false
      this.showTellerModal = true
      this.idType = 'ACCNO'
      this.isCustomer = false;
    },
    showCustomerDetailsModalDialog() {
      console.log('test1')
      this.showCustomerModal = false
      this.showCustomerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },

    showTellerDetailsModalDialog() {
      console.log('test1')
      this.showTellerModal = false
      this.showTellerDetailsModal = true
      this.idNumberValue = this.idNumber
      this.idTypeValue = this.idType?.name
    },

    showCreateRFQModalDialog() {
      this.showCreateRFQModal = true
      this.showTellerDetailsModal = false
      this.showCustomerDetailsModal = false

    },

    enableRecord(row) {
      this.changeStatus(row, '1')
    },
    disableRecord(row) {
      this.changeStatus(row, '0')
    },
      validateForm() {
        this.errors = {} // Clear previous errors
        // if (!this.userName) {
        //   this.errors.userName = 'UserName is required.'
        // } else if (!config.TEXT_REGEX.test(this.userName) && !config.EMAIL_REGEX.test(this.userName)) {
        //   this.errors.userName = 'Invalid UserName Input'
        // }
        //
        // if (!this.email) {
        //   this.errors.email = 'Email is required.'
        // } else if (!config.EMAIL_REGEX.test(this.email)) {
        //   this.errors.email = 'Invalid email format.'
        // }
        //
        // if (!this.phone) {
        //   this.errors.phone = 'Phone is required.'
        // } else if (!config.PHONE_REGEX.test(this.phone)) {
        //   this.errors.phone = 'Invalid phone number format.'
        // }

        if (!this.selectedAccount) {
          this.errors.selectedAccount = '*Account is required.'
        }
        if (!this.action) {
          this.errors.action = '*Kindly state if it is credit or a Debit .'
        }
        if (!this.currency) {
          this.errors.currency = '*Kindly Input Currency .'
        }

        if (!this.amount) {
          this.errors.amount = "*Amount is required.";
        }
        else if(!config.NUMBER_ONLY_REGEX.test(this.amount)){
          this.errors.amount = "*Amount is invalid";
        }

        if (!this.negotiatedRate) {
          this.errors.negotiatedRate = "*Negotiated rate is required.";
        }
        else if(!config.NUMBER_ONLY_REGEX.test(this.negotiatedRate)){
          this.errors.negotiatedRate = "*Negotiated rate is invalid";
        }

        if (!this.valueDate) {
          this.errors.purpose = "*Purpose is required.";
        }
        if (!this.purpose) {
          this.errors.purpose = "Purpose is required.";
        }

        if (!this.rfqComment) {
          this.errors.rfqComment = "Comments is required.";
        }

        if (Object.keys(this.errors).length > 0) {
          return false // Validation failed
        }
        return true // Validation passed
      },
      submitDealRateRequest() {
        if (!this.validateForm()) {
          console.log('Validation failed', this.errors)
          return // Stop submission if validation fails
        }
        this.loading = true
        this.message = ''
        var counterCurrency = this.currency.id
        var accountCurrency = this.selectedAccount.currency

        var url = env.apiUrl.baseUrl + env.apiUrl.rfq.createRFQ
        console.log('status', url)
        console.log('iscCustomerr ', this.isCustomer)
        axios
          .post(url, {
            customerNo: this.selectedAccount?.customerCif,
            customerName: this.selectedAccount?.accountName,
            idNumber: this.customerInfo?.idNumber,
            amount: this.amount,
            fromCurrency: counterCurrency,
            toCurrency: accountCurrency,
            accountNumber: this.selectedAccount?.accountNumber,
            valueDate: this.valueDate,
            negotiatedRate: this.negotiatedRate,
            tellerAccountName: !this.isCustomer? this.selectedAccount?.accountName : "",
            purpose: this.purpose,
            comments:this.rfqComment,
            branchCode: this.selectedAccount?.branchCode,
          })
          .then((response) => {
            var data = response.data
            /* Checking if error object was returned from the server */
            var responseCode = data.responseCode
            var responseMessage = data.responseMessage
            if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
              this.responseMessage = responseMessage
              this.errorMessage = responseMessage
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: this.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2', // green button
                  cancelButton: 'btn btn-secondary px-4' // gray button
                }
              })
              console.log(this.responseMessage)
              return
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: responseMessage,
              timer: 3000, // Auto-closes after 3 seconds,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.log('Deal Code  Request created successfully  ', this.userName)
            this.$router.push('/viewUsers')
          })
          .catch((error) => {
            console.log('Error is ', error)
            this.errorMessage = 'Deal Code  Request  Creation error'
            console.log(this.errorMessage)
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred during Deal Code  Request  Creation',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
          })
          .finally(() => {
            // Code here will always execute after the promise resolves or rejects
            this.loading = false
            this.showEnableModal = false
            this.showDisableModal = false
          })
      },
    fetchDealRequests() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getDealRequests
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      axios
        .post(url, {
          page: 0,
          size: 10
        })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            return
          }
          this.dealRequests = data.data // reactive update, DataTable will redraw automatically
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Deal Requests',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false // hide loader
        })
    },

      validateAccountsForm() {
        this.errors = {} // Clear previous errors

        if (!this.idNumber) {
          this.errors.idNumber= '*Id Number is required.'
        }
        if (this.isCustomer && !this.idType) {
          this.errors.idType = '*Id Type is required. .'
        }


        if (Object.keys(this.errors).length > 0) {
          return false // Validation failed
        }
        return true // Validation passed
      },

    fetchAccounts(isCustomer) {
      console.log('iscustomer', isCustomer)
      if (!this.validateAccountsForm()) {
        console.log('Validation failed', this.errors)
        return // Stop submission if validation fails
      }
      this.isCustomer = isCustomer
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchAccounts

      axios
        .post(url, {
          option: this.idType?.id,
          customer: isCustomer,
          identificationNumber: this.idNumber
        })
        .then((response) => {
          const data = response.data
          var responseMessage = data.responseMessage
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            return
          }
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000, // Auto-closes after 3 seconds,
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }
          })
          this.accounts = data?.entity?.accounts // reactive update, DataTable will redraw automatically
          this.customerInfo = data?.entity
          console.log('Accounts', this.accounts)
          if (isCustomer) {
            this.showCustomerDetailsModalDialog()
          } else {
            this.showTellerDetailsModalDialog()
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching Accounts',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false // hide loader
        })
    },

    checkBankDirection() {
      if (this.currency && this.selectedAccount && this.action) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getCurrencyDirection
        var counterCurrency = this.currency.id
        var accountCurrency = this.selectedAccount.currency

        var fromCurrency = accountCurrency
        var toCurrency = counterCurrency

        if (this.action === 'CREDIT') {
          fromCurrency = counterCurrency
          toCurrency = accountCurrency
        }

        axios
          .post(url, {
            fromCurrency: fromCurrency,
            toCurrency: toCurrency
          })
          .then((response) => {
            const data = response.data
            var responseMessage = data.responseMessage
            if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2', // green button
                  cancelButton: 'btn btn-secondary px-4' // gray button
                }
              })
              return
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: responseMessage,
              timer: 3000, // Auto-closes after 3 seconds,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.log('data', data)
            this.bankDirection = data?.entity
            this.fetchExchangeRates()
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error occurred fetching Accounts',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.error(error)
          })
          .finally(() => {
            this.loading = false // hide loader
          })
      }
    },

    fetchExchangeRates() {
      if (this.currency && this.selectedAccount && this.action && this.amount) {
        this.loading = true
        const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getSinglePairExchangeRate
        var counterCurrency = this.currency.id
        var accountCurrency = this.selectedAccount.currency

        axios
          .post(url, {
            fromCurrency: counterCurrency,
            toCurrency: accountCurrency,
            account: this.selectedAccount.accountNumber,
            transactionAmount: this.amount
          })
          .then((response) => {
            const data = response.data
            var responseMessage = data.responseMessage
            if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2', // green button
                  cancelButton: 'btn btn-secondary px-4' // gray button
                }
              })
              return
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: responseMessage,
              timer: 3000, // Auto-closes after 3 seconds,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.log('data', data)
            this.rateFrom = counterCurrency
            this.rateTo = accountCurrency
            if (this.bankDirection === 'Sell') {
              this.rateValue = data.entity?.sellingRate
            } else if (this.bankDirection === 'Buy') {
              this.rateValue = data.entity?.buyingRate
            }
            this.expectedValue = this.amount * this.rateValue
            this.expectedValue = Number(this.expectedValue).toFixed(2)
            this.useCurrentRate = true;
            this.useNegotiatedRate = false;
            this.displayNegotiatedRate()
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Error occurred fetching Accounts',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.error(error)
          })
          .finally(() => {
            this.loading = false // hide loader
          })
      }
    },
      displayNegotiatedRate(){
        if(this.currency && this.selectedAccount && this.action && this.amount && this.negotiatedRate){
          this.expectedValue = this.amount * this.negotiatedRate
          this.expectedValue = Number(this.expectedValue).toFixed(2)
          this.useCurrentRate = false;
          this.useNegotiatedRate = true;
        }
      },
      showApproveDialog(row) {
        this.comment = ''
        this.row = row
        this.showApproveModal = true
      },
      showRejectionDialog(row) {
        this.comment = ''
        this.row = row
        this.showRejectModal = true
      },

      approveRecord(row) {
        this.approveOrReject(row, 'APPROVE')
      },
      rejectRecord(row) {
        this.approveOrReject(row, 'REJECT')
      },

      approveOrReject(row, action) {
        console.log(action, row,"x")
        this.loading = true
        var url = env.apiUrl.baseUrl + env.apiUrl.approvals.approveEntity
        var ids = []
        ids.push(this.row?.id)

        axios
          .post(url, {
            ids: ids,
            action: action,
            description: this.comment,
            approvalType: 'APPROVED_DEALS'
          })
          .then((response) => {
            var data = response.data
            /* Checking if error object was returned from the server */
            var responseCode = data.responseCode
            var responseMessage = data.responseMessage
            if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
              this.responseMessage = responseMessage
              this.errorMessage = responseMessage
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: this.responseMessage,
                customClass: {
                  confirmButton: 'btn btn-success px-4 me-2', // green button
                  cancelButton: 'btn btn-secondary px-4' // gray button
                }
              })
              console.log(this.responseMessage)
              return
            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: responseMessage,
              timer: 3000, // Auto-closes after 3 seconds,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            console.log('Deal Request approved successfully  ')
            this.fetchDealRequests()
          })
          .catch((error) => {
            console.log('Error is ', error)
            this.errorMessage = 'Deal Request Approval error'
            console.log(this.errorMessage)
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'An error occurred during Deal Request Approval',
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
          })
          .finally(() => {
            // Code here will always execute after the promise resolves or rejects
            this.loading = false
            if (action === 'APPROVE') {
              this.showApproveModal = false
            } else {
              this.showRejectModal = false
            }
          })
      },
  }
}
</script>
<template>
  <!--  Define Loader     -->
  <div>
    <AppLoader v-if="loading" />
  </div>
  <div class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between">
          <div class="header-title">
            <h4 class="card-title">Requested Deals</h4>
          </div>
          <div class="d-flex justify-content-end gap-3">
            <b-button  v-if="canCreateDealCodeRequests" variant="primary" class="px-4" @click="showCreateDealDialog"><i class="fa-solid fa-plus me-2"></i> Create Deal Code </b-button>
          </div>
        </div>
        <div class="card-body px-3 pt-4 pb-3">
          <data-table v-if="tableReady" :data="dealRequests" :columns="columns" :isFooter="true" :striped="false" @approve="showApproveDialog" @reject="showRejectionDialog"  />
        </div>
      </div>
    </div>
  </div>

  <div v-if="showCreateDealModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showCreateDealModal = false" class = "fas fa-close"></i></span>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          <strong>Is this person a Customer?</strong>
        </p>
        <p>Select whether a person has an existing account with us.</p>
        <div class="row w-100 g-4 justify-content-center">
          <!-- Cancel -->
          <div class="col-6">
            <button class="btn w-100 p-4 border rounded-3 text-center action-card danger" @click="showCustomerModalDialog()">
              <div class="fw-bold fs-4">Yes</div>
              <div class="text-muted small">Existing Customer</div>
            </button>
          </div>

          <!-- Enable -->
          <div class="col-6">
            <button class="btn w-100 p-4 border rounded-3 text-center action-card success" @click="showTellerModalDialog()">
              <div class="fw-bold fs-4">No</div>
              <div class="text-muted small">Non Customer</div>
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer justify-content-center"></div>
    </div>
  </div>

  <div v-if="showCustomerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showCustomerModal = false" class = "fas fa-close"></i></span>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          <strong>Customer Account Lookup</strong>
        </p>
        <p>Select whether a person has an existing account with us.</p>
        <!--        <div class="row w-100 g-4 justify-content-center">-->

        <b-row class="mb-3">
          <b-col lg="6">
            <b-form-group label="Search By" label-for="search value" label-class="fw-semibold">
              <select v-model="idType" class="form-control" id="userRole">
                <option v-for="option in options" :key="option" :value="option">
                  {{ option.name }}
                </option>
              </select>
              <small v-if="errors.idType" class="text-danger">{{ errors.idType }}</small>
            </b-form-group>
          </b-col>

          <b-col lg="6">
            <b-form-group label="Search value" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" placeholder="Enter Value"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <!--      </div>-->
      <div class="modal-footer justify-content-end">
        <button class="btn btn-success px-4" @click="fetchAccounts(true)">Search</button>
      </div>
    </div>
  </div>

  <div v-if="showTellerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showTellerModal = false" class = "fas fa-close"></i></span>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          <strong>Teller Account Lookup</strong>
        </p>
        <p>Kindly key in Teller Account.</p>
        <!--        <div class="row w-100 g-4 justify-content-center">-->

        <b-row class="mb-3">
          <b-col lg="12">
            <b-form-group label="Enter Teller Account Details" label-for="search by value" label-class="fw-semibold">
              <b-form-input v-model="idNumber" type="text" placeholder="Enter Teller Account"></b-form-input>
              <small v-if="errors.idNumber" class="text-danger">{{ errors.idNumber }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </div>
      <!--      </div>-->
      <div class="modal-footer justify-content-end">
        <button class="btn btn-success px-4" @click="fetchAccounts(false)">Search</button>
      </div>
    </div>
  </div>

  <div v-if="showCustomerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <!-- Header -->
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showCustomerDetailsModal = false" class = "fas fa-close"></i></span>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Search Section -->
        <div class="row g-3 align-items-end mb-4">
          <div class="col-md-4">
            <label class="form-label">Search By</label>
            <input type="text" class="form-control" v-model="idTypeValue" placeholder="Enter value" disabled />
          </div>

          <div class="col-md-5">
            <label class="form-label">Enter Value</label>
            <input type="text" class="form-control" v-model="idNumberValue" placeholder="Enter value" disabled />
          </div>

          <div class="col-md-3">
            <button disabled class="btn btn-success w-100"><i class="bi bi-search me-2"></i> Search</button>
          </div>
        </div>

        <!-- Customer Card -->
        <div class="customer-card p-4 rounded-4">
          <div class="d-flex align-items-center mb-4">
            <div class="avatar me-3"></div>
            <div>
              <h6 class="mb-0 fw-bold text-uppercase">{{ customerInfo?.fullName }}</h6>
              <small class="text-muted">Customer since {{ customerInfo?.joiningYear }}</small>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label"><strong>ID Number:</strong></label>
              <p>{{ customerInfo?.idNumber }}</p>
            </div>

            <div class="col-md-6">
              <label class="form-label"><strong>Phone Number:</strong></label>
              <p>{{ customerInfo?.phoneNumber }}</p>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label"><strong>Accounts</strong></label>
            <div class="modal-list-container">
              <div class="list-button" v-for="(acc, index) in accounts" :key="index">
                <span>{{ acc.accountNumber }} {{ acc.currency }}</span>
              </div>
            </div>
          </div>

          <div class="text-end">
            <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">Continue <i class="bi bi-arrow-right ms-2"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showTellerDetailsModal" class="modal-backdrop">
    <div class="custom-modal modal-lg">
      <!-- Header -->
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showTellerDetailsModal = false" class = "fas fa-close"></i></span>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Search Section -->
        <!-- Customer Card -->
        <div class="teller-card p-4 rounded-4">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label"><strong>Account Name:</strong></label>
              <p>{{ accounts[0]?.accountName }}</p>
            </div>

            <div class="col-md-6">
              <label class="form-label"><strong>Account Number:</strong></label>
              <p>{{ accounts[0]?.accountNumber }}</p>
            </div>
          </div>

          <div class="mb-4 col-md-6">
            <label class="form-label"><strong>Branch Code:</strong></label>
            <p>{{ accounts[0]?.branchCode }}</p>
          </div>

          <div class="text-end">
            <button class="btn btn-success px-4" @click="showCreateRFQModalDialog">Continue <i class="bi bi-arrow-right ms-2"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showCreateRFQModal" class="modal-backdrop">
    <div class="custom-modal modal-xl">
      <!-- Header -->
<!--      <div class="modal-header">-->
<!--        <h5 class="modal-title fw-bold text-success">Request New Deal</h5>-->

<!--      </div>-->

      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal</h5>
        <span><i @click="showCreateDealModal = false" class = "fas fa-close"></i></span>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="row g-4">
          <!-- Select Account -->
          <div class="col-md-6">
            <label class="form-label">Select Account</label>
            <select class="form-select" v-model="selectedAccount" @change="filterCurrencyOptions">
              <option v-for="acc in accounts" :key="acc" :value="acc">
                {{ acc.accountNumber }}
              </option>
            </select>
            <small v-if="errors.selectedAccount" class="text-danger">{{ errors.selectedAccount }}</small>
          </div>

          <!-- Account Action -->
          <div class="col-md-6">
            <label class="form-label">Account Action</label>
            <select class="form-select" v-model="action" @change="checkBankDirection">
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
            <small v-if="errors.action" class="text-danger">{{ errors.action }}</small>
          </div>

          <!-- Counter Currency -->
          <div class="col-md-6">
            <label class="form-label">Counter Currency</label>
            <select class="form-select" v-model="currency" @change="checkBankDirection">
              <option v-for="option in currencyOptions" :key="option" :value="option">
                {{ option.name }}
              </option>
            </select>
            <small v-if="errors.currency" class="text-danger">{{ errors.currency }}</small>
          </div>

          <!-- Amount -->
          <div class="col-md-6">
            <label class="form-label">Counter Currency Amount</label>
            <div class="input-group">
              <input @change="fetchExchangeRates" type="number" class="form-control" v-model="amount" placeholder="Enter amount" />
            </div>
            <small v-if="errors.amount" class="text-danger">{{ errors.amount }}</small>
          </div>

          <!-- Bank Direction -->
          <div class="col-md-6">
            <label class="form-label">Bank's Direction</label>
            <input class="form-control" disabled placeholder="---" v-model="bankDirection" - />
          </div>

          <!-- Bank Direction -->
          <div class="col-md-6">
            <label class="form-label">Negotiated Rate</label>
            <input @change="displayNegotiatedRate" class="form-control" placeholder="Enter Negotiated Rate"  v-model="negotiatedRate"/>
            <small v-if="errors.negotiatedRate" class="text-danger">{{ errors.negotiatedRate }}</small>
          </div>

          <!-- Value Date -->
          <div class="col-md-6">
            <label class="form-label">Value Date</label>
            <input type="date" class="form-control" v-model="valueDate" />
            <small v-if="errors.valueDate" class="text-danger">{{ errors.valueDate }}</small>
          </div>

          <!-- Rate + Estimate -->
          <div class="col-md-6">
            <div class="rate-box">
              <p>Current Rate</p>
              <p v-if="rateFrom && rateValue && rateTo">
                <Strong>1 {{ rateFrom }} = {{ rateValue }} {{ rateTo }}</Strong>
              </p>
            </div>
          </div>

          <!-- Purpose -->
          <div class="col-md-6">
            <label class="form-label">Purpose</label>
            <textarea class="form-control" rows="2" v-model="purpose"></textarea>
            <small v-if="errors.purpose" class="text-danger">{{ errors.purpose }}</small>

          </div>

          <!-- Rate + Estimate -->
          <div class="col-md-6">
            <div class="totals-box ">
              <p v-if="useCurrentRate">Expected Total(With Current Rate)</p>
              <p v-if="useNegotiatedRate">Expected Total(With Negotiated Rate)</p>
              <p>
                <strong class="expected-total" >{{ expectedValue }} {{ rateTo }}</strong>
              </p>
            </div>
          </div>

          <div class="col-md-6"></div>
          <!-- Comment -->
          <div class="col-md-6">
            <label class="form-label">Comment</label>
            <textarea class="form-control" rows="2" v-model="rfqComment"></textarea>
            <small v-if="errors.rfqComment" class="text-danger">{{ errors.rfqComment }}</small>

          </div>

          <!-- Amount -->
          <!--          <div class="col-md-6">-->
          <!--            <label class="form-label">Amount</label>-->
          <!--            <div class="input-group">-->
          <!--              <select class="form-select" style="max-width: 120px">-->
          <!--                <option>Currency</option>-->
          <!--              </select>-->
          <!--              <input-->
          <!--                type="number"-->
          <!--                class="form-control"-->
          <!--                v-model="amount"-->
          <!--                placeholder="Enter amount"-->
          <!--              />-->
          <!--            </div>-->
          <!--          </div>-->
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer" style="gap: 1rem">
        <button class="btn btn-outline-danger px-4" @click="showCreateRFQModal = false">Cancel</button>
        <button class="btn btn-success px-5 " @click="submitDealRateRequest">Submit Request</button>
      </div>
    </div>
  </div>

  <div v-if="showEnableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Enable User</h5>
        <button type="button" class="btn-close" @click="showEnableModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to enable <strong>{{ row?.username }}</strong
          >?
        </p>
      </div>
      <div class="modal-footer justify-content-center" style="gap: 1rem">
        <button class="btn btn-danger px-4" @click="showEnableModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="enableRecord(row)">Enable</button>
      </div>
    </div>
  </div>

  <div v-if="showDisableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Disable User</h5>
        <button type="button" class="btn-close" @click="showDisableModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to Disable <strong>{{ row.username }}</strong
          >?
        </p>
      </div>
      <div class="modal-footer justify-content-center" style="gap: 1rem">
        <button class="btn btn-danger px-4" @click="showDisableModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="disableRecord(row)">Disable</button>
      </div>
    </div>
  </div>


  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Approve Requested Deal</h5>
        <button type="button" class="btn-close" @click="showApproveModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to approve order <strong>{{ row?.username }}</strong
        >?
        </p>

        <!--        <div class="mt-3 text-start">-->
        <!--          <label for="approvalComment" class="form-label">Comments (optional)</label>-->

        <!--        </div>-->
      </div>
      <div class="modal-footer justify-content-center" style="gap: 1rem">
        <button class="btn btn-danger px-4" @click="showApproveModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="approveRecord(row)">Approve</button>
      </div>
    </div>
  </div>

  <div v-if="showRejectModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Reject Requested Deal</h5>
        <button type="button" class="btn-close" @click="showRejectModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to reject order <strong>{{ row.username }}</strong
        >?
        </p>

        <div class="mt-3 text-start">
          <label for="approvalComment" class="form-label">Comments (optional)</label>
          <textarea id="approvalComment" class="form-control" v-model="comment" rows="3" placeholder="Add your comment here..."></textarea>
        </div>
      </div>
      <div class="modal-footer justify-content-center" style="gap: 1rem">
        <button class="btn btn-danger px-4" @click="showRejectModal = false">Cancel</button>
        <button class="btn btn-success px-4" @click="rejectRecord(row)">Reject</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.custom-modal {
  background: #fff;
  border-radius: 0.5rem;
  width: 600px;
  max-width: 95%;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}

.modal-header,
.modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1rem;
  max-height: 80vh; /* limit modal height */
  overflow-y: auto; /* enable vertical scrolling */
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
}
.modal-header-approve {
  background-color: #198754;
  color: white;
  font-weight: 600;
  padding: 1rem;
}

.action-card {
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Optional color accents */
.action-card.success {
  border-color: #198754;
}

.action-card.danger {
  border-color: #dc3545;
}

.customer-card {
  background: #eafff0;
  border: 1px solid #c6f6d5;
}

.teller-card {
  background: #f5f6f8; /* light grey */
  border: 1px solid #e1e3e8;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2f855a;
}

.rate-box {
  background: #f5f6f8;
  border-radius: 10px;
  padding: 16px;
  justify-content: space-between;
}

.totals-box {
  background: #eafff0;
  border-radius: 10px;
  padding: 16px;
  justify-content: space-between;
  overflow: hidden;
}

.expected-total {
  font-size: clamp(1.6rem, 5vw, 2.8rem);
  font-weight: 700;
  color: forestgreen;
  line-height: 1.1;
  width: 100%;
}

</style>
