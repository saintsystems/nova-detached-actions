<template>
    <button
            :data-testid="actionId"
            :dusk="duskId"
            :title="__(action.name)"
            :class="action.classes ?? 'hover:bg-gray-200 dark:hover:bg-gray-900 flex-shrink-0 rounded focus:outline-none focus:ring inline-flex items-center font-bold px-3 h-9 text-sm flex-shrink-0'"
            @click="$emit('click')"
    >
        <span class="mr-1">
            <Icon
                :class="'shrink-0 text-gray-700 dark:text-gray-400 '+ action.iconClasses"
                :name="action.icon"
                type="mini"
              />
        </span>
        <span>{{ __(action.name) }}</span>
    </button>
</template>
<script setup>

import {onMounted, ref} from "vue";

import { Icon } from 'laravel-nova-ui'

const props = defineProps({
    action: {type: Object, required: true}
});

const emit = defineEmits(['click']);

const actionId = ref('');
const duskId = ref('');

onMounted(() => {
    let actionCode = props.action.name.toLowerCase().replace(/ /g, "-");

    actionId.value = `import-action-${actionCode}`;
    duskId.value = `run-action-button-${actionCode}`;
});

</script>
