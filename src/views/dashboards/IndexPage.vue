<template>
  <div class="row">
      <div class="col-md-12 col-xl-12" data-aos="fade-up" data-aos-delay="800">
        <div class="d-slider1 overflow-hidden swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events">
          <!--          <Swiper-->
          <!--            class="p-0 m-0 mb-2 swiper-wrapper list-inline"-->
          <!--            :modules="modules"-->
          <!--            :slide-per-view="4"-->
          <!--            :space-between="32"-->
          <!--            :breakpoints="{-->
          <!--              320: { slidesPerView: 1 },-->
          <!--              550: { slidesPerView: 2 },-->
          <!--              991: { slidesPerView: 3 },-->
          <!--              1400: { slidesPerView: 3 },-->
          <!--              1500: { slidesPerView: 4 },-->
          <!--              1920: { slidesPerView: 4 },-->
          <!--              2040: { slidesPerView: 7 },-->
          <!--              2440: { slidesPerView: 8 }-->
          <!--            }"-->
          <!--            :navigation="{-->
          <!--              nextEl: '#blog-tranding-next',-->
          <!--              prevEl: '#blog-tranding-prev'-->
          <!--            }">-->
          <!--            <SwiperSlide class="swiper-slide card card-slide" v-for="(item, index) in swiperItems" :key="index">-->
          <!--&lt;!&ndash;              <b-card-body>&ndash;&gt;-->
          <!--&lt;!&ndash;                <div class="progress-widget">&ndash;&gt;-->
          <!--&lt;!&ndash;                  <analytics-widget :index="index" :title="item.title" :size="item.size" :sub-title="item.subTitle" :value="item.value" :color="item.color" :is-profit="item.isProfit">&ndash;&gt;-->
          <!--&lt;!&ndash;                    <svg class="card-slie-arrow" width="24" height="24px" viewBox="0 0 24 24" v-if="index % 2">&ndash;&gt;-->
          <!--&lt;!&ndash;                      <path fill="currentColor" d="M19,6.41L17.59,5L7,15.59V9H5V19H15V17H8.41L19,6.41Z"></path>&ndash;&gt;-->
          <!--&lt;!&ndash;                    </svg>&ndash;&gt;-->
          <!--&lt;!&ndash;                    <svg class="card-slie-arrow" width="24" height="24" viewBox="0 0 24 24" v-else>&ndash;&gt;-->
          <!--&lt;!&ndash;                      <path fill="currentColor" d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z"></path>&ndash;&gt;-->
          <!--&lt;!&ndash;                    </svg>&ndash;&gt;-->
          <!--&lt;!&ndash;                  </analytics-widget>&ndash;&gt;-->
          <!--&lt;!&ndash;                  <div class="progress-detail">&ndash;&gt;-->
          <!--&lt;!&ndash;                    <p class="mb-2">{{ item.subTitle }}</p>&ndash;&gt;-->
          <!--&lt;!&ndash;                    <h4 class="counter">{{ item.amount }}</h4>&ndash;&gt;-->
          <!--&lt;!&ndash;                  </div>&ndash;&gt;-->
          <!--&lt;!&ndash;                </div>&ndash;&gt;-->
          <!--&lt;!&ndash;              </b-card-body>&ndash;&gt;-->
          <!--              <div class="credit-card-widget" data-aos="fade-up" data-aos-delay="700">-->
          <!--              <div class="card-header pb-4 border-0">-->
          <!--                <div class="p-4 primary-gradient-card rounded border border-white">-->
          <!--                  <div class="d-flex justify-content-between align-items-center">-->
          <!--                    <div>-->
          <!--                      <h5 class="font-weight-bold">VISA</h5>-->
          <!--                      <p class="mb-0">PREMIUM ACCOUNT</p>-->
          <!--                    </div>-->
          <!--                    <div class="master-card-content">-->
          <!--                      <svg class="master-card-1" width="60" height="60" viewBox="0 0 24 24">-->
          <!--                        <path fill="#ffffff" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />-->
          <!--                      </svg>-->
          <!--                      <svg class="master-card-2" width="60" height="60" viewBox="0 0 24 24">-->
          <!--                        <path fill="#ffffff" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />-->
          <!--                      </svg>-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                  <div class="my-4">-->
          <!--                    <div class="card-number">-->
          <!--                      <span class="fs-5 me-2">5789</span>-->
          <!--                      <span class="fs-5 me-2">****</span>-->
          <!--                      <span class="fs-5 me-2">****</span>-->
          <!--                      <span class="fs-5">2847</span>-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                  <div class="d-flex align-items-center mb-2 justify-content-between">-->
          <!--                    <p class="mb-0">Card holder</p>-->
          <!--                    <p class="mb-0">Expire Date</p>-->
          <!--                  </div>-->
          <!--                  <div class="d-flex align-items-center justify-content-between">-->
          <!--                    <h6>Mike Smith</h6>-->
          <!--                    <h6 class="ms-5">06/11</h6>-->
          <!--                  </div>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--              </div>-->
          <!--            </SwiperSlide>-->
          <!--          </Swiper>-->

          <div class="page">
            <RateCarousel :rates="rates" />
          </div>

          <div class="swiper-button swiper-button-next" id="blog-tranding-next"></div>
          <div class="swiper-button swiper-button-prev" id="blog-tranding-prev"></div>
          <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
        </div>
      </div>
    </div>
      <div class="row">
        <div class="col-md-12 col-xl-12">
          <div class="overflow-hidden card aos-init aos-animate" data-aos="fade-up" data-aos-delay="600">
            <div class="flex-wrap card-header d-flex justify-content-between">
              <div class="header-title">
                <h4 class="mb-2 card-title">Requested Deals</h4>
              </div>
            </div>
            <div class="p-0 card-body">
              <div class="mt-4 table-responsive">
                <data-table v-if="tableReady" :data="dealRequests" :columns="columns" :isFooter="true" :striped="false" />
              </div>
            </div>
          </div>
        </div>
      </div>

