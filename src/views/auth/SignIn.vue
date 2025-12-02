<script setup>
// import { onBeforeUnmount, onBeforeMount } from "vue";
// import { useStore } from "vuex";
// import ArgonInput from "@/samples/ArgonInput.vue";
// import ArgonSwitch from "@/samples/ArgonSwitch.vue";
// import ArgonButton from "@/samples/ArgonButton.vue";
// import coopLogo from "@/assets/img/green.svg";
// import coopBankSoko from "@/assets/img/coopsoko.svg";
// import Loader from "@/components/Loader.vue";
// const body = document.getElementsByTagName("body")[0];

// const store = useStore();
// onBeforeMount(() => {
//   store.state.hideConfigButton = true;
//   store.state.showNavbar = false;
//   store.state.showSidenav = false;
//   store.state.showFooter = false;
//   body.classList.remove("bg-gray-100");
// });
// onBeforeUnmount(() => {
//   store.state.hideConfigButton = false;
//   store.state.showNavbar = true;
//   store.state.showSidenav = true;
//   store.state.showFooter = true;
//   body.classList.add("bg-gray-100");
// });
import '@/assets/css/global.scss'
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/fontawesome-svg-core';

</script>
<script>
import axios from 'axios';
import env from '../../environment/environment.js'
import config from '../../config/config.js'
import encryptText from "../../util/encryptor.js";

export default{
  data () {
    return {
      loading: false,
      username :'',
      password: '',
      responseMessage: '',
      displayError: false,
      errorMessage: '',
      isDisabled: false,
    }
  },
  computed: {
    // produceImage() {
    //   return {
    //     backgroundImage: `url${require('../assets/img/produce.jpg')}`,
    //     backgroundSize: 'cover'
    //   };
    // }
  },
  methods: {
    authenticate () {
      this.isDisabled = true;
      this.loading = true
      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.auth.login
      console.log("url ",url)
      this.loading = true
      const encryptedUsername = encryptText(this.username.trim())
      const encryptedPassword = encryptText(this.password);
      axios.post(url, { username: this.username.trim(), password: encryptedPassword })
        .then(response => {
          var data = response.data
          /* Checking if error object was returned from the server */
          var responseCode = data.responseCode;
          var responseMessage = data.responseMessage;
          if (responseCode === config.FAIL_RESPONSE_CODE) {
            this.responseMessage = responseMessage;
            this.errorMessage = responseMessage;
            console.log(this.responseMessage);
            this.displayError = true;
            return
          }

          console.log("Authentication Successful for " ,this.username)
          this.$store.commit('setUsername', encryptedUsername);
          this.$store.commit('setPassword' , encryptedPassword);
          this.$router.push('/validateOtp');
        })
        .catch(error => {
          console.log('Error is ',error)
          if(error.response) {
            if (error.response.status === 403) {
              this.errorMessage = 'Invalid Credentials';
              console.log(this.errorMessage);
              this.displayError = true;
            } else {
              this.errorMessage = 'Authentication error';
              console.log(this.errorMessage);
              this.displayError = true;
            }
          }
          else{
            this.errorMessage = 'Authentication error';
            console.log(this.errorMessage);
            this.displayError = true;
          }

        }).finally(() => {
        // Code here will always execute after the promise resolves or rejects
        this.loading = false;
        this.isDisabled = false;
      })
    }
    ,
    closeError(){
      this.displayError =false;
    },
    forgotPassword(){
      this.$router.push('/forgotPassword');
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
    }, 100);
  }

}
</script>

<template>
  <section class="login-content">
    <b-row class="m-0 align-items-center bg-white h-100">
      <b-col md="6">
        <b-row class="justify-content-center">
          <b-col md="10">
            <b-card class="card-transparent shadow-none d-flex justify-content-center mb-0 auth-card iq-auth-form">
              <router-link  class="navbar-brand d-flex align-items-center mb-3 text-primary">
                <b-col md ="12">
                <div class="logo-main text-center">
                  <img
                    class="text-center h-100"
                    src="@/assets/images/Kingdom-bank-logo.png"
                    alt="logo"
                    width="350"
                    height="100"
                  />
                </div>
                </b-col>
              </router-link>
              <h2 class="mb-2 text-center">Sign In</h2>
              <p class="text-center">Enter username and password to login.</p>
              <div  v-if="displayError" class="alert invalid-alert  mb-3"  @click="closeError">
                <span class="text-start"> {{ errorMessage }}</span>
                <i class="fas fa-times text-end" @click="closeError" ></i>
              </div>
              <form @submit.prevent="authenticate">
                <div class="row">
                  <div class="col-lg-12">
                    <div class="form-group">
                      <label for="email" class="form-label">Username</label>
                      <input type="text" class="form-control" id="username"  v-model="username" aria-describedby="email" placeholder=" " />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="form-group">
                      <label for="password" class="form-label">Password</label>
                      <input type="password" class="form-control" id="password"  v-model="password" aria-describedby="password" placeholder=" " />
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-center mt-20">
                  <button type="submit"  class="btn btn-primary" >Sign In</button>
                </div>

              </form>
            </b-card>
          </b-col>
        </b-row>

      </b-col>
      <div class="col-md-6 d-md-block d-none bg-primary p-0 vh-100 overflow-hidden">
        <img src="../../assets/images/auth/green-auth.png" class="img-fluid gradient-main animated-scaleX" alt="images" loading="lazy" />
      </div>
    </b-row>
  </section>
</template>

<script setup>
</script>

<style lang="scss" scoped></style>
