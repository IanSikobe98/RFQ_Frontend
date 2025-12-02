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
<style scoped>

.otp-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.otp-input {
  width: 50px; /* Adjust the width as needed */
  height: 50px; /* Adjust the height as needed */
  margin: 0 5px; /* Spacing between inputs */
  font-size: 24px; /* Font size for the numbers */
  text-align: center; /* Center the text */
  border: 2px solid green; /* Border color */
  border-radius: 5px; /* Rounded corners */
  outline: none; /* Remove default outline */
  transition: border-color 0.3s; /* Smooth transition for border color */
}

.otp-input:focus {
  border-color: lightgreen; /* Change border color on focus */
}

.otp-input::placeholder {
  color: #aaa; /* Placeholder color */
}




</style>
<script>
import axios from 'axios';
import env from '../../environment/environment.js'
import config from '../../config/config.js'
import encryptText from "../../util/encryptor.js";
import Swal from 'sweetalert2'
import store from "@/store";
import decryptText from "../../util/decryptor.js";


export default{
  data () {
    return {
      loading:false,
      username :'',
      password: '',
      responseMessage: '',
      otp: ['', '', '', '', ''] ,// Array to hold OTP digits
      displayError: false,
      errorMessage: ''
    }
  },
  computed: {
  },
  methods: {
    moveToNext(index) {
      // Move to the next input if a digit is entered
      if (this.otp[index].length === 1 && index < 4) {
        this.$nextTick(() => {
          this.$refs[`otp${index + 1}`].focus();
        });
      }

      // Move to the previous input on backspace
      if (this.otp[index].length === 0 && index > 0) {
        this.$nextTick(() => {
          this.$refs[`otp${index - 1}`].focus();
        });
      }
      if(index === 4){
        this.checkOtpCompletion()
      }
    },

    checkOtpCompletion() {
      // Check if all inputs are filled
      if (this.otp.every(digit => digit.length === 1)) {
        this.submitOtp(); // Auto-submit if all inputs are filled
      }
    },
    submitOtp() {
      this.loading = true;
      const otpValue = this.otp.join('');
      console.log('otp is ',otpValue)

      this.message = ''
      var url = env.apiUrl.baseUrl + env.apiUrl.auth.validateOtp
      console.log("url ",url)
      this.loading = true
      var encryptedUsername = store.state.username
      this.username = decryptText(encryptedUsername);
      this.password = store.state.password;
      axios.post(url, { username: this.username.trim(), password: this.password , otp : otpValue })
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
          var token = data.token;
          var user = data.user;
          console.log("user",user)
          this.$store.commit('setToken', token);
          this.$store.commit('setUser',JSON.stringify(user));
          this.$store.commit('clearOtpState');
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000, // Auto-closes after 3 seconds,
          });
          this.$router.push('/');
        })
        .catch(error => {
          console.log('Error is ',error)
          this.errorMessage = 'Authentication error';
          console.log(this.errorMessage);
          this.displayError = true;
        }).finally(() => {
        // Code here will always execute after the promise resolves or rejects
        this.loading = false;
      })

    },
    closeError(){
      this.displayError =false;
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
              <router-link class="navbar-brand d-flex align-items-center mb-3 text-primary">
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
              <div  v-if="displayError" class="alert invalid-alert  mb-3"  @click="closeError">
                <span class="text-start"> {{ errorMessage }}</span>
                <i class="fas fa-times text-end" @click="closeError" ></i>
              </div>
              <div class="card-body">
                <div class="otp-container ">
                  <h4 class="font-weight-bolder">Enter OTP</h4>
                  <div v-if="displayError" class="alert invalid-alert  mb-3"  @click="closeError">
                    <span class="text-start"> {{ errorMessage }}</span>
                    <i class="fas fa-times text-end" @click="closeError" ></i>
                  </div>
                  <div class="otp-inputs">
                    <input
                      type="text"
                      maxlength="1"
                      v-model="otp[0]"
                      @input="moveToNext(0)"
                      class="otp-input"
                      ref="otp0"
                    />
                    <input
                      type="text"
                      maxlength="1"
                      v-model="otp[1]"
                      @input="moveToNext(1)"
                      class="otp-input"
                      ref="otp1"
                    />
                    <input
                      type="text"
                      maxlength="1"
                      v-model="otp[2]"
                      @input="moveToNext(2)"
                      class="otp-input"
                      ref="otp2"
                    />
                    <input
                      type="text"
                      maxlength="1"
                      v-model="otp[3]"
                      @input="moveToNext(3)"
                      class="otp-input"
                      ref="otp3"
                    />
                    <input
                      type="text"
                      maxlength="1"
                      v-model="otp[4]"
                      @input="moveToNext(4)"
                      class="otp-input"
                      ref="otp4"
                    />

                  </div>
                </div>
                <div class="text-center">
                  <!--                    <argon-button-->
                  <!--                        class="mt-4"-->
                  <!--                        variant="gradient"-->
                  <!--                        color="success"-->
                  <!--                        fullWidth-->
                  <!--                        size="lg"-->
                  <!--                    >Back to Sign in</argon-button-->
                  <!--                    >-->
                </div>
              </div>
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