</template>

<script>
import { onMounted, ref } from 'vue'
import { Navigation } from 'swiper'
import AOS from 'aos'
import updateUser from '@/views/user/UpdateUser.vue'
import store from '@/store'
import env from '@/environment/environment'
import axios from 'axios'
import config from '@/config/config'
import Swal from 'sweetalert2'
import DataTable from '@/components/DataTable.vue'
import RateCarousel from '@/components/RateCarousel.vue'
export default {
  components: {
    RateCarousel,
    DataTable,
  },
  setup() {
    const modules = [Navigation]
    const grossSaleChart = ref({
      series: [
        {
          name: 'total',
          data: [94, 80, 94, 80, 94, 80, 94]
        },
        {
          name: 'pipline',
          data: [72, 60, 84, 60, 74, 60, 78]
        }
      ],
      options: {
        chart: {
          fontFamily: '"Inter", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          height: 245,
          type: 'area',
          toolbar: {
            show: false
          },
          sparkline: {
            enabled: false
          }
        },
        colors: ['#3a57e8', '#079aa2'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        yaxis: {
          show: true,
          labels: {
            show: true,
            minWidth: 19,
            maxWidth: 19,
            style: {
              colors: '#8A92A6'
            },
            offsetX: -5
          }
        },
        legend: {
          show: false
        },
        xaxis: {
          labels: {
            minHeight: 22,
            maxHeight: 22,
            show: true,
            style: {
              colors: '#8A92A6'
            }
          },
          lines: {
            show: false // or just here to disable only x axis grids
          },
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug']
        },
        grid: {
          show: false
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: true,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 50, 80],
            colors: ['#3a57e8', '#4bc7d2']
          }
        },
        tooltip: {
          enabled: true
        }
      }
    })
    const earningChart = ref({
      series: [55, 75],
      options: {
        chart: {
          height: 260,
          type: 'radialBar'
        },
        colors: ['#4bc7d2', '#3a57e8'],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 10,
              size: '50%'
            },
            track: {
              margin: 10,
              strokeWidth: '50%'
            },
            dataLabels: {
              show: false
            }
          }
        }
      }
    })
    const conversionChart = ref({
      series: [
        {
          name: 'Successful deals',
          data: [30, 50, 35, 60, 40, 60, 60, 30, 50, 35]
        },
        {
          name: 'Failed deals',
          data: [40, 50, 55, 50, 30, 80, 30, 40, 50, 55]
        }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 230,
          stacked: true,
          toolbar: {
            show: false
          }
        },
        colors: ['#3a57e8', '#4bc7d2'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '28%',
            endingShape: 'rounded',
            borderRadius: 5
          }
        },
        legend: {
          show: false
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S', 'M', 'T', 'W'],
          labels: {
            minHeight: 20,
            maxHeight: 20,
            style: {
              colors: '#8A92A6'
            }
          }
        },
        yaxis: {
          title: {
            text: ''
          },
          labels: {
            minWidth: 19,
            maxWidth: 19,
            style: {
              colors: '#8A92A6'
            }
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return '$ ' + val + ' thousands'
            }
          }
        }
      }
    })
    const swiperItems = ref([
      {
        size: 90,
        amount: '560K',
        subTitle: 'Total Sales',
        color: 'primary'
      },
      {
        size: 80,
        amount: '185K',
        subTitle: 'Total Profit',
        color: 'info'
      },
      {
        size: 70,
        amount: '375K',
        subTitle: 'Total Cost',
        color: 'primary'
      },
      {
        size: 60,
        amount: '742K',
        subTitle: 'Revenue',
        color: 'info'
      },
      {
        size: 50,
        amount: '150K',
        subTitle: 'Net Income',
        color: 'primary'
      },
      {
        size: 40,
        amount: '4600',
        subTitle: 'Today',
        color: 'info'
      },
      {
        size: 30,
        amount: '11.2M',
        subTitle: 'Members',
        color: 'primary'
      }
    ])
    onMounted(() => {
      AOS.init({
        disable: function () {
          var maxWidth = 996
          return window.innerWidth < maxWidth
        },
        once: true,
        duration: 800
      })
    })
    return { modules, grossSaleChart, earningChart, conversionChart, swiperItems }
  },
  data() {
    return {
      tableReady: false,
      loading: false,
      dealRequests: [],
      permissions: [],
      exchangeRates: [],
      rates : [
        { pair: 'DKK/KES', label: 'Danish Krone / Kenyan Shilling', buy: '-', sell: '22.23928' },
        { pair: 'JPY/KES', label: 'Japanese Yen / Kenyan Shilling', buy: '0.75437', sell: '0.91167' },
        { pair: 'KES/UGX', label: 'Kenyan Shilling / Ugandan Shilling', buy: '20.83043', sell: '32.98579' }
      ]
    }
  },
  computed: {
    columns() {
      const canApprove = this.canApproveDealCodeRequests



      const cols = [
        { title: 'Customer Name', data: 'customerName' },
        { title: 'AccountNumber', data: 'accountNumber' },
        { title: 'Amount', data: 'counterNominalAmount' },
        { title: 'Currency Pair', data: 'currencyPair' },

        { title: 'Buy/Sell', data: 'buySell' },
        {
          title: 'Request Date',
          data: 'requestDate',
          render: function (data) {
            var a = new Date(data)
            return a.toISOString().split('T')[0]
          }
        },
        { title: 'Value Date', data: 'valueDate' },
        { title: 'Negotiated Rate', data: 'negotiatedRate' },

        {
          title: 'Deal Status',
          data: 'status',
          render: function (data) {
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
          render: function (data, type, row) {
            if (canApprove) {
              const approveDisabled = row.status.statusId === 6 ? '' : 'disabled'
              return `
                    <button class="btn btn-sm btn-dark dt-view" data-id="${row.id}" >View Details</button>
                    <button class="btn btn-sm btn-primary me-1 dt-approve" data-id="${row.id}"  ${approveDisabled}>Approve</button>
                   <button class="btn btn-sm btn-danger dt-reject" data-id="${row.id}" ${approveDisabled}>Reject</button>`
            } else return ''
          }
        })
      }
      return cols
    },

    updateUser() {
      return updateUser
    },
    canCreateDealCodeRequests() {
      return this.hasPerm('CREATE_DEAL_REQUESTS')
    },
    canApproveDealCodeRequests() {
      return this.hasPerm('APPROVE_DEAL_REQUESTS')
    }
  },
  mounted() {
    this.user = JSON.parse(store.state.user)
    this.permissions = this.user?.usersPerm
    this.tableReady = true
    this.fetchDealRequests()
    this.getAllExchangeRates()
  },
  methods: {
    hasPerm(permission) {
      return this.permissions && this.permissions.includes(permission)
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

    getAllExchangeRates() {
      this.loading = true
      const url = env.apiUrl.baseUrl + env.apiUrl.rfq.getAllExchangeRates

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
          this.exchangeRates = data.data // reactive update, DataTable will redraw automatically
          console.log('exchange rates ', this.exchangeRates)
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
    }
  }
}
</script>
