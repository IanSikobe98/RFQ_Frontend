<template>
  <table :class="tableClasses" ref="tableRef"></table>
</template>

<script setup>
import { onMounted, ref, defineProps, watch, onBeforeUnmount } from 'vue'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import 'datatables.net-bs5/js/dataTables.bootstrap5.min.js'
import 'datatables.net-bs5'
import $ from 'jquery'

const props = defineProps({
  data: Array,
  columns: Array,
  options: Object,
  isFooter: Boolean,
  striped: { type: Boolean, default: true },
  hover: { type: Boolean, default: true },
  bordered: { type: Boolean, default: false },
  mb0: { type: Boolean, default: true },
  stripeColors: { type: Array, default: () => ['#f8f9fa', '#ffffff'] } // odd, even
})

const tableRef = ref(null)
let tableInstance = null

const tableClasses = [
  'table',
  props.striped ? 'table-striped' : '',
  props.hover ? 'table-hover' : '',
  props.bordered ? 'table-bordered' : '',
  props.mb0 ? 'mb-0' : ''
].filter(Boolean).join(' ')

// Initialize DataTable
const initTable = () => {
  // If instance exists, destroy and clear DOM
  if (tableInstance) {
    tableInstance.destroy()
    $(tableRef.value).empty()
  }

  tableInstance = $(tableRef.value).DataTable({
    autoWidth: false,
    data: props.data,
    columns: props.columns,
    dom: '<"row mb-3"<"col-md-6"><"col-md-6"f>>' +
      '<"table-responsive my-3" rt>' +
      '<"row align-items-center"<"col-md-6"l><"col-md-6"p>>' +
      '<"row mt-2"<"col-md-6"i>>',
    destroy: true,
    initComplete: () => {
      // Add footer once
      // if (props.isFooter) {
      //   const footerRow = document.createElement('tr')
      //   props.columns.forEach(col => {
      //     const footerCell = document.createElement('th')
      //     footerCell.append(col.title)
      //     footerRow.append(footerCell)
      //   })
      //   $(tableRef.value).append($('<tfoot>').append(footerRow))
      // }
      // Apply stripe colors
      if (props.striped) applyStripeColors()
    }
  })
}

// Apply custom stripe colors
const applyStripeColors = () => {
  $(tableRef.value).find('tbody tr:nth-of-type(odd)').css('background-color', props.stripeColors[0])
  $(tableRef.value).find('tbody tr:nth-of-type(even)').css('background-color', props.stripeColors[1])
}

// Watch for data changes and update table reactively
watch(() => props.data, (newData) => {
  if (tableInstance) {
    tableInstance.clear()
    tableInstance.rows.add(newData)
    tableInstance.draw()
    if (props.striped) applyStripeColors()
  } else {
    initTable()
  }
})

// Initialize table on mount
onMounted(() => initTable())

// Destroy table on unmount
onBeforeUnmount(() => {
  if (tableInstance) tableInstance.destroy()
})
</script>

<style scoped>
@import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

/* Hover effect for all rows */
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1) !important;
  cursor: pointer;
}

/* Footer inputs */
tfoot input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ced4da !important;
  border-radius: 0.25rem;
}

/* Remove extra spacing if mb-0 is set */
.table.mb-0 {
  margin-bottom: 0 !important;
}
</style>
