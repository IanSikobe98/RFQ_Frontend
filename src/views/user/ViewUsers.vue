<template>
  <div class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between">
          <div class="header-title">
            <h4 class="card-title">View Users</h4>
          </div>
        </div>
        <div class="card-body px-3 pt-0 pb-3">
          <data-table
            :data="users"
            :columns="columns"
            :isFooter="true"
            :striped="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import env from "@/environment/environment";
import axios from "axios";
import config from "@/config/config";
import Swal from "sweetalert2";

export default {
  components: { DataTable },
  data() {
    return {
      users: [],
      columns: [
        { title: 'Name', data: 'username' },
        { title: 'Phone', data: 'phone' },
        { title: 'Email', data: 'email' },
        { title: 'Role', data: 'role.roleName' },
        {
          title: 'Status',
          data: 'status',
          render: function(data) {
            const id = Number(data.statusId)
            if (id === 1) return `<span class="badge bg-success">Active</span>`
            if (id === 2) return `<span class="badge bg-warning text-dark">Inactive</span>`;
            if (id === 6) return `<span class="badge bg-danger">Pending</span>`;
            return data
          }
        }
      ]
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    fetchUsers() {
      const url = env.apiUrl.baseUrl + env.apiUrl.user.getUsers
      const token = localStorage.getItem('token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      axios.post(url, { page: 0, size: 10 })
        .then(response => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({ icon: 'error', title: 'Error!', text: data.responseMessage })
            return
          }
          this.users = data.data // reactive update, DataTable will redraw automatically
        })
        .catch(error => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching Users' })
          console.error(error)
        })
    }
  }
}
</script>
