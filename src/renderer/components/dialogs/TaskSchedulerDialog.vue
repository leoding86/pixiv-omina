<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog task-scheduler"
    :title="$t('_task_scheduler')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'640px'"
    :visible.sync="show"
  >
    <p v-if="schedules.length === 0">{{ $t('_no_schedule') }}</p>
    <div class="task-scheduler__schedules" v-else>
      <div class="task-scheduler__schedule"
        v-for="schedule in schedules" :key="schedule.id"
      >
        <div class="task-scheduler__schedule-body">
          {{ schedules }}
        </div>
        <div class="task-scheduler__schedule-foot">
          actions in here
        </div>
      </div>
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
      console.log(data);
    });

    ipcRenderer.send('task-scheduler-service', {
      action: 'getAllSchedules'
    });
  },

  destroyed() {
    ipcRenderer.removeAllListeners('task-scheduler-service:all-schedules-gotten');
    console.log('task scheduler dialog was destroyed');
  },

  methods: {
    openAddSchedulerDialog() {
      this.showAddScheduleDialog = true;
    }
  }
}
</script>
