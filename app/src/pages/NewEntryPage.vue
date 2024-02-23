<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { IconReportOff, IconCalendar, IconCurrencyYen } from '@tabler/icons-vue';

const amount = ref('');

onMounted(() => {
  nextTick(() => {
    if (amount) amount.value.focus();
  });
});
</script>

<template>
  <div class="new-entry">
    <div class="row">
      <div class="col-4">
        <div class="card">
          <div class="card__body">
            <div class="row">
              <div class="col-12">
                <label for="input">Amount</label>
                <div class="input input--with-addons">
                  <p class="input__addon input__addon--icon">
                    <IconCurrencyYen size="18" />
                  </p>
                  <input ref="amount" type="text" placeholder="E.g. 1,234" />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <label for="input">Description</label>
                <div class="input">
                  <input type="text" placeholder="E.g. Lunch with a friend" />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-6">
                <label for="input">Group</label>
                <div class="input">
                  <select>
                    <option value="">Select</option>
                  </select>
                </div>
              </div>
              <div class="col-6">
                <label for="input">Wallet</label>
                <div class="input">
                  <select>
                    <option value="">Select</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <label for="input">Date</label>
                <div class="input input--with-addons">
                  <p class="input__addon input__addon--icon"><IconCalendar size="18" /></p>
                  <input type="date" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- .card -->

        <button type="submit" class="is-full-width">Save</button>
      </div>
      <div class="col-8">
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
            <tr class="table__empty">
              <td colspan="5">
                <div class="new-entry__empty">
                  <div>
                    <IconReportOff size="48" color="gray" />
                  </div>
                  <p>No entries yet!</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

  .table__empty {
    td {
      border: 0;
    }
  }
}

.card {
  max-width: 640px;
  box-shadow: none;

  &__body {
    padding: 16px;
  }

  &__link {
    cursor: pointer;
    font-weight: bold;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  }
}

.new-entry {
  &__empty {
    padding: 8px 16px;
    font-size: 24px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

.input {
  input {
    height: 48px;
  }

  &__addon {
    min-width: 54px;

    &--icon {
      display: flex;
      align-items: center;
      height: 48px;
    }
  }
}
</style>
