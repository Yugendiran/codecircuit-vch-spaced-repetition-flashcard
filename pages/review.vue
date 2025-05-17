<template>
  <div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">Daily Review</h1>
      <div class="flex items-center">
        <div class="text-neutral-400 mr-4">
          {{ dueCards.length }} cards due today
        </div>
        <NuxtLink to="/decks">
          <Button variant="outline">Back to Decks</Button>
        </NuxtLink>
      </div>
    </div>

    <!-- No cards due state -->
    <div v-if="dueCards.length === 0" class="text-center py-20">
      <h2 class="text-2xl text-white font-medium mb-4">
        No cards due for review!
      </h2>
      <p class="text-neutral-400 mb-6">
        You're all caught up with your studies for today.
      </p>
      <NuxtLink to="/decks">
        <Button>Return to Decks</Button>
      </NuxtLink>
    </div>

    <!-- Review session progress -->
    <div
      v-else-if="currentReviewIndex < dueCards.length"
      class="max-w-3xl mx-auto"
    >
      <!-- Progress bar -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-neutral-400 mb-2">
          <span>Progress</span>
          <span>{{ currentReviewIndex + 1 }} of {{ dueCards.length }}</span>
        </div>
        <div class="w-full bg-neutral-800 rounded-full h-2.5">
          <div
            class="bg-purple-600 h-2.5 rounded-full"
            :style="{
              width: `${((currentReviewIndex + 1) / dueCards.length) * 100}%`,
            }"
          ></div>
        </div>
      </div>

      <!-- Deck information -->
      <div class="flex items-center mb-4">
        <div
          class="bg-neutral-800 px-3 py-1 rounded-full text-sm text-neutral-300"
        >
          {{ getCurrentDeckName() }}
        </div>
        <div
          v-if="currentCard.tags && currentCard.tags.length > 0"
          class="ml-2 flex"
        >
          <div
            v-for="(tag, tagIndex) in currentCard.tags"
            :key="tagIndex"
            class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md ml-1"
          >
            {{ tag }}
          </div>
        </div>
      </div>

      <!-- Flashcard with flip animation -->
      <div class="relative min-h-[300px] w-full perspective-1000 mb-6">
        <div
          class="absolute w-full h-full transition-transform duration-700 transform-style-preserve-3d"
          :class="{ 'rotate-y-180': showAnswer }"
        >
          <!-- Front of card -->
          <div
            class="absolute w-full h-full backface-hidden rounded-lg p-6 border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-xl"
          >
            <div class="flex flex-col h-full relative">
              <div
                class="absolute top-0 right-0 w-20 h-20 text-neutral-800 opacity-20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  class="w-full h-full"
                >
                  <path
                    d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                  ></path>
                </svg>
              </div>

              <h3
                class="text-lg font-medium text-neutral-400 mb-6 flex items-center"
              >
                <span
                  class="bg-gradient-to-r from-purple-500 to-indigo-500 size-2 rounded-full mr-2"
                ></span>
                Question
              </h3>

              <div class="flex-grow flex items-center justify-center py-4">
                <p class="text-white text-xl text-center card-text">
                  {{ currentCard.front }}
                </p>
              </div>

              <div class="mt-8 flex justify-center">
                <Button
                  @click="showAnswer = true"
                  class="relative overflow-hidden group px-8"
                >
                  <span
                    class="relative z-10 flex items-center pointer-events-none"
                  >
                    <FlipHorizontal class="mr-2 size-4" />
                    Reveal Answer
                  </span>
                  <span
                    class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  ></span>
                </Button>
              </div>
            </div>
          </div>

          <!-- Back of card -->
          <div
            class="absolute w-full h-full backface-hidden rotate-y-180 rounded-lg p-6 border border-neutral-800 bg-gradient-to-b from-neutral-950 to-black shadow-xl"
          >
            <div class="flex flex-col h-full relative">
              <div
                class="absolute top-0 right-0 w-20 h-20 text-neutral-800 opacity-20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  class="w-full h-full"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>

              <h3
                class="text-lg font-medium text-neutral-400 mb-6 flex items-center"
              >
                <span
                  class="bg-gradient-to-r from-indigo-500 to-purple-500 size-2 rounded-full mr-2"
                ></span>
                Answer
              </h3>

              <div class="flex-grow flex items-center justify-center py-4">
                <p class="text-white text-xl text-center card-text">
                  {{ currentCard.back }}
                </p>
              </div>

              <!-- Rating buttons that appear after answer is shown -->
              <div class="mt-6 grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  class="flex flex-col items-center py-3 border-red-800/50 hover:bg-red-900/10 text-red-400 transition-colors h-fit"
                  @click="rateCard(1)"
                >
                  <span class="font-bold mb-1">Again</span>
                  <!-- <span class="text-xs">(&lt; 1 day)</span> -->
                </Button>
                <Button
                  variant="outline"
                  class="flex flex-col items-center py-3 border-orange-800/50 hover:bg-orange-900/10 text-orange-400 transition-colors h-fit"
                  @click="rateCard(3)"
                >
                  <span class="font-bold mb-1">Hard</span>
                  <!-- <span class="text-xs">({{ getNextInterval(3) }} days)</span> -->
                </Button>
                <Button
                  variant="outline"
                  class="flex flex-col items-center py-3 border-green-800/50 hover:bg-green-900/10 text-green-400 transition-colors h-fit"
                  @click="rateCard(4)"
                >
                  <span class="font-bold mb-1">Good</span>
                  <!-- <span class="text-xs">({{ getNextInterval(4) }} days)</span> -->
                </Button>
                <Button
                  variant="outline"
                  class="flex flex-col items-center py-3 border-blue-800/50 hover:bg-blue-900/10 text-blue-400 transition-colors h-fit"
                  @click="rateCard(5)"
                >
                  <span class="font-bold mb-1">Easy</span>
                  <!-- <span class="text-xs">({{ getNextInterval(5) }} days)</span> -->
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card stats -->
      <div class="flex flex-wrap gap-4 text-sm">
        <div class="bg-neutral-900 px-3 py-1 rounded-full text-neutral-400">
          Repetitions: {{ currentCard.repetitions || 0 }}
        </div>
        <div class="bg-neutral-900 px-3 py-1 rounded-full text-neutral-400">
          Easiness: {{ (currentCard.easiness || 2.5).toFixed(2) }}
        </div>
        <div class="bg-neutral-900 px-3 py-1 rounded-full text-neutral-400">
          Last interval: {{ currentCard.interval || 0 }} days
        </div>
      </div>
    </div>

    <!-- Review completed state -->
    <div v-else class="text-center py-20">
      <h2 class="text-2xl text-white font-medium mb-4">Review Complete!</h2>
      <p class="text-neutral-400 mb-6">
        You've reviewed all your due cards for today.
      </p>

      <!-- Session stats -->
      <div
        class="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8"
      >
        <h3 class="text-lg font-medium text-white mb-4">Session Stats</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-neutral-800 p-4 rounded-lg">
            <p class="text-sm text-neutral-400">Cards Reviewed</p>
            <p class="text-2xl font-bold text-white">{{ dueCards.length }}</p>
          </div>
          <div class="bg-neutral-800 p-4 rounded-lg">
            <p class="text-sm text-neutral-400">Avg. Rating</p>
            <p class="text-2xl font-bold text-white">
              {{ averageRating.toFixed(1) }}
            </p>
          </div>
          <div class="bg-neutral-800 p-4 rounded-lg">
            <p class="text-sm text-neutral-400">Again Cards</p>
            <p class="text-2xl font-bold text-red-400">{{ againCount }}</p>
          </div>
          <div class="bg-neutral-800 p-4 rounded-lg">
            <p class="text-sm text-neutral-400">Easy Cards</p>
            <p class="text-2xl font-bold text-blue-400">{{ easyCount }}</p>
          </div>
        </div>
      </div>

      <NuxtLink to="/decks">
        <Button>Return to Decks</Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { FlipHorizontal } from "lucide-vue-next";
