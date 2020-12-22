<template>
  <div class="task-list">
    <div class="task-list__items-container">
      <el-card class="task-list__el-card">
        <template v-if="tasks.length > 0">
          <div class="task-list__item"
            v-for="task in tasks"
            :key="task.name"
          >
            <div class="task-list__item-body">
              <div class="task-list__item-title">
                {{ task.name }}
              </div>
              <div class="task-list__item-progress">
                <el-progress
                  :percentage="task.progress * 100"
                  :show-text="false"></el-progress>
              </div>
              <div class="task-list__item-message">
                {{ task.message }}
              </div>
            </div>
            <div class="task-list__item-footer">
              <div class="task-list__item-actions">
                <el-button
                  v-if="canPause(task.status)"
                  size="mini"
                  icon="el-icon-video-pause"
                  @click="emitTaskPause(task)"
                ></el-button>
                <el-button
                  v-if="canStart(task.status)"
                  size="mini"
                  icon="el-icon-video-play"
                  @click="emitTaskStart(task)"
                ></el-button>
              </div>
            </div>
          </div>
        </template>
        <div class="task-list__empty-notice"
          v-else
        >No tasks for now</div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tasks: {
      required: true,
      default: []
    }
  },

  methods: {
    canPause(status) {
      return status === 1;
    },

    canStart(status) {
      return status === 0;
    },

    emitTaskPause(task) {
      this.$emit('pauseTask', task.name);
    },

    emitTaskStart(task) {
      this.$emit('startTask', task.name);
    }
  }
}
</script>

<style lang="scss">
.task-list {
  position: fixed;
  width: 100%;
  margin: 0 auto;
  bottom: 40px;
}

.task-list__items-container {
  width: 95%;
  margin: 0 auto;
}

.task-list__el-card {
  .el-card__body {
    padding: 0;
  }
}

.task-list__item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #efefef;

  &:last-child {
    border-bottom: none;
  }
}

.task-list__item-body {
  flex: 1;
}

.task-list__item-title {
  margin-bottom: 5px;
  font-size: 14px;
  color: gray;
}

.task-list__item-footer {
  width: 50px;
  margin-left: 10px;
}

.task-list__item-message {
  margin-top: 3px;
  font-size: 12px;
  color: gray;
}

.task-list__empty-notice {
  font-size: 12px;
  color: gray;
  padding: 5px 0;
  text-align: center;
}
</style>
