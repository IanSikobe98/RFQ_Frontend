<script>
import DataTable from '@/components/DataTable.vue'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'

export default {
  components: { AppLoader, DataTable },
  data() {
    return {
      users: [],
      showApproveModal: false,
      showRejectModal: false,
      loading: false,
      comment: '',
      columns: [
        { title: 'Name', data: 'username' },
        { title: 'Phone', data: 'phone' },
        { title: 'Email', data: 'email' },
        { title: 'Role', data: 'role.roleName' },
        { title: 'Action', data: 'action' },
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
            const approveDisabled = row.status.statusId === 6 ? '' : 'disabled'
            return `<button class="btn btn-sm btn-primary me-1 dt-approve" data-id="${row.id}"  ${approveDisabled}>Approve</button>
                   <button class="btn btn-sm btn-danger dt-reject" data-id="${row.id}" ${approveDisabled}>Reject</button>`
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
          approvalType: 'USER'
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
          console.log('User approved successfully  ')
          this.fetchUsers()
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'User Approval error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during User Approval',
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
    fetchUsers() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.user.getUserApprovals
      var statuses = [6];// Pending Status
      axios
        .post(url, {statuses:statuses, page: 0, size: 10 })
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage,            customClass: {
                confirmButton: 'btn btn-success px-4 me-2', // green button
                cancelButton: 'btn btn-secondary px-4' // gray button
              } })
            return
          }
          this.users = data.data // reactive update, DataTable will redraw automatically
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Users',            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            } })
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
            <h4 class="card-title">View User Approvals</h4>
          </div>
        </div>
        <div class="card-body px-3 pt-0 pb-3">
          <data-table :data="users" :columns="columns" :isFooter="true" :striped="false" @approve="showApproveDialog" @reject="showRejectionDialog" />
        </div>
      </div>
    </div>
  </div>

  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="custom-modal">
      <div class="modal-header modal-header-approve">
        <h5 class="modal-title text-center text-white">Approve User</h5>
        <button type="button" class="btn-close" @click="showApproveModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to approve <strong>{{ row?.username }}</strong
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
        <h5 class="modal-title text-center text-white">Reject User</h5>
        <button type="button" class="btn-close" @click="showRejectModal = false"></button>
      </div>
      <div class="modal-body">
        <i class="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
        <p>
          Are you sure you want to reject <strong>{{ row.username }}</strong
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