import decks from "@/data/decks.json";
import dayjs from "dayjs";

export default {
  components: {
    FlipHorizontal,
  },
  data() {
    return {
      decks,
      dueCards: [],
      currentReviewIndex: 0,
      showAnswer: false,
      ratings: [],
      againCount: 0,
      easyCount: 0,
    };
  },
  computed: {
    currentCard() {
      if (
        this.dueCards.length === 0 ||
        this.currentReviewIndex >= this.dueCards.length
      ) {
        return {};
      }
      return this.dueCards[this.currentReviewIndex];
    },
    averageRating() {
      if (this.ratings.length === 0) return 0;
      const sum = this.ratings.reduce((acc, rating) => acc + rating, 0);
      return sum / this.ratings.length;
    },
  },
  mounted() {
    this.loadDueCards();
  },
  methods: {
    loadDueCards() {
      const today = dayjs().format("YYYY-MM-DD");

      // Find all cards that are due today or before
      let dueCards = [];

      this.decks.forEach((deck) => {
        const deckDueCards = deck.cards.filter((card) => {
          // If card is new or has no nextReview, it's due
          if (card.isNew === true) return true;

          // If card has a nextReview date that's today or earlier, it's due
          if (card.nextReview && card.nextReview !== "") {
            const nextReview = dayjs(card.nextReview).format("YYYY-MM-DD");
            return nextReview <= today;
          }

          return false;
        });

        // Add deck info to each card for better UX
        deckDueCards.forEach((card) => {
          dueCards.push({
            ...card,
            deckId: deck.id,
            deckName: deck.name,
          });
        });
      });

      this.dueCards = dueCards;
    },

    getCurrentDeckName() {
      if (!this.currentCard || !this.currentCard.deckName)
        return "Unknown Deck";
      return this.currentCard.deckName;
    },

    getNextInterval(quality) {
      const card = this.currentCard;
      const repetitions = card.repetitions || 0;
      const easiness = card.easiness || 2.5;
      const currentInterval = card.interval || 0;

      if (quality < 3) {
        return 1;
      } else {
        if (repetitions + 1 === 1) return 1;
        if (repetitions + 1 === 2) return 6;
        return Math.round(currentInterval * easiness);
      }
    },

    rateCard(quality) {
      // Record the rating
      this.ratings.push(quality);

      // Increment counters for stats
      if (quality === 1) this.againCount++;
      if (quality === 5) this.easyCount++;

      // Apply the SM2 algorithm
      this.applySpacedRepetition(quality);

      // Move to the next card
      this.showAnswer = false;
      this.currentReviewIndex++;
    },

    applySpacedRepetition(quality) {
      // Find the correct card in the original decks data
      const cardToUpdate = this.currentCard;
      const deckIndex = this.decks.findIndex(
        (d) => d.id === cardToUpdate.deckId
      );
      const cardIndex = this.decks[deckIndex].cards.findIndex(
        (c) => c.id === cardToUpdate.id
      );

      if (deckIndex === -1 || cardIndex === -1) return;

      const card = this.decks[deckIndex].cards[cardIndex];

      // Initialize values if they don't exist
      if (!card.repetitions) card.repetitions = 0;
      if (!card.easiness) card.easiness = 2.5;
      if (!card.interval) card.interval = 0;
      if (!card.reviewHistory) card.reviewHistory = [];

      // Apply SM2 algorithm
      if (quality < 3) {
        card.repetitions = 0;
        card.interval = 1;
      } else {
        card.repetitions += 1;

        if (card.repetitions === 1) {
          card.interval = 1;
        } else if (card.repetitions === 2) {
          card.interval = 6;
        } else {
          card.interval = Math.round(card.interval * card.easiness);
        }
      }

      // Update easiness factor
      card.easiness =
        card.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (card.easiness < 1.3) card.easiness = 1.3;

      // Set next review date
      const today = dayjs();
      card.nextReview = today.add(card.interval, "day").format("YYYY-MM-DD");

      // Add to review history
      card.reviewHistory.push({
        date: today.format("YYYY-MM-DD"),
        quality: quality,
      });

      // Remove isNew flag if it exists
      if (card.isNew) card.isNew = false;

      // Update the card in the dueCards array
      this.dueCards[this.currentReviewIndex] = {
        ...card,
        deckId: cardToUpdate.deckId,
        deckName: cardToUpdate.deckName,
      };
    },
  },
};
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.card-text {
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
