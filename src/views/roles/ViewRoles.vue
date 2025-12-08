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
      roles: [],
      showEnableModal: false,
      showDisableModal: false,
      loading: false,
      comment: '',
      columns: [
        { title: 'Name', data: 'roleName' },
        { title: 'Description', data: 'roleDescription' },
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
    this.fetchRoles()
  },
  methods: {
    editUsers(item){
      console.log("role ",JSON.stringify(item))
      localStorage.setItem("selectedRole", JSON.stringify(item))
      this.$router.push('/updateRole');
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

    enableRecord(row) {
      this.changeStatus(row, '1')
    },
    disableRecord(row) {
      this.changeStatus(row, '0')
    },
    changeStatus(row,status) {
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.roles.editRole
      console.log('status', url)
      console.log('row ', url)
      this.row = row
      axios
        .post(url, {
          status: status,
          id: this.row?.roleId
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
          console.log('Role Update Request created successfully  ', this.userName)
          this.$router.push('/viewRoles')
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Role Update error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Role Update',
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

    fetchRoles() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.roles.getRoles

      axios
        .post(url, { page: 0, size: 10 })
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
          this.roles = data.data // reactive update, DataTable will redraw automatically
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Roles',
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
            <h4 class="card-title">View Roles</h4>
          </div>
        </div>
        <div class="card-body px-3 pt-0 pb-3">
          <data-table
            :data="roles" :columns="columns" :isFooter="true" :striped="false"
            @enable="showEnableDialog" @disable="showDisableDialog"
          @edit ="editUsers"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="showEnableModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Enable Role</h5>
        <button type="button" class="btn-close" @click="showEnableModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to enable <strong>{{ row?.roleName }}</strong
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
        <h5 class="modal-title text-center text-white">Disable Role</h5>
        <button type="button" class="btn-close" @click="showDisableModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to Disable <strong>{{ row.roleName }}</strong
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
  width: 400px;
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
</style>
