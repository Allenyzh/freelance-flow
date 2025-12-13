import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";
import TimesheetFormModal from "@/components/TimesheetFormModal.vue";
import type { Project } from "@/types";
import { defineComponent } from "vue";

describe("TimesheetFormModal", () => {
  const NModalStub = defineComponent({
    name: "NModal",
    props: { show: { type: Boolean, default: false } },
    emits: ["update:show"],
    template: '<div class="n-modal" v-if="show"><slot /></div>',
  });

  const projects: Project[] = [
    {
      id: 1,
      clientId: 1,
      name: "Project A",
      description: "",
      hourlyRate: 100,
      currency: "USD",
      status: "active",
      deadline: "",
      tags: [],
      userId: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];

  it("forwards NModal update:show=true instead of forcing close", async () => {
    const wrapper = shallowMount(TimesheetFormModal, {
      props: {
        show: true,
        entry: null,
        projects,
      },
      global: {
        stubs: {
          NModal: NModalStub,
        },
      },
    });

    wrapper.findComponent({ name: "NModal" }).vm.$emit("update:show", true);

    expect(wrapper.emitted("update:show")?.[0]).toEqual([true]);
  });

  it("forwards NModal update:show=false", async () => {
    const wrapper = shallowMount(TimesheetFormModal, {
      props: {
        show: true,
        entry: null,
        projects,
      },
      global: {
        stubs: {
          NModal: NModalStub,
        },
      },
    });

    wrapper.findComponent({ name: "NModal" }).vm.$emit("update:show", false);

    expect(wrapper.emitted("update:show")?.[0]).toEqual([false]);
  });
});
