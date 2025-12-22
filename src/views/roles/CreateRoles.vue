<script>
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'
// import Swal from "sweetalert2";
// import store from "@/store";

export default {
  components: { AppLoader },
  data() {
    return {
      loggedInPermissions: [],
      user: {},
      loading: false,
      roleName:'',
      roleDescription:'',
      role: '',
      permissions: [],
      selectedPermissions: [],
      errors: {} // Store error messages
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.loggedInPermissions = this.user?.usersPerm;
    this.fetchPermissions();
  },
  computed:{
    canCreateRoles () {
      return this.hasPerm("CREATE_ROLES");
    },
    canViewRoles () {
      return this.hasPerm("VIEW_ROLES");
    },
  },
  methods: {
    hasPerm (permission) {
      return this.loggedInPermissions && this.loggedInPermissions.includes(permission)
    },
    viewRoles(){
      this.$router.push('/viewRoles');
    },
    fetchPermissions() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.permissions.getPermissions

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
          this.permissions = data.data // reactive update, DataTable will redraw automatically
        })
        .catch((error) => {
          Swal.fire({ icon: 'error', title: 'Error!', text: 'Error occurred fetching permissions' ,
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
    createRole() {
      if (!this.validateForm()) {
        console.log('Validation failed', this.errors)
        return // Stop submission if validation fails
      }
      console.log('validation passed ')
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.roles.createRoles
      console.log('url ', url)

      axios
        .post(url, {
          name: this.roleName,
          description: this.roleDescription,
          permissions: this.selectedPermissions,
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
          console.log('Role created successfully  ', this.userName)
          this.$router.push('/viewRoles')
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Role Creation error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Role Creation',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2', // green button
              cancelButton: 'btn btn-secondary px-4' // gray button
            }
          })
        })
        .finally(() => {
          // Code here will always execute after the promise resolves or rejects
          this.loading = false
        })
    },
    validateForm() {
      this.errors = {} // Clear previous errors
      if (!this.roleName) {
        this.errors.roleName = "Role Name is required.";
      }
      if (!this.roleDescription) {
        this.errors.roleDescription = "Role Description is required.";
      }

      if(this.selectedPermissions.length ===0){
        this.errors.selectedPermissions= "Please select atleast one Permission for the Role";
      }

      if (Object.keys(this.errors).length > 0) {
        return false // Validation failed
      }
      return true // Validation passed
    }
  }
}
</script>
<template>
  <!--  Define Loader     -->
  <div>
    <AppLoader v-if="loading" />
  </div>
  <b-row>
    <b-col lg="12" sm="12">
      <b-card no-body class="shadow-sm rounded-3 border-0" data-aos-delay="800">
        <b-card-header header-class=" text-white py-3 d-flex justify-content-between align-items-center rounded-top">
          <h4 class="mb-0 font-weight-bold">Create Role</h4>
          <!-- Buttons -->
          <div class="d-flex justify-content-end gap-3">
            <b-button v-if="canViewRoles" variant="primary" class="px-4" @click="viewRoles">View Roles </b-button>
          </div>
        </b-card-header>

        <b-card-body class="p-4">
          <b-form>
            <!-- Row 1 -->
            <b-row class="mb-3">
              <b-col lg="6">
                <b-form-group label="Role Name" label-for="Role Name" label-class="fw-semibold">
                  <b-form-input v-model="roleName" type="text" placeholder="Enter Role Name"></b-form-input>
                  <small v-if="errors.roleName" class="text-danger">{{ errors.roleName }}</small>
                </b-form-group>
              </b-col>

              <b-col lg="6">
                <b-form-group label="Role Description" label-for="text" label-class="fw-semibold">
                  <b-form-input v-model="roleDescription" type="email" placeholder="Enter role Description"></b-form-input>
                  <small v-if="errors.roleDescription" class="text-danger">{{ errors.roleDescription }}</small>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row v-if="permissions.length !== 0">

                <p class="text-uppercase text-sm"><strong>Permissions</strong></p>
                <div v-for="(permission, index) in permissions" :key="index">
                  <label>
                    <input
                      type="checkbox"
                      :value="permission.privilegeId"
                      v-model="selectedPermissions"
                    />
                    {{ permission.privilegeName }}
                  </label>
                </div>
                <small v-if="errors.selectedPermissions" class="text-danger">{{ errors.selectedPermissions}}</small>


            </b-row>





            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-3">
              <b-button v-if="canCreateRoles" variant="primary" class="px-4" @click="createRole">Create Role </b-button>
            </div>
          </b-form>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>
