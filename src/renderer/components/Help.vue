<template>
  <div class="app-help">
    <p><strong>{{ $t('_pixiv_valid_rename_placeholders') }}: </strong></p>
    <p>%id%, %title%, %user_id%, %user_name%, %page_num%, %year%, %month%, %day%</p>
    <el-divider></el-divider>
    <p><strong>{{ $t('_pixiv_novel_valid_rename_placeholder') }}: </strong></p>
    <p>%id%, %title%, %user_id%, %user_name%, %year%, %month%, %day%</p>
    <el-divider></el-divider>
    <p><strong>{{ $t('_pixiv_comic_valid_rename_placeholders') }}: </strong></p>
    <p>%id%, %work_id%, %sub_title%, %number_title%, $title%, %user_name%, %page_num%</p>
    <el-divider></el-divider>
    <p><strong>{{ $t('_you_can_add_forward_slashs_to_save_images_in_subfolder_eg') }}: </strong></p>
    <p>%user_id%/%title%</p>
  </div>
</template>
