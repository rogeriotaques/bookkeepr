<template>
  <div class="balance-table">
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Description</th>
          <th>Outcome</th>
          <th>Income</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <!--
        <tr>
          <td>2021-01-01</td>
          <td>Salary</td>
          <td>¥0.00</td>
          <td>¥10,000.00</td>
          <td>¥10,000.00</td>
        </tr>
        <tr>
          <td>2021-01-01</td>
          <td>Salary</td>
          <td>¥0.00</td>
          <td>¥10,000.00</td>
          <td>¥10,000.00</td>
        </tr>
        -->
        <TableEmptyCard />
      </tbody>
    </table>
  </div>
  <!-- .balance-table -->
</template>

<script setup lang="ts">
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';
</script>

<style lang="scss" scoped>
.balance-table {
  table {
    th {
      font-family: Impact, sans-serif;
    }

    th,
    td {
      padding: 8px 16px;
      font-size: 18px;
    }

    tr:nth-child(even) {
      background-color: #e9e9e9;
    }
  }
}
</style>
