import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Timesheet from "@/views/Timesheet.vue";
import type { Project, TimeEntry } from "@/types";
import { mountView } from "@/test-utils/mount";

const mockApi = vi.hoisted(() => ({
  projects: {
    list: vi.fn<[], Promise<Project[]>>(),
  },
  timeEntries: {
    list: vi.fn<[], Promise<TimeEntry[]>>(),
    create: vi.fn<[Omit<TimeEntry, "id">], Promise<TimeEntry>>(),
    update: vi.fn<[TimeEntry], Promise<TimeEntry>>(),
    delete: vi.fn<[number], Promise<void>>(),
  },
}));

vi.mock("@/api", () => ({ api: mockApi }));

// Mock TimeTracker component
vi.mock("@/components/TimeTracker.vue", () => ({
  default: {
    name: "TimeTracker",
    props: ["projects"],
    emits: ["stop"],
    template: '<div class="timer-bar" data-test="timer-bar"><button @click="$emit(\'stop\', {projectId: 1, description: \'Test\', durationSeconds: 3600})">Stop Timer</button></div>',
  },
}));

// Mock QuickTimeEntry component
vi.mock("@/components/QuickTimeEntry.vue", () => ({
  default: {
    name: "QuickTimeEntry",
    props: ["projects"],
    emits: ["submit"],
    template: '<div class="quick-entry" data-test="quick-entry"></div>',
  },
}));

// Mock TimesheetFormModal component
vi.mock("@/components/TimesheetFormModal.vue", () => ({
  default: {
    name: "TimesheetFormModal",
    props: ["show", "entry", "projects"],
    emits: ["update:show", "submit"],
    template: '<div class="n-modal" v-if="show"><button @click="$emit(\'update:show\', false)">Close</button></div>',
  },
}));

// Mock PageContainer component
vi.mock("@/components/PageContainer.vue", () => ({
  default: {
    name: "PageContainer",
    props: ["title", "subtitle"],
    template: '<div class="page-container"><h1>{{title}}</h1><slot /></div>',
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: "en-US" },
  }),
}));

describe("Timesheet view", () => {
  const mockProjects: Project[] = [
    { id: 1, name: "Project A", clientId: 1, hourlyRate: 50, status: "active", tags: [], deadline: null, userId: 1, createdAt: "", updatedAt: "" },
  ];

  const mockEntries: TimeEntry[] = [
    {
      id: 1,
      projectId: 1,
      description: "Test Entry 1",
      durationSeconds: 3600,
      date: "2025-12-11",
      startTime: "09:00",
      endTime: "10:00",
      billable: true,
      invoiced: false,
      userId: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.projects.list.mockResolvedValue(mockProjects);
    mockApi.timeEntries.list.mockResolvedValue(mockEntries);
  });

  it("renders timesheet with entries", async () => {
    const wrapper = mountView(Timesheet);

    await flushPromises();

    expect(mockApi.timeEntries.list).toHaveBeenCalled();
    expect(mockApi.projects.list).toHaveBeenCalled();
    expect(wrapper.text()).toContain("timesheet.title");
    expect(wrapper.find('[data-test="timer-bar"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="quick-entry"]').exists()).toBe(true);
  });

  it("creates new entry via quick entry", async () => {
    const newEntry: TimeEntry = {
      id: 2,
      projectId: 1,
      description: "Quick Entry",
      durationSeconds: 7200,
      date: "2025-12-11",
      startTime: "",
      endTime: "",
      billable: true,
      invoiced: false,
      userId: 1,
      createdAt: "",
      updatedAt: "",
    };
    mockApi.timeEntries.create.mockResolvedValueOnce(newEntry);

    const wrapper = mountView(Timesheet);

    await flushPromises();

    const quickEntry = wrapper.findComponent({ name: "QuickTimeEntry" });
    quickEntry.vm.$emit("submit", {
      projectId: 1,
      description: "Quick Entry",
      durationSeconds: 7200,
      date: "2025-12-11",
      billable: true,
    });

    await flushPromises();

    expect(mockApi.timeEntries.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 1,
        description: "Quick Entry",
        durationSeconds: 7200,
        billable: true,
        invoiced: false,
      })
    );
  });

  it("handles timer stop event", async () => {
    const wrapper = mountView(Timesheet);

    await flushPromises();

    const tracker = wrapper.findComponent({ name: "TimeTracker" });
    tracker.vm.$emit("stop", {
      projectId: 1,
      description: "Timer Task",
      durationSeconds: 3600,
    });

    await flushPromises();

    expect(mockApi.timeEntries.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 1,
        description: "Timer Task",
        durationSeconds: 3600,
        billable: true,
        invoiced: false,
      })
    );
  });

});
