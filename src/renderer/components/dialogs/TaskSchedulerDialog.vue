<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog task-scheduler"
    :title="$t('_task_scheduler')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'960px'"
    :visible.sync="show"
  >
    <div class="task-scheduler__empty" v-if="schedules.length === 0">{{ $t('_no_schedule') }}</div>
    <div class="task-scheduler__schedules" v-else>
      <el-table
        :data="schedules"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          :label="$t('_name')"
        ></el-table-column>
        <el-table-column
          prop="state"
          :label="$t('_state')"
          width="120px"
          :formatter="stateFormatter"
        ></el-table-column>
        <el-table-column
          :label="$t('_latest_run_result')"
          width="150px"
        >
          <template slot-scope="scope">
            <span>
              {{ statusFormatter(scope.row.latestRunResult) }} {{ scope.row.latestRunResult }}
              <el-popover :content="scope.row.latestRunResultMessage">
                <i slot="reference" class="el-icon-warning"></i>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="latestRunAt"
          :label="$t('_latest_run_time')"
          :formatter="dateFormatter"
          width="150px"
        ></el-table-column>
        <el-table-column
          prop="nextRunAt"
          :label="$t('_next_run_time')"
          :formatter="dateFormatter"
          width="150px"
        ></el-table-column>
        <el-table-column
          :label="$t('_actions')"
          width="180px"
        >
          <template slot-scope="scope">
            <el-link type="primary" style="margin: 0 5px" @click="runTask(scope.row)">{{ $t('_run') }}</el-link>
            <el-link type="warning" style="margin: 0 5px" @click="pauseTask(scope.row)">{{ $t('_pause') }}</el-link>
            <el-link type="danger" style="margin: 0 5px" @click="deleteSchedule(scope.row)">{{ $t('_delete') }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button size="small"
        @click="openAddSchedulerDialog"
      >{{ $t('_add') }}</el-button>
      <el-button size="mini" type="danger"
        @click="$emit('update:show', false)"
      >{{ $t('_close') }}</el-button>
    </div>

    <schedule-dialog
      v-if="showAddScheduleDialog"
      :show.sync="showAddScheduleDialog"
    ></schedule-dialog>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';
import moment from 'moment';
import ScheduleDialog from './ScheduleDialog.vue';

export default {
  components: {
    'schedule-dialog': ScheduleDialog
  },

  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      schedules: [],
      showAddScheduleDialog: false
    }
  },

  created() {
    ipcRenderer.on('task-scheduler-service:all-schedules-gotten', (event, data) => {
      this.schedules = data;
    });

    ipcRenderer.on('task-scheduler-service:schedule-created', (event, data) => {
      this.schedules.push(data);
    });

    ipcRenderer.on('task-scheduler-service:schedule-deleted', (event, id) => {
      for (let i = 0; i < this.schedules.length; i++) {
        if (this.schedules[i].id === id) {
          this.schedules.splice(i, 1);
          break;
        }
      }
    });

    ipcRenderer.on('task-scheduler-service:schedule-updated', (event, data) => {
      for (let i = 0; i < this.schedules.length; i++) {
        if (this.schedules[i].id === data.id) {
          this.$set(this.schedules, i, data);
        }
      }
    });

    ipcRenderer.send('task-scheduler-service', {
      action: 'getAllSchedules'
    });
  },

  destroyed() {
    ipcRenderer.removeAllListeners('task-scheduler-service:all-schedules-gotten');
    ipcRenderer.removeAllListeners('task-scheduler-service:schedule-created');
    ipcRenderer.removeAllListeners('task-scheduler-service:schedule-deleted');
    ipcRenderer.removeAllListeners('task-scheduler-service:schedule-updated');
    console.log('task scheduler dialog was destroyed');
  },

  methods: {
    openAddSchedulerDialog() {
      this.showAddScheduleDialog = true;
    },

    dateFormatter(row, column, cellValue, index) {
      if (!cellValue) {
        return 'N/A';
      }

      return moment.unix(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },

    stateFormatter(row, column, cellValue) {
      switch (cellValue) {
        case 0:
          return this.$t('_idle');
        case 1:
          return this.$t('_processing');
        case 2:
          return this.$t('_stopping');
        case 3:
          return this.$t('_stop');
      }
    },

    statusFormatter(row, column, cellValue) {
      switch (cellValue) {
        case 0:
          return this.$t('_not_start');
        case 1:
          return this.$t('_failure');
        case 2:
          return this.$t('_complete');
        case 3:
          return this.$t('_aborted');
      }
    },

    runTask(schedule) {
      ipcRenderer.send("task-scheduler-service", {
        action: 'runTask',
        args: {
          id: schedule.id
        }
      });
    },

    pauseTask(schedule) {
      if (window.confirm(this.$t('_pause_task') + ' ' + schedule.name + '?')) {
        console.log('do delete');
      }
    },

    deleteSchedule(schedule) {
      if (window.confirm(this.$t('_delete_schedule') + ' ' + schedule.name + '?')) {
        console.log('do delete');
      }
    }
  }
}
</script>

<style lang="scss">
.task-scheduler__empty {
  text-align: center;
  font-size: 14px;
  padding-top: 10px;
}

.task-scheduler__schedule {
  display: flex;
  justify-content: space-between;
}

.task-scheduler__schedule-body {
  display: flex;
  flex-grow: 1;
}

.task-scheduler__schedule-foot {
  width: 150px;
}

.task-schedule__info {
  flex: 1;
}
</style>
