<template>
  <div class="font-jost">
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        class="overflow-hidden"
        variant="inset"
        id="sidebar"
      >
        <SidebarHeader>
          <SidebarMenu>
            <div
              class="flex items-center justify-between"
              :class="{
                'flex-col': isCollapsed,
              }"
            >
              <div class="flex items-center gap-2">
                <h1 v-if="!isCollapsed" class="text-lg font-medium">
                  Spaced Repetition
                </h1>
              </div>

              <SidebarTrigger />

              <Separator v-if="isCollapsed" class="mt-4" />
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <Collapsible
                v-for="item in menuItems"
                :key="item.title"
                as-child
                :default-open="item.isActive"
                class="group/collapsible"
              >
                <SidebarMenuItem>
                  <NuxtLink :to="item.route">
                    <SidebarMenuButton
                      :tooltip="item.title"
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2">
                        <component :is="item.icon" class="w-4 h-4" />
                        <span>{{ item.title }}</span>
                      </div>

                      <Badge v-if="item.badge" class="font-bold">
                        {{ item.badge }}
                      </Badge>
                    </SidebarMenuButton>
                  </NuxtLink>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <!-- <Button class="w-full">
                <Plus />
                Add Deck
              </Button> -->
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset class="p-6 overflow-auto dark:!bg-neutral-950">
        <slot />
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<script lang="ts">
import {
  ChevronsUpDown,
  LogOut,
  Plus,
  SquareActivity,
  BookOpenText,
  ChartArea,
  FolderOpen,
} from "lucide-vue-next";

export default {
  components: {
    ChevronsUpDown,
    LogOut,
    SquareActivity,
    Plus,
    BookOpenText,
    ChartArea,
    FolderOpen,
  },
  data() {
    return {
      isCollapsed: false,
      menuItems: [
        {
          title: "Dashboard",
          icon: SquareActivity,
          variant: "ghost",
          type: "item",
          route: "/",
          isActive: false,
        },
        {
          title: "Review",
          icon: BookOpenText,
          variant: "ghost",
          type: "item",
          route: "/review",
          isActive: false,
          badge: 10,
        },
        {
          title: "Decks",
          icon: FolderOpen,
          variant: "ghost",
          type: "item",
          route: "/decks",
          isActive: false,
        },
        {
          title: "Stats",
          icon: ChartArea,
          variant: "ghost",
          type: "item",
          route: "/stats",
          isActive: false,
        },
      ],
    };
  },
  async mounted() {
    let sidebarWrapper = document.querySelector(
      "[data-slot='sidebar-wrapper'] div"
    );

    // get the data-state from the sidebarWrapper
    let sidebarState = sidebarWrapper?.getAttribute("data-state");

    if (sidebarState == "expanded") {
      this.isCollapsed = false;
    } else {
      this.isCollapsed = true;
    }

    // Set up a mutation observer to watch for state changes
    if (sidebarWrapper) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-state"
          ) {
            const newState = sidebarWrapper?.getAttribute("data-state");
            this.isCollapsed = newState !== "expanded";
          }
        });
      });

      // Start observing the target node for attribute changes
      observer.observe(sidebarWrapper, { attributes: true });
    }
  },
  methods: {},
};
</script>
