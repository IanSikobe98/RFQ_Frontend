<template>
  <router-view />

  <!-- Toast Container -->
  <Teleport to="body">
    <div id="toast-container" style="position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:9999;width:320px;">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px;position:relative;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);"
        >
          <!-- Icon -->
          <div :style="`width:32px;height:32px;border-radius:50%;background:${toastColors[toast.type].bg};color:${toastColors[toast.type].color};display:flex;align-items:center;justify-content:center;flex-shrink:0`" v-html="toastIcons[toast.type]" />

          <!-- Body -->
          <div style="flex:1;min-width:0">
            <p style="font-size:13px;font-weight:500;margin:0 0 2px;color:#111">{{ toast.title }}</p>
            <p v-if="toast.message" style="font-size:12px;color:#6b7280;margin:0;line-height:1.5">{{ toast.message }}</p>
          </div>

          <!-- Close -->
          <button @click="dismissToast(toast.id)" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;padding:0;flex-shrink:0">×</button>

          <!-- Progress bar -->
          <div :style="`position:absolute;bottom:0;left:0;height:2px;background:${toastColors[toast.type].bar};animation:toast-shrink ${toast.duration}ms linear forwards`" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import WebSocketService from '@/util/websocketService'
import { useStore } from 'vuex'
import '@/plugins/styles'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    store.dispatch('setting/setSetting')

    // ── Toast state ──────────────────────────────────────────────
    const toasts = ref([])

    const toastColors = {
      info:    { bg: '#eff6ff', color: '#1d4ed8', bar: '#3b82f6' },
      success: { bg: '#f0fdf4', color: '#15803d', bar: '#22c55e' },
      warning: { bg: '#fffbeb', color: '#b45309', bar: '#f59e0b' },
      danger:  { bg: '#fef2f2', color: '#b91c1c', bar: '#ef4444' },
    }

    const toastIcons = {
      info:    `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="7.2" y="7" width="1.6" height="5" rx="0.6"/><circle cx="8" cy="4.8" r="0.9"/></svg>`,
      success: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="7"/><polyline points="5,8.5 7,10.5 11,6"/></svg>`,
      warning: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5L1 14h14L8 1.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="7.2" y="6.5" width="1.6" height="4" rx="0.5"/><circle cx="8" cy="12" r="0.8"/></svg>`,
      danger:  `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="7"/><line x1="5.5" y1="5.5" x2="10.5" y2="10.5"/><line x1="10.5" y1="5.5" x2="5.5" y2="10.5"/></svg>`,
    }

    const showToast = (type = 'info', title = 'Notification', message = '', duration = 7000) => {
      const id = Date.now() + Math.random()
      toasts.value.push({ id, type, title, message, duration })
      setTimeout(() => dismissToast(id), duration)
    }

    const dismissToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) toasts.value.splice(index, 1)
    }

    // ── Sidebar resize ───────────────────────────────────────────
    const sidebarType = computed(() => store.getters['setting/sidebar_type'])
    const resizePlugin = () => {
      const sidebarResponsive = document.querySelector('[data-sidebar="responsive"]')
      if (window.innerWidth < 1025) {
        if (sidebarResponsive !== null) {
          if (!sidebarResponsive.classList.contains('sidebar-mini')) {
            sidebarResponsive.classList.add('on-resize')
            store.dispatch('setting/sidebar_type', [...sidebarType.value, 'sidebar-mini'])
          }
        }
      } else {
        if (sidebarResponsive !== null) {
          if (sidebarResponsive.classList.contains('sidebar-mini') && sidebarResponsive.classList.contains('on-resize')) {
            sidebarResponsive.classList.remove('on-resize')
            store.dispatch(
              'setting/sidebar_type',
              sidebarType.value.filter((item) => item !== 'sidebar-mini')
            )
          }
        }
      }
    }

    // ── Lifecycle ────────────────────────────────────────────────
    onMounted(() => {
      window.addEventListener('resize', resizePlugin)
      setTimeout(() => resizePlugin(), 200)

      WebSocketService.subscribe((data) => {
        console.log("🔔 Notification received globally:", data)

        // 🔔 Show toast based on notification type
        const type =  'info'   // use data.type if your backend sends it
        const title = data.notificationType || 'New Notification'
        const message = data.message || ''
        showToast(type, title, message)

        // ✅ Also store it in Vuex
        store.dispatch('notifications/addNotification', data)
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizePlugin)
    })

    return { toasts, toastColors, toastIcons, dismissToast }
  }
}
</script>

<style lang="scss">
@import '@fortawesome/fontawesome-free/css/all.css';
@import '@/assets/custom-vue/scss/styles.scss';

@keyframes toast-shrink {
  from { width: 100%; }
  to   { width: 0%; }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
