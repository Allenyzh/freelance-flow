import { mount, type MountingOptions } from "@vue/test-utils";
import { createPinia } from "pinia";
import type { Component } from "vue";

const naiveStubs = {
  NForm: { template: "<form><slot /></form>" },
  NFormItem: {
    props: ["label"],
    template:
      '<div class="n-form-item"><label>{{label}}</label><slot /></div>',
  },
  NInput: {
    props: ["value", "disabled", "type", "autosize", "show-password-on"],
    emits: ["update:value"],
    template:
      '<textarea v-if="type === \'textarea\'" :value="value" :disabled="disabled" @input="$emit(\'update:value\', $event.target.value)"></textarea>' +
      '<input v-else :type="type || \'text\'" :value="value" :disabled="disabled" @input="$emit(\'update:value\', $event.target.value)" />',
  },
  NInputNumber: {
    props: ["value", "disabled"],
    emits: ["update:value"],
    template:
      '<input type="number" :value="value" :disabled="disabled" @input="$emit(\'update:value\', parseInt($event.target.value, 10))" />',
  },
  NSwitch: {
    props: ["value", "disabled"],
    emits: ["update:value"],
    template:
      '<input type="checkbox" :checked="value" :disabled="disabled" @change="$emit(\'update:value\', $event.target.checked)" />',
  },
  NSelect: {
    props: ["value", "options", "disabled"],
    emits: ["update:value"],
    template:
      '<select :value="value" :disabled="disabled" @change="$emit(\'update:value\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{opt.label}}</option></select>',
  },
  NSpace: {
    props: ["justify"],
    template: '<div class="n-space" :justify="justify"><slot /></div>',
  },
  NButton: {
    props: ["disabled", "loading", "type"],
    emits: ["click"],
    template:
      '<button :disabled="disabled" :type="type" @click="$emit(\'click\')"><slot /></button>',
  },
  NDatePicker: {
    props: ["value", "disabled"],
    emits: ["update:value"],
    template:
      '<input type="date" :value="value" :disabled="disabled" @input="$emit(\'update:value\', $event.target.value)" />',
  },
  NDataTable: {
    template: '<div class="n-data-table"><slot /></div>',
  },
  NModal: {
    props: ["show"],
    template: '<div class="n-modal" v-if="show"><slot /></div>',
  },
  NPopconfirm: {
    template:
      '<div class="n-popconfirm"><slot /><slot name="action" /></div>',
  },
  NIcon: {
    template: '<i class="n-icon"><slot /></i>',
  },
  NCard: {
    template: '<div class="n-card"><slot /></div>',
  },
  NEmpty: {
    template: '<div class="n-empty"><slot /></div>',
  },
  NTag: {
    template: '<span class="n-tag"><slot /></span>',
  },
  NDivider: {
    template: '<hr class="n-divider" />',
  },
  NSpin: {
    template: '<div class="n-spin"><slot /></div>',
  },
  NAvatar: {
    template: '<div class="n-avatar"></div>',
  },
  NConfigProvider: {
    template: '<div class="n-config-provider"><slot /></div>',
  },
  NPopover: {
    template: '<div class="n-popover"><slot /></div>',
  },
  NTooltip: {
    template: '<div class="n-tooltip"><slot /></div>',
  },
};

export function mountView<T extends Component>(
  component: T,
  options: MountingOptions<unknown> = {}
) {
  const globalOptions = options.global ?? {};
  const existingStubs =
    (globalOptions.stubs as Record<string, unknown> | undefined) ?? {};
  return mount(component, {
    ...options,
    global: {
      ...globalOptions,
      plugins: [...((globalOptions.plugins as unknown[]) ?? []), createPinia()],
      stubs: { ...naiveStubs, ...existingStubs },
    },
  });
}
