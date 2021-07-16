<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog schedule"
    :title="$t('_schedule')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'480px'"
    :visible.sync="show"
  >
    <div class="schedule-form">
      <el-form ref="scheduleForm" :rules="scheduleFormRules" :model="scheduleFormData" size="small" label-width="100px">

        <div class="app-dialog__section-title">{{ $t('_base') }}</div>

        <el-form-item :label="$t('_name')" prop="name">
          <el-input v-model="scheduleFormData.name"></el-input>
        </el-form-item>

        <el-form-item :label="$t('_task')" prop="taskKey">
          <el-select v-model="scheduleFormData.taskKey" :disabled="tasks.length < 1">
            <el-option v-for="task in tasks"
              :key="task.key"
              :label="task.name"
              :value="task.key"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('_mode')" prop="mode">
          <el-select v-model="scheduleFormData.mode">
            <el-option v-for="mode in modes"
              :key="mode.value"
              :label="mode.label"
              :value="mode.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('_interval_min')" prop="interval" v-if="scheduleFormData.mode === 1">
          <el-input v-model="scheduleFormData.interval">
            <el-checkbox slot="append" v-model="scheduleFormData.repeat">{{ $t('_repeat') }}</el-checkbox>
            <el-checkbox slot="append" v-model="scheduleFormData.runImmediately">{{ $t('_run_now') }}</el-checkbox>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('_run_at')" prop="runAt" v-else-if="scheduleFormData.mode === 2">
          <el-input v-model="scheduleFormData.runAt">
            <el-checkbox slot="append" v-model="scheduleFormData.repeat">{{ $t('_repeat') }}</el-checkbox>
            <el-checkbox slot="append" v-model="scheduleFormData.runImmediately">{{ $t('_run_now') }}</el-checkbox>
          </el-input>
        </el-form-item>

        <template v-if="taskArgumentsConfig">
          <div class="app-dialog__section-title">{{ $t('_task_arguments') }}</div>

          <el-form-item v-for="config in taskArgumentsConfig"
            :key="config.name"
            :label="config.label || config.name"
          >
            <el-input v-if="config.fieldType === 'text'" v-model="scheduleFormData.taskArguments[config.name]"></el-input>
          </el-form-item>
        </template>
      </el-form>
    </div>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button size="small"
        @click="createSchedule"
        :disabled="createRecentlyClicked"
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
    },

    scheduleConfig: {
      required: false,
      type: Object
    }
  },

  data() {
    return {
      createRecentlyClicked: false,

      scheduleFormData: {
        taskKey: '',
        mode: 2,
        interval: '720',
        runAt: '14:00:00',
        runImmediately: false,
        repeat: false,
        taskArguments: {}
      },

      avaliableTasks: [],

      modes: [{
        label: this.$t('_interval'),
        value: 1
      }, {
        label: this.$t('_run_at'),
        value: 2
      }],

      scheduleFormRules: {
        name: [
          { validator: (rule, value, callback) => !!value ? callback() : callback(new Error(this.$t('_input_task_name'))), trigger: 'blur' }
        ],
        taskKey: [
          { validator: (rule, value, callback) => !!this.getTaskConfig() ? callback() : callback(new Error(this.$t('_invalid_task'))), trigger: 'change' },
        ],
        mode: [
          { validator: (rule, value, callback) => [1, 2].indexOf(value) >= 0 ? callback() : callback(new Error(this.$t('_invalid_mode'))), trigger: 'change' },
        ],
        interval: [
          {
            validator(rule, value, callback) {
              if (this.scheduleFormData.mode === 1) {
                if (!/^1\d*$/.test(value) || value < 1) {
                  callback(new Error(this.$t('_interval_should_greater_then_1_min')));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            },

            trigger: 'blur'
          }
        ],
        runAt: [
          {
            validator(rule, value, callback) {
              if (!/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value)) {
                callback(new Error(this.$t('_the_time_should_be_like_23:59:59')))
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {
    tasks() {
      if (this.avaliableTasks.length > 0) {
        return this.avaliableTasks;
      } else {
        return {
          key: '00000000',
          name: this.$t('_no_task')
        }
      }
    },

    taskArgumentsConfig() {
      return this.getTaskArgumentsConfig(this.scheduleFormData.taskKey);
    }
  },

  watch: {
    scheduleFormData: {
      deep: true,
      handler(oldValue, newValue) {
        if (oldValue.taskKey !== newValue.taskKey) {
          let taskArgumentsConfig = this.getTaskArgumentsConfig(newValue.taskKey);

          if (taskArgumentsConfig) {
            taskArgumentsConfig.forEach(config => {
              this.$set(this.scheduleFormData.taskArguments, config.name, null)
            });
          }
        }
      }
    }
  },

  created() {
    ipcRenderer.on('task-scheduler-service:all-tasks-gotten',(event, data) => {
      this.avaliableTasks = data;
    });

    ipcRenderer.on('task-scheduler-service:schedule-created', (event, data) => {
      this.$message({ message: this.$t('_schedule_created') });
      this.$emit('update:show', false);
    });

    ipcRenderer.send('task-scheduler-service', {
      action: 'getAllTasks'
    });
  },

  destroyed() {
    ipcRenderer.removeAllListeners('task-scheduler-service:all-tasks-gotten');

    ipcRenderer.removeAllListeners('task-scheduler-service:schedule-added');
  },

  methods: {
    getTaskConfig(key = null) {
      let taskKey = key || this.scheduleFormData.taskKey;

      for (let i = 0; i < this.avaliableTasks.length; i++) {
        if (this.avaliableTasks[i].key === taskKey) {
          return this.avaliableTasks[i];
        }
      }

      return null;
    },

    getTaskArgumentsConfig(key = null) {
      let taskConfig = this.getTaskConfig(key);

      if (taskConfig && taskConfig.argumentsConfig && taskConfig.argumentsConfig.length > 0) {
        return taskConfig.argumentsConfig;
      } else {
        return null;
      }
    },

    createSchedule() {
      this.$refs['scheduleForm'].validate(valid => {
        if (valid) {
          this.createRecentlyClicked = true;

          setTimeout(() => this.createRecentlyClicked = false, 1000);

          ipcRenderer.send('task-scheduler-service', {
            action: 'createSchedule',
            args: this.scheduleFormData
          });
        } else {
          this.$message({
            type: 'error',
            message: this.$t('_please_check_settings'),
          });

          return false;
        }
      })
    }
  }
}
</script>

<style lang="scss">
.schedule-form {
  padding: 10px;
}
</style>
