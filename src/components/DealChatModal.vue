<template>
  <div v-if="showDealChatModal" class="modal-backdrop" @click.self="$emit('close')">
    <div class="chat-modal">
      <!-- Header -->
      <div class="chat-modal-header">
        <div class="header-left">
          <div class="deal-title">{{ row?.currencyPair }} {{ row?.buySell }} {{ row?.fromCurrency }} Deal</div>
          <div class="header-sub">
            <span class="order-id">{{ row?.orderId }}</span>
            <span class="badge" :class="statusBadgeClass">{{ statusLabel }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="rate-chip">
            <span class="rate-label">Provided Rate</span>
            <span class="rate-value">{{ row?.negotiatedRate ?? '—' }}</span>
          </div>
          <button class="close-btn" @click="$emit('close')">&#x2715;</button>
        </div>
      </div>

      <!-- Chat Body -->
      <div class="chat-body" ref="chatBody">
        <div class="date-divider">{{ chatDate }}</div>

        <template v-for="(msg, index) in messages" :key="index">
          <!-- System message -->
          <div v-if="msg.type === 'system'" class="system-msg">
            <strong>{{ msg.title }}</strong> — {{ msg.text }}
          </div>

          <!-- Regular message -->
          <div v-else class="msg-row" :class="msg.direction === 'out' ? 'outgoing' : 'incoming'">
            <div v-if="msg.direction === 'in'" class="msg-sender">{{ msg.sender }}</div>
            <div class="msg-bubble-wrap">
              <div class="avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
              <!-- Rate pill style -->
              <div v-if="msg.isRate" class="bubble rate-pill">
                <span class="rate-tag">rate: {{ msg.rate }}</span>
              </div>
              <!-- Normal bubble -->
              <div v-else class="bubble" :class="msg.direction === 'out' ? 'bubble-out' : 'bubble-in'">
                {{ msg.text }}
              </div>
            </div>
            <div class="msg-time" :style="msg.direction === 'out' ? 'text-align:right' : ''">
              {{ msg.time }}
            </div>
          </div>
        </template>

        <!-- Typing indicator -->
<!--        <div v-if="isTyping" class="msg-row incoming">-->
<!--          <div class="msg-bubble-wrap">-->
<!--            <div class="avatar">-->
<!--              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">-->
<!--                <circle cx="12" cy="8" r="4" stroke="#fff" stroke-width="2" />-->
<!--                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" stroke-width="2" stroke-linecap="round" />-->
<!--              </svg>-->
<!--            </div>-->
<!--            <div class="bubble bubble-in typing-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>-->
<!--          </div>-->
<!--        </div>-->
      </div>

      <!-- Action Buttons -->
<!--      <div v-if="showActions" class="action-row">-->
<!--        <button class="act-btn act-reject" @click="handleAction('reject')">-->
<!--          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">-->
<!--            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />-->
<!--            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />-->
<!--          </svg>-->
<!--          Reject Deal-->
<!--        </button>-->
<!--        <button class="act-btn act-negotiate" @click="handleAction('negotiate')">-->
<!--          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">-->
<!--            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />-->
<!--          </svg>-->
<!--          Negotiate-->
<!--        </button>-->
<!--        <button class="act-btn act-accept" @click="handleAction('accept')">-->
<!--          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">-->
<!--            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />-->
<!--          </svg>-->
<!--          Accept Deal-->
<!--        </button>-->
<!--      </div>-->

      <!-- Footer Input -->
<!--      <div class="chat-footer">-->
<!--        <div class="chat-input-row">-->
<!--          <textarea ref="chatInput" v-model="newMessage" class="chat-input" rows="1" placeholder="Type a message or proposed rate..." @keydown.enter.exact.prevent="sendMessage"></textarea>-->
<!--          <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">-->
<!--            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">-->
<!--              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />-->
<!--            </svg>-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'DealChatModal',

  props: {
    showDealChatModal: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close', 'action'],

  data() {
    return {
      newMessage: '',
      isTyping: false,
      dealStatus: null,
      messages: [],
      user: {},
    }
  },

  mounted() {
    this.user = JSON.parse(store.state.user)
  },

  computed: {
    chatDate() {
      const d = this.row?.requestDate ? new Date(this.row.requestDate) : new Date()
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    currentStatus() {
      return this.dealStatus ?? this.row?.status?.statusId
    },
    statusLabel() {
      const map = { 1: 'Accepted' ,0: 'Inactive', 3: 'Failed',6: 'Pending', 7: 'Rejected', 8: 'Rate Proposed', 9: 'New', 10: 'Negotiating' }
      return map[this.currentStatus] ?? this.row?.status?.statusName ?? 'Unknown'
    },
    statusBadgeClass() {
      const map = {
        1: 'badge-success', 0: 'badge-danger', 3: 'badge-danger', 6: 'badge-warning',
        7: 'badge-rejected', 8: 'badge-info', 9: 'badge-info', 10: 'badge-warning'
      }
      return map[this.currentStatus] ?? 'badge-info'
    },
    showActions() {
      return ![1, 7].includes(this.currentStatus)
    }
  },

  watch: {
    showDealChatModal(val) {
      if (val) {
        this.dealStatus = null
        this.buildInitialMessages()
        this.$nextTick(() => this.scrollToBottom())
      }
    }
  },

  methods: {
    formatTime(date = new Date()) {
      return date.toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).replace(',', '')
    },

    buildInitialMessages() {
      this.messages = []
      console.log("this.user", this.user.user.userId)
      const comments = this.row?.commentsDtoList ?? []

      // Seed from existing comments on the row
      comments.forEach((c) => {
        this.messages.push({
          type: 'chat',
          direction: c.createdBy === this.user?.user?.userId ? 'out' : 'in',
          sender: c.creator,
          text: c.comment,
          time: c.dateCreated ? this.formatTime(new Date(c.dateCreated)) : this.formatTime()
        })
      })

      // Add treasury rate message if present
      // if (this.row?.treasuryRate) {
      //   this.messages.push({
      //     type: 'chat',
      //     direction: 'in',
      //     sender: this.row?.dealerId ?? 'Treasury',
      //     isRate: true,
      //     rate: this.row.treasuryRate,
      //     time: this.row?.requestDate ? this.formatTime(new Date(this.row.requestDate)) : this.formatTime()
      //   })
      // }

      // Add system message for rejected/expired deals
      if (this.currentStatus === 7) {
        this.messages.push({
          type: 'system',
          title: 'End of conversation',
          text: 'Rfq was rejected. Rejection reason: THE INITIATOR TOOK TOO LONG TO ACTION. DEAL EXPIRED, INITIATE A NEW REQUEST.'
        })
      }
    },

    // sendMessage() {
    //   const text = this.newMessage.trim()
    //   if (!text) return
    //
    //   this.messages.push({
    //     type: 'chat',
    //     direction: 'out',
    //     text,
    //     time: this.formatTime()
    //   })
    //   this.newMessage = ''
    //   this.$nextTick(() => this.scrollToBottom())
    // },
    //
    // handleAction(action) {
    //   const actionMap = {
    //     reject: {
    //       outText: 'Deal rejected',
    //       sysTitle: 'Deal Rejected',
    //       sysText: 'Teller has rejected this deal request.',
    //       newStatus: 7
    //     },
    //     negotiate: {
    //       outText: 'Requesting negotiation on rate',
    //       sysTitle: 'Negotiation initiated',
    //       sysText: 'Awaiting counter-offer from treasury.',
    //       newStatus: 10
    //     },
    //     accept: {
    //       outText: 'Deal accepted ✓',
    //       sysTitle: 'Deal Accepted',
    //       sysText: `Deal code ${this.row?.dealerCode ?? 'pending'} has been confirmed successfully.`,
    //       newStatus: 1
    //     }
    //   }
    //
    //   const m = actionMap[action]
    //   if (!m) return
    //
    //   this.messages.push({
    //     type: 'chat',
    //     direction: 'out',
    //     text: m.outText,
    //     time: this.formatTime()
    //   })
    //
    //   // Simulate brief typing delay before system message
    //   this.isTyping = true
    //   this.$nextTick(() => this.scrollToBottom())
    //
    //   setTimeout(() => {
    //     this.isTyping = false
    //     this.messages.push({ type: 'system', title: m.sysTitle, text: m.sysText })
    //     this.dealStatus = m.newStatus
    //     this.$nextTick(() => this.scrollToBottom())
    //     this.$emit('action', { action, row: this.row })
    //   }, 900)
    // },

    scrollToBottom() {
      const el = this.$refs.chatBody
      if (el) el.scrollTop = el.scrollHeight
    }
  }
}
</script>

<style scoped>
/* ── Backdrop ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
  padding: 20px;
}

/* ── Modal Shell ── */
.chat-modal {
  background: #fff;
  border-radius: 18px;
  width: 560px;
  max-width: 96%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.28s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Header ── */
.chat-modal-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.deal-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.header-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-id {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

/* ── Badges ── */
.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.badge-success {
  background: #d1fae5;
  color: #065f46;
}
.badge-rejected {
  background: #dc2626;
  color: #fff;
}
.badge-warning {
  background: #fef3c7;
  color: #92400e;
}
.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}
.badge-info {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* ── Rate chip & close ── */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rate-chip {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 5px 12px;
  text-align: right;
}
.rate-chip .rate-label {
  display: block;
  color: rgba(255, 255, 255, 0.75);
  font-size: 10px;
}
.rate-chip .rate-value {
  display: block;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Chat body ── */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f4f6f8;
  scroll-behavior: smooth;
}

.date-divider {
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  position: relative;
  margin: 4px 0;
}
.date-divider::before,
.date-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 38%;
  height: 1px;
  background: #e5e7eb;
}
.date-divider::before {
  left: 0;
}
.date-divider::after {
  right: 0;
}

/* ── Message rows ── */
.msg-row {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}
.msg-row.outgoing {
  align-self: flex-end;
  align-items: flex-end;
}
.msg-row.incoming {
  align-self: flex-start;
  align-items: flex-start;
}

.msg-sender {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 3px;
  padding: 0 4px;
}

.msg-bubble-wrap {
  display: flex;
  align-items: flex-end;
  gap: 7px;
}
.msg-row.outgoing .msg-bubble-wrap {
  flex-direction: row-reverse;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Bubbles ── */
.bubble {
  max-width: 100%;
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
}
.bubble-out {
  background: #10b981;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.bubble-in {
  background: #fff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}
.rate-pill {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
}
.rate-tag {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #065f46;
  border-radius: 20px;
  padding: 3px 11px;
  font-size: 12px;
  font-weight: 600;
}

.msg-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 3px;
  padding: 0 4px;
}

/* ── System message ── */
.system-msg {
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: #7f1d1d;
  line-height: 1.6;
  align-self: center;
  max-width: 90%;
  text-align: center;
}
.system-msg strong {
  font-weight: 600;
}

/* ── Typing dots ── */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  min-width: 52px;
}
.dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  animation: blink 1.2s infinite;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ── Action row ── */
.action-row {
  display: flex;
  gap: 8px;
  padding: 10px 14px 0;
  flex-wrap: wrap;
  background: #fff;
  border-top: 1px solid #f3f4f6;
}
.act-btn {
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}
.act-reject {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.act-reject:hover {
  background: #fee2e2;
}

.act-negotiate {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}
.act-negotiate:hover {
  background: #fef3c7;
}

.act-accept {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}
.act-accept:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

/* ── Footer ── */
.chat-footer {
  padding: 10px 14px 14px;
  background: #fff;
  flex-shrink: 0;
}
.chat-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.chat-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 9px 13px;
  font-size: 13px;
  resize: none;
  min-height: 38px;
  max-height: 90px;
  outline: none;
  font-family: inherit;
  color: #1f2937;
  background: #f9fafb;
  transition: border-color 0.2s;
  line-height: 1.5;
}
.chat-input:focus {
  border-color: #10b981;
  background: #fff;
}

.send-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 10px;
  color: #fff;
  width: 38px;
  height: 38px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
}
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Scrollbar ── */
.chat-body::-webkit-scrollbar {
  width: 4px;
}
.chat-body::-webkit-scrollbar-track {
  background: transparent;
}
.chat-body::-webkit-scrollbar-thumb {
  background: #d1fae5;
  border-radius: 4px;
}
</style>
