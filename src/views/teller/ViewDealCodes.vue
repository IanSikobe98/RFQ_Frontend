<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import updateUser from '@/views/user/UpdateUser.vue'

export default {
  computed: {
    updateUser() {
      return updateUser
    }
  },
  components: { AppLoader, DataTable },
  data() {
    return {
      accounts: [],
      users:[],
      showEnableModal: false,
      showDisableModal: false,
      showCreateDealModal:false,
      showCustomerModal:false,
      showTellerModal:false,
      loading: false,
      comment: '',
      errors: {},
      idType: '',
      idNumber: '',
      options:[{ id: 'COR', name: 'Certificate of Registration' },
        { id: 'NATID', name: 'National id' },
        { id: 'ACCNO', name: 'Account Number' }
      ],
      columns: [
        { title: 'Name', data: 'username' },
        { title: 'Phone', data: 'phone' },
        { title: 'Email', data: 'email' },
        { title: 'Role', data: 'role.roleName' },
        {
          title: 'Status',
          data: 'status',
          render: function (data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 0) return `<span class="badge bg-danger ">Inactive</span>`
            if (id === 6) return `<span class="badge bg-warning">Pending</span>`
            if (id === 7) return `<span class="badge bg-dark">Rejected</span>`
            return data
          }
        },
        {
          title: 'Actions',
          data: null, // We don’t need data from backend here
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            const activeDisabled = row.status.statusId === 0? '' : 'disabled'
            const inactiveDisabled = row.status.statusId === 1 ? '' : 'disabled'
            return `<!--<button class="btn btn-sm btn-dark me-1 dt-edit" data-id="${row.id}" >View</button> -->
    <button class="btn btn-sm btn-warning me-1 dt-edit" data-id="${row.id}" @click="approveOrReject" >Edit</button>
 <button class="btn btn-sm btn-primary me-1 dt-enable" data-id="${row.id}" @click="approveOrReject"${activeDisabled}>Enable</button>
<button class="btn btn-sm btn-danger me-1 dt-disable" data-id="${row.id}" ${inactiveDisabled}> Disable</button>`
          }
        }
      ],
      row: {}
    }
  },
  mounted() {
    // setTimeout(() => {
    //   this.loading = false;
    // }, 100);
    this.fetchUsers()
  },
  methods: {
    editUsers(item){
      console.log("user ",JSON.stringify(item))
      localStorage.setItem("selectedUser", JSON.stringify(item))
      this.$router.push('/updateUser');
    },
    showEnableDialog(row) {
      this.comment = ''
      this.row = row
      this.showEnableModal = true
    },
    showDisableDialog(row) {
      this.comment = ''
      this.row = row
      this.showDisableModal= true
    },

    showCreateDealDialog() {
      this.showCreateDealModal = true;
    },
    showCustomerModalDialog(){
      console.log("test")
      this.showCreateDealModal = false;
      this.showCustomerModal = true


    },
    showTellerModalDialog(){
      console.log("test")
      this.showCreateDealModal = false;
      this.showTellerModal = true
      this.idType =  'ACCNO'


    },

    enableRecord(row) {
      this.changeStatus(row, '1')
    },
    disableRecord(row) {
      this.changeStatus(row, '0')
    },
    changeStatus(row,status) {
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.user.editUser
      console.log('status', url)
      console.log('row ', url)
      this.row = row
      axios
        .post(url, {
          status: status,
          id: this.row?.userId
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
          console.log('User Update Request created successfully  ', this.userName)
          this.$router.push('/viewUsers')
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'User Update error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during User Update',
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

    fetchUsers() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.user.getUsers
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
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              }
            })
            return
          }
          this.users = data.data // reactive update, DataTable will redraw automatically
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Users',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }})
          console.error(error)
        })
        .finally(() => {
          this.loading = false // hide loader
        })
    },

    fetchAccounts(isCustomer) {
      console.log("iscustomer",isCustomer)
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchAccounts

      axios
        .post(url, {
          option: this.idType,
          customer: isCustomer,
          identificationNumber:this.idNumber
        })
        .then((response) => {
          const data = response.data
          var responseMessage = data.responseMessage
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,
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
          this.accounts = data.data // reactive update, DataTable will redraw automatically
          console.log("Accounts", this.accounts)
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Accounts',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }})
          console.error(error)
        })
        .finally(() => {
          this.loading = false // hide loader
        })
    }
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
            <h4 class="card-title">View Users</h4>
          </div>
          <div class="d-flex justify-content-end gap-3">
            <b-button variant="primary" class="px-4" @click="showCreateDealDialog"><i class="fa-solid fa-plus me-2"></i>  Create Deal Code </b-button>
          </div>
        </div>
        <div class="card-body px-3 pt-4 pb-3">
          <data-table
            :data="users" :columns="columns" :isFooter="true" :striped="false"
            @enable="showEnableDialog" @disable="showDisableDialog"
            @edit ="editUsers"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="showCreateDealModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal </h5>
        <button type="button" class="btn-close" @click="showCreateDealModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
           <strong>Is this person a Customer?</strong>
        </p>
        <p>
          Select whether a person has an existing account with us.
        </p>
        <div class="row w-100 g-4 justify-content-center">

          <!-- Cancel -->
          <div class="col-6">
            <button
              class="btn w-100 p-4 border rounded-3 text-center action-card danger"
              @click="showCustomerModalDialog()"
            >
              <div class="fw-bold fs-4">Yes</div>
              <div class="text-muted small">Existing Customer</div>
            </button>
          </div>

          <!-- Enable -->
          <div class="col-6">
            <button
              class="btn w-100 p-4 border rounded-3 text-center action-card success"
              @click="showTellerModalDialog()"
            >
              <div class="fw-bold fs-4">No</div>
              <div class="text-muted small">Non Customer</div>
            </button>
          </div>

        </div>
      </div>
      <div class="modal-footer justify-content-center">

      </div>


    </div>
  </div>

  <div v-if="showCustomerModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Request New Deal </h5>
        <button type="button" class="btn-close" @click="showCustomerModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          <strong>Customer Account Lookup</strong>
        </p>
        <p>
          Select whether a person has an existing account with us.
        </p>
<!--        <div class="row w-100 g-4 justify-content-center">-->

          <b-row class="mb-3">
            <b-col lg="6">
              <b-form-group label="Search By" label-for="search value" label-class="fw-semibold">
                <select v-model="idType" class="form-control" id="userRole">
                  <option v-for="option in options" :key="option.id" :value="option.id">
                    {{ option.name }}
                  </option>
                </select>
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
        <h5 class="modal-title text-center text-white">Request New Deal </h5>
        <button type="button" class="btn-close" @click="showTellerModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          <strong>Teller Account Lookup</strong>
        </p>
        <p>
          Kindly key in Teller Account.
        </p>
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
        <button class="btn btn-danger px-4" @click="showDisableModal= false">Cancel</button>
        <button class="btn btn-success px-4" @click="disableRecord(row)">Disable</button>
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
  overflow: hidden;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}

.modal-header,
.modal-footer {
  padding: 1rem;
}

.modal-body {
  padding: 1rem;
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

</style>
