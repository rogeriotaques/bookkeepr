<script setup>
import { ref, onMounted } from 'vue';

const amount = ref('');

onMounted(() => {
  if (amount) amount.value.focus();
});
</script>

<template>
  <div class="container new-entry">
    <div class="row gap-5">
      <div class="col-4">
        <div class="card">
          <div class="card__body">
            <label for="input">Amount</label>
            <div class="input input--with-addons">
              <p class="input__addon">¥</p>
              <input ref="amount" type="text" placeholder="E.g. 1,234" autofocus />
            </div>

            <label for="input">Description</label>
            <div class="input">
              <input type="text" placeholder="E.g. Lunch with a friend" />
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

            <label for="input">Date</label>
            <div class="input">
              <input type="date" />
            </div>
          </div>

          <div class="card__footer">
            <a class="card__link">Save</a>
          </div>
        </div>
        <!-- .card -->
      </div>
      <div class="col">
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
            <tr>
              <td colspan="5">
                <div class="new-entry__empty">No entries yet!</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row {
  .row {
    .col-6 + .col-6 {
      margin-left: 16px;
    }
  }
}

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
  }
}
</style>
