<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog"
    :title="$t('_schedule')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'480px'"
    :visible.sync="show"
  >
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button size="small"
        @click="addSchedule"
      >{{ $t('_add') }}</el-button>
      <el-button size="mini" type="danger"
        @click="$emit('update:show', false)"
      >{{ $t('_close') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  created() {
    ipcRenderer.on('task-scheduler-service:all-tasks-gotten', data => {
      console.log(data);
    });

    ipcRenderer.send('task-scheduler-service', {
      action: 'getAllTasks'
    });
  },

  destroyed() {
    ipcRenderer.removeAllListeners('task-scheduler-service:all-tasks-gotten');

    console.log('task scheduler dialog was destroyed');
  },

  methods: {
    addSchedule() {

    }
  }
}
</script>
