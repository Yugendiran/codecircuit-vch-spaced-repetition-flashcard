<template>
  <div class="container mx-auto py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-white">Your Flashcards</h1>

      <div class="flex gap-2">
        <Button @click="modals.createDeck.isOpen = true">
          <Plus class="size-4 mr-2" />
          Create Deck
        </Button>

        <Button variant="outline" @click="$router.push('/stats')">
          <BarChart3 class="size-4 mr-2" />
          View Stats
        </Button>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-blue-900/30 mr-4">
            <CalendarClock class="size-6 text-blue-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Cards Due Today</p>
            <p class="text-white text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-green-900/30 mr-4">
            <ListChecks class="size-6 text-green-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Total Cards</p>
            <p class="text-white text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      <div class="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-orange-900/30 mr-4">
            <BookOpen class="size-6 text-orange-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Total Decks</p>
            <p class="text-white text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Study reminder card -->
    <div
      class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-900/50 mb-8"
    >
      <div class="flex gap-4 items-center">
        <div class="rounded-full p-3 bg-blue-900/50">
          <BrainCircuit class="size-6 text-blue-400" />
        </div>
        <div class="flex-grow">
          <h2 class="text-lg font-semibold text-white mb-1">Ready to study?</h2>
          <p class="text-neutral-300">You have 0 cards due for review today.</p>
        </div>
        <!-- <Button v-if="totalDueCount > 0" @click="startStudying">
          Study Now
        </Button> -->
        <Button> All Caught Up! </Button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Plus,
  BarChart3,
  CalendarClock,
  ListChecks,
  BookOpen,
  BrainCircuit,
} from "lucide-vue-next";

export default {
  components: {
    Plus,
    BarChart3,
    CalendarClock,
    ListChecks,
    BookOpen,
    BrainCircuit,
  },
};
</script>
