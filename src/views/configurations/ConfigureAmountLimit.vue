<script>
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import AppLoader from '@/components/loader/AppLoader.vue'
import store from '@/store'

export default {
  components: { AppLoader },
  data() {
    return {
      permissions: [],
      user: {},
      loading: false,
      userName: '',
      email: '',
      phone: '',
      role: '',
      roles: [],
      weekDays:[],
      errors: {},
      minLimitAmount: 0.00,

    }
  },
  computed:{
    canUpdateThresholdAmount () {
      return this.hasPerm("CONFIGURE_THRESHOLD_AMOUNT");
    },
    canViewUsers () {
      return this.hasPerm("VIEW_USERS");
    },
  },
  mounted() {
    this.user = JSON.parse(store.state.user);
    this.permissions = this.user?.usersPerm;
    this.fetchThresholdAmount();
  },
  methods: {
    hasPerm (permission) {
      return this.permissions && this.permissions.includes(permission)
    },

    viewUsers(){
      this.$router.push('/viewUsers');
    },
    fetchThresholdAmount() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.fetchAmountThreshold
      axios
        .post(url, )
        .then((response) => {
          const data = response.data
          if (data.responseCode !== config.SUCCESS_RESPONSE_CODE) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.responseMessage,
              customClass: {
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            return
          }
          this.minLimitAmount = data.data
          console.log("minamount",this.minLimitAmount)
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error occurred fetching minimum Threshold Amount',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    updateThresholdAmount() {
      this.loading = true
      this.message = ''

      var url = env.apiUrl.baseUrl + env.apiUrl.rfq.updateAmountThreshold
      console.log('url ', url)
      const token = localStorage.getItem('token')
      console.log('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios
        .post(url, {
          amount: this.minLimitAmount
        })
        .then((response) => {
          var data = response.data
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
                confirmButton: 'btn btn-success px-4 me-2',
                cancelButton: 'btn btn-secondary px-4'
              }
            })
            console.log(this.responseMessage)
            return
          }
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: responseMessage,
            timer: 3000,
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
          console.log('Threshold amount updated successfully  ', this.userName)
          this.$router.push('/updateLimit')
        })
        .catch((error) => {
          console.log('Error is ', error)
          this.errorMessage = 'Threshold amount Update error'
          console.log(this.errorMessage)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred during Threshold amount Update',
            customClass: {
              confirmButton: 'btn btn-success px-4 me-2',
              cancelButton: 'btn btn-secondary px-4'
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<template>
  <!-- Loader -->
  <div>
    <AppLoader v-if="loading" />
  </div>

  <!-- Main Content Wrapper -->
  <div class="main-content-wrapper">
    <div class="row">
      <div class="col-lg-12">
        <div class="form-card">
          <!-- Card Header -->
          <div class="form-card-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <!-- Outer coin -->
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

                  <!-- Currency symbol (generic) -->
                  <path d="M9.5 10.5C9.5 9.67 10.17 9 11 9H13C13.83 9 14.5 9.67 14.5 10.5C14.5 11.33 13.83 12 13 12H11C10.17 12 9.5 12.67 9.5 13.5C9.5 14.33 10.17 15 11 15H13C13.83 15 14.5 14.33 14.5 13.5"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

                  <!-- Vertical line (like dollar symbol spine) -->
                  <path d="M12 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4 class="form-title">Threshold Amount Configuration</h4>
                <p class="form-subtitle">Configure threshold amount for Forex Quote Operations</p>
              </div>
            </div>

          </div>

          <!-- Card Body -->
          <div class="form-card-body">
            <form @submit.prevent="updateThresholdAmount">


              <!-- ✅ Weekly Availability Schedule Section -->
              <!-- ✅ Amount Limit Section -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <h5 class="section-title">Amount Limit</h5>
                </div>

                <div class="form-group">
                  <!-- Minimum Limit Input -->
                  <div class="amount-input-row">
                    <label class="form-label">
                      <span class="required">*</span> Minimum Limit Amount (USD)
                    </label>
                    <div class="amount-input-wrapper">
                      <input
                        type="number"
                        v-model="minLimitAmount"
                        step="0.01"
                        min="0"
                        class="amount-input"
                        placeholder="0.00"
                      />
                      <div class="amount-stepper">
                        <button type="button" class="stepper-btn" @click="minLimitAmount = parseFloat((minLimitAmount + 0.01).toFixed(2))">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                        <button type="button" class="stepper-btn" @click="minLimitAmount = parseFloat(Math.max(0, minLimitAmount - 0.01).toFixed(2))">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Current Limit Display Card -->
                  <div class="current-limit-card">
                    <span class="current-limit-label">CURRENT LIMIT:</span>
                    <span class="current-limit-value">${{ parseFloat(minLimitAmount || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="$router.go(-1)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Cancel</span>
                </button>
                <button v-if="canUpdateThresholdAmount" type="submit" class="btn btn-primary">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <!-- Outer coin -->
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

                    <!-- Currency symbol (generic) -->
                    <path d="M9.5 10.5C9.5 9.67 10.17 9 11 9H13C13.83 9 14.5 9.67 14.5 10.5C14.5 11.33 13.83 12 13 12H11C10.17 12 9.5 12.67 9.5 13.5C9.5 14.33 10.17 15 11 15H13C13.83 15 14.5 14.33 14.5 13.5"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

                    <!-- Vertical line (like dollar symbol spine) -->
                    <path d="M12 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>Update Amount</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Content Wrapper - Prevents overlap with subheader */
.main-content-wrapper {
  min-height: calc(100vh - 280px - 80px);
  padding-top: 20px;
  padding-bottom: 60px;
}

/* Form Card - Matching Dashboard Style */
.form-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
  border: 2px solid rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.2);
}

/* Card Header */
.form-card-header {
  padding: 28px;
  border-bottom: 2px solid #f0fdf4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 14px;
  color: #059669;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.view-users-btn {
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

.view-users-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Card Body */
.form-card-body {
  padding: 32px 28px;
}

/* Info Banner */
.info-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  gap: 14px;
  margin-bottom: 32px;
}

.info-banner .info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-text strong {
  color: #1e40af;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.info-text p {
  color: #3b82f6;
  font-size: 13px;
  margin: 0;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.form-section:hover {
  border-color: #d1fae5;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Form Groups */
.form-group {
  margin-bottom: 0;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  display: block;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

/* Modern Input */
.modern-input,
.modern-select {
  width: 100%;
  padding: 12px 14px 12px 46px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  transition: all 0.2s ease;
  background: white;
}

.modern-input:focus,
.modern-select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  outline: none;
}

.modern-input:focus + .input-icon,
.modern-select:focus + .input-icon {
  color: #10b981;
}

.modern-input::placeholder {
  color: #9ca3af;
}

.modern-input.is-invalid,
.modern-select.is-invalid {
  border-color: #ef4444;
}

.modern-input.is-invalid:focus,
.modern-select.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* Modern Select */
.modern-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  cursor: pointer;
}

.modern-select:focus {
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}

.error-message svg {
  flex-shrink: 0;
  stroke: #ef4444;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0fdf4;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-outline {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content-wrapper {
    padding-top: 16px;
    padding-bottom: 40px;
  }

  .form-card-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content {
    width: 100%;
  }

  .header-actions {
    width: 100%;
  }

  .view-users-btn {
    width: 100%;
    justify-content: center;
  }

  .form-card-body {
    padding: 24px 20px;
  }

  .form-section {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .info-banner {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .form-title {
    font-size: 18px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .section-icon {
    width: 36px;
    height: 36px;
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  animation: slideInUp 0.4s ease-out;
}

/* ── Day Schedule Cards ── */
.day-schedule-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px 22px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.day-schedule-card.day-active {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.08);
}

.day-schedule-card:last-child {
  margin-bottom: 0;
}

/* Day Header Row */
.day-header-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.day-label {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  transition: color 0.2s;
}

.day-label-inactive {
  color: #9ca3af;
}

/* Toggle Switch */
.day-toggle {
  position: relative;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  border-radius: 13px;
  background: #d1d5db;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  top: 3px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

/* Time Range Row */
.time-range-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
}

.time-input-group {
  flex: 1;
  position: relative;
}

.time-icon-wrap {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.time-input {
  width: 100%;
  padding: 11px 12px 11px 36px;
  border: 2px solid #d1fae5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
  background: #f0fdf4;
  outline: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.time-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.time-separator {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

/* Not Available Banner */
.not-available-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1.5px dashed #e5e7eb;
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

.not-available-banner svg {
  stroke: #d1d5db;
  flex-shrink: 0;
}

/* Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}


/* ── Amount Limit Section ── */
.amount-input-row {
  margin-bottom: 16px;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #d1fae5;
  border-radius: 10px;
  overflow: hidden;
  background: #f0fdf4;
  transition: all 0.2s ease;
  max-width: 320px;
  margin: 0 auto;
}

.amount-input-wrapper:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.amount-input {
  flex: 1;
  padding: 11px 16px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #065f46;
  outline: none;
  text-align: center;
  -moz-appearance: textfield;
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.amount-stepper {
  display: flex;
  flex-direction: column;
  border-left: 2px solid #d1fae5;
}

.stepper-btn {
  flex: 1;
  padding: 6px 10px;
  background: white;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  line-height: 1;
}

.stepper-btn:first-child {
  border-bottom: 1px solid #e5e7eb;
}

.stepper-btn:hover {
  background: #f0fdf4;
  color: #059669;
}

.stepper-btn:active {
  background: #d1fae5;
}

/* Current Limit Display Card */
.current-limit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  max-width: 320px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.current-limit-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #9ca3af;
  text-transform: uppercase;
}

.current-limit-value {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
</style>
