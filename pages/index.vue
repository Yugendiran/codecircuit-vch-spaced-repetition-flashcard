<template>
  <div class="container mx-auto py-8 dashboard-container">
    <div class="flex justify-between items-center mb-8 header-section">
      <h1 class="text-2xl font-bold text-white">Your Flashcards</h1>

      <div class="flex gap-2">
        <Button variant="outline" @click="$router.push('/stats')">
          <BarChart3 class="size-4 mr-2" />
          View Stats
        </Button>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stats-grid">
      <div
        class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 stat-card"
      >
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-blue-900/30 mr-4 icon-container">
            <CalendarClock class="size-6 text-blue-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Cards Due Today</p>
            <p class="text-white text-2xl font-bold count-animation">
              {{ dueTodayCount }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 stat-card"
      >
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-green-900/30 mr-4 icon-container">
            <ListChecks class="size-6 text-green-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Total Cards</p>
            <p class="text-white text-2xl font-bold count-animation">
              {{ totalCardsCount }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-neutral-900 rounded-lg p-6 border border-neutral-800 stat-card"
      >
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-orange-900/30 mr-4 icon-container">
            <BookOpen class="size-6 text-orange-500" />
          </div>
          <div>
            <p class="text-neutral-400 text-sm">Total Decks</p>
            <p class="text-white text-2xl font-bold count-animation">
              {{ decks.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Study reminder card -->
    <div
      class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-900/50 mb-8 reminder-card"
    >
      <div class="flex gap-4 items-center">
        <div class="rounded-full p-3 bg-blue-900/50 pulse-animation">
          <BrainCircuit class="size-6 text-blue-400" />
        </div>
        <div class="flex-grow">
          <h2 class="text-lg font-semibold text-white mb-1">Ready to study?</h2>
          <p class="text-neutral-300">
            You have {{ dueTodayCount }} cards due for review today.
          </p>
        </div>
        <Button
          v-if="dueTodayCount > 0"
          @click="startStudying"
          class="study-button"
        >
          Study Now
        </Button>
        <Button v-else disabled> All Caught Up! </Button>
      </div>
    </div>

    <!-- Go to decks button -->
    <div class="flex justify-center mb-8">
      <Button size="lg" @click="$router.push('/decks')" class="decks-button">
        <BookOpen class="size-5 mr-2" />
        Browse All Decks
      </Button>
    </div>
  </div>
</template>

<script>
import {
  BarChart3,
  CalendarClock,
  ListChecks,
  BookOpen,
  BrainCircuit,
} from "lucide-vue-next";
import decks from "@/data/decks.json";
import dayjs from "dayjs";

export default {
  components: {
    BarChart3,
    CalendarClock,
    ListChecks,
    BookOpen,
    BrainCircuit,
  },
  data() {
    return {
      decks,
      showDashboard: false,
    };
  },
  mounted() {
    // Trigger animations after component is mounted
    setTimeout(() => {
      this.showDashboard = true;
      document.querySelector(".dashboard-container").classList.add("show");
    }, 100);
  },
  computed: {
    dueTodayCount() {
      const today = dayjs().format("YYYY-MM-DD");
      let count = 0;

      this.decks.forEach((deck) => {
        count += this.countDueCardsInDeck(deck);
      });

      return count;
    },
    totalCardsCount() {
      let count = 0;

      this.decks.forEach((deck) => {
        count += deck.cards.length;
      });

      return count;
    },
  },
  methods: {
    countDueCardsInDeck(deck) {
      const today = dayjs().format("YYYY-MM-DD");

      return deck.cards.filter((card) => {
        // Consider a card due if:
        // 1. It's explicitly marked as new (isNew = true)
        if (card.isNew === true) return true;

        // 2. Its next review date is today or earlier (overdue)
        if (card.nextReview && card.nextReview !== "") {
          const nextReview = dayjs(card.nextReview).format("YYYY-MM-DD");
          return nextReview <= today;
        }

        return false;
      }).length;
    },
    startStudying() {
      this.$router.push("/review");
    },
    studyDeck(deck) {
      // For now, just navigate to the review page
      // In a more sophisticated implementation, we could filter by deck
      this.$router.push("/review");
    },
  },
};
</script>

<style scoped>
/* Dashboard animations */
.dashboard-container {
  opacity: 0;
  transition: opacity 0.4s ease-out;
}

.dashboard-container.show {
  opacity: 1;
}

.header-section {
  opacity: 0;
  transform: translateY(-10px);
  animation: slideDown 0.5s ease-out forwards;
  animation-delay: 0.1s;
}

/* Stats grid animation */
.stat-card {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.5s ease-out forwards;
}

.stat-card:nth-child(1) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.3s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.4s;
}

.reminder-card {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.5s ease-out forwards;
  animation-delay: 0.5s;
  position: relative;
  overflow: hidden;
}

.reminder-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6, #4f46e5);
  background-size: 200% 200%;
  animation: gradient-pulse 3s ease infinite;
  opacity: 0.7;
}

/* Decks button animation */
.decks-button {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.5s ease-out forwards;
  animation-delay: 0.6s;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: linear-gradient(135deg, #4338ca, #7e22ce);
  border: none;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
  min-width: 220px;
}

.decks-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

/* Icon animations */
.icon-container {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.stat-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
}

/* Pulse animation for the brain icon */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

/* Count animation */
.count-animation {
  position: relative;
}

.count-animation::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  animation: shine 2s ease-out;
}

/* Study button animation */
.study-button {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.study-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

/* Animation keyframes */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shine {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(0);
  }
}

@keyframes gradient-pulse {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
