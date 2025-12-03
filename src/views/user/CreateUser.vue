<script>
import env from "@/environment/environment";
import axios from "axios";
import config from "@/config/config";
import Swal from 'sweetalert2'
// import Swal from "sweetalert2";
// import store from "@/store";

export default {
  data() {
    return {
      userName: '',
      email:'',
      phone:'',
      role:'',
      roles:['1','2'],
      errors: {}, // Store error messages



    };
  },
  methods:{
    createUser(){
      if (!this.validateForm()) {
        console.log("Validation failed", this.errors);
        return; // Stop submission if validation fails
      }
      console.log("validation passed ")
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.user.createUser
      console.log("url ",url)
      const token = localStorage.getItem('token')
      console.log("token",token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.post(url, {
          userName: this.userName,
          phoneNumber: this.phone,
          email : this.email,
          roleId : this.role,

        }
      )
        .then(response => {
          var data = response.data
          /* Checking if error object was returned from the server */
          var responseCode = data.responseCode;
          var responseMessage = data.responseMessage;
          if (responseCode !== config.SUCCESS_RESPONSE_CODE) {
            this.responseMessage = responseMessage;
            this.errorMessage = responseMessage;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: this.responseMessage,
            });
            console.log(this.responseMessage);
            return
          }
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000, // Auto-closes after 3 seconds,
          });
          console.log("User created successfully  " ,this.userName)
          this.$router.push('/');
        })
        .catch(error => {
          console.log('Error is ',error)
          this.errorMessage = 'User Creation error';
          console.log(this.errorMessage);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: "An error occurred during User Creation",
          });
        }).finally(() => {
        // Code here will always execute after the promise resolves or rejects
        this.loading = false;
      })
    },
    validateForm(){
      this.errors = {}; // Clear previous errors
      if (!this.userName) {
        this.errors.userName = "UserName is required.";
      }
      else if (!config.TEXT_REGEX.test(this.userName) &&  !config.EMAIL_REGEX.test(this.userName)) {
        this.errors.userName = "Invalid UserName Input";
      }

      if (!this.email) {
        this.errors.email = "Email is required.";
      }
      else if (!config.EMAIL_REGEX.test(this.email)) {
        this.errors.email = "Invalid email format.";
      }

      if (!this.phone) {
        this.errors.phone = "Phone is required.";
      }
      else if (!config.PHONE_REGEX.test(this.phone)) {
        this.errors.phone = "Invalid phone number format.";
      }

      if (!this.role) {
        this.errors.role = "Role is required.";
      }

      if (Object.keys(this.errors).length > 0) {
        return false; // Validation failed
      }
      return true; // Validation passed


    }
  }
}
</script>
<template>
  <b-row>
    <b-col lg="12" sm="12">
      <b-card no-body class="shadow-sm rounded-3 border-0" data-aos-delay="800">
        <b-card-header header-class=" text-white py-3 d-flex justify-content-between align-items-center rounded-top">
          <h4 class="mb-0 font-weight-bold ">Create User</h4>
        </b-card-header>

        <b-card-body class="p-4">
          <b-form>
            <!-- Row 1 -->
            <b-row class="mb-3">
              <b-col lg="6">
                <b-form-group label="User Name" label-for="User Name" label-class="fw-semibold">
                  <b-form-input v-model="userName" type="email" placeholder="Enter User Name"></b-form-input>
                  <small v-if="errors.userName" class="text-danger">{{ errors.userName }}</small>
                </b-form-group>
              </b-col>

              <b-col lg="6">
                <b-form-group label="Email Address" label-for="email" label-class="fw-semibold">
                  <b-form-input v-model="email" type="email" placeholder="Enter email"></b-form-input>
                  <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
                </b-form-group>
              </b-col>
            </b-row>

            <!-- Row 2 -->
            <b-row class="mb-3">
              <b-col lg="6">
                <b-form-group label="Phone Number" label-for="phone" label-class="fw-semibold">
                  <b-form-input v-model="phone" placeholder="Enter Phone Number"></b-form-input>
                  <small v-if="errors.phone" class="text-danger">{{ errors.phone }}</small>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group label="Role" label-for="role" label-class="fw-semibold">
                  <b-form-select :options="roles" v-model="role" placeholder="Select Role"></b-form-select>
                  <small v-if="errors.role" class="text-danger">{{ errors.role }}</small>
                </b-form-group>
              </b-col>
            </b-row>


            <!-- Buttons -->
            <div class="d-flex justify-content-end gap-3">
              <b-button variant="primary" class="px-4" @click="createUser">Create User </b-button>
            </div>

          </b-form>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

