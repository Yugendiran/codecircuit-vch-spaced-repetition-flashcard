<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">Your Decks</h1>

      <div v-if="totalDueCards > 0" class="flex items-center">
        <NuxtLink to="/review">
          <Button
            variant="outline"
            class="flex items-center gap-2 border-purple-800 text-purple-400 hover:bg-purple-900/20"
          >
            <span class="text-purple-400">📚</span>
            {{ totalDueCards }} cards due today
          </Button>
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(deck, deckIndex) in decks"
        :key="deckIndex"
        class="rounded-lg p-6 border border-neutral-800"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white mb-1">{{ deck.name }}</h2>
          <Button
            variant="ghost"
            size="icon"
            @click="confirmDeleteDeck(deckIndex, deck.name)"
          >
            <Trash class="w-2 h-2" />
          </Button>
        </div>
        <p class="text-neutral-400 text-sm mb-4">
          {{ deck.description }}
        </p>

        <div class="flex mb-4">
          <div class="rounded p-3 mr-3 flex-1 border border-neutral-800">
            <p class="text-neutral-400 text-xs">Total Cards</p>
            <p class="text-white font-bold text-xl">
              {{ deck.cards.length }}
            </p>
          </div>
          <div
            class="rounded p-3 flex-1 border border-purple-600 bg-purple-900/10"
          >
            <p class="text-neutral-400 text-xs">Due Today</p>
            <p class="text-white font-bold text-xl">
              {{ countDueCards(deck) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink :to="`/decks/${deck.id}`">
            <Button> View Cards </Button>
          </NuxtLink>

          <Button variant="secondary" @click="openStudyModal(deck)">
            Study Now
          </Button>
        </div>
      </div>

      <!-- Create New Deck Card -->
      <div
        @click="modals.createDeck.isOpen = true"
        class="rounded-lg p-6 border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 hover:from-purple-950/20 hover:to-neutral-950 hover:border-purple-800/50 transition-all duration-300 flex items-center justify-center flex-col h-full min-h-[250px] cursor-pointer group relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div
          class="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-900/20 transform group-hover:scale-110 transition-transform duration-300"
        >
          <span class="text-white text-2xl font-light">+</span>
        </div>
        <p class="text-white font-medium text-lg mb-2">Create New Deck</p>
        <p class="text-neutral-400 text-sm text-center max-w-[180px]">
          Build a custom deck or generate one with AI
        </p>
        <div
          class="mt-5 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity"
        >
          <span class="text-purple-400 text-xs">✨</span>
          <span class="text-purple-400 text-xs">AI-powered</span>
        </div>
      </div>
    </div>

    <Dialog v-model:open="modals.createDeck.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label>Deck Name</Label>
            <Input
              v-model="modals.createDeck.values.name"
              placeholder="e.g., Web Development"
              :class="{ 'border-red-400': modals.createDeck.errors.name }"
            />

            <p
              class="text-red-400 text-xs"
              v-if="modals.createDeck.errors.name"
            >
              {{ modals.createDeck.errors.name }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              v-model="modals.createDeck.values.description"
              placeholder="e.g., This deck contains all the concepts and topics I need to know for the exam."
              :class="{
                'border-red-400': modals.createDeck.errors.description,
              }"
            />

            <p
              class="text-red-400 text-xs"
              v-if="modals.createDeck.errors.description"
            >
              {{ modals.createDeck.errors.description }}
            </p>
          </div>

          <div class="mt-2">
            <Button
              variant="outline"
              class="w-full flex items-center justify-center gap-2 border-purple-800 text-purple-400 hover:bg-purple-900/20"
              @click="generateDeckInModal()"
              :disabled="modals.createDeck.isGenerating"
            >
              <span class="text-purple-400">✨</span>
              {{
                modals.createDeck.isGenerating
                  ? "Generating..."
                  : "Generate with AI"
              }}
            </Button>
          </div>

          <div
            v-if="modals.createDeck.isGenerating"
            class="mt-4 border border-purple-800/30 bg-purple-950/10 rounded-lg p-3 animate-pulse"
          >
            <div class="flex items-center">
              <div class="animate-spin mr-2">
                <svg
                  class="w-4 h-4 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p class="text-sm text-purple-300">
                {{ modals.createDeck.generationStatus }}
              </p>
            </div>
          </div>

          <div
            v-if="
              !modals.createDeck.isGenerating &&
              !modals.createDeck.values.name &&
              !modals.createDeck.values.description
            "
            class="mt-4 border border-neutral-800 rounded-lg p-3"
          >
            <p class="text-xs text-neutral-500 mb-2">Try a suggested topic:</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(topic, index) in suggestedTopics"
                :key="index"
                @click="generateDeckWithTopic(topic)"
                class="px-3 py-1 text-xs rounded-full border border-purple-800/50 text-purple-300 hover:bg-purple-900/20 transition-colors"
              >
                {{ topic }}
              </button>
            </div>
          </div>

          <div
            v-if="
              !modals.createDeck.isGenerating &&
              (modals.createDeck.values.name ||
                modals.createDeck.values.description)
            "
            class="mt-4 border border-neutral-800 rounded-lg p-3"
          >
            <p class="text-xs text-neutral-500 mb-1">AI suggested:</p>
            <div class="flex items-start">
              <div
                class="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs mt-0.5"
              >
                ✨
              </div>
              <div class="ml-2">
                <p
                  v-if="modals.createDeck.values.name"
                  class="text-white text-sm font-medium"
                >
                  {{ modals.createDeck.values.name }}
                </p>
                <p
                  v-if="modals.createDeck.values.description"
                  class="text-neutral-400 text-xs mt-1"
                >
                  {{ modals.createDeck.values.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            @click="
              modals.createDeck.isOpen = false;
              resetCreateDeckForm();
            "
          >
            Cancel
          </Button>
          <Button @click="createDeck()">
            <Plus />
            Create Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Modal -->
    <Dialog v-model:open="modals.deleteDeck.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Delete Deck</DialogTitle>
        </DialogHeader>

        <div class="py-4">
          <p class="text-neutral-400">
            Are you sure you want to delete "{{ modals.deleteDeck.deckName }}"?
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.deleteDeck.isOpen = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="executeDeleteDeck()">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Study Modal -->
    <Dialog v-model:open="modals.study.isOpen">
      <DialogContent class="max-w-3xl">
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Study: {{ modals.study.currentDeck?.name }}</DialogTitle>
        </DialogHeader>

        <div class="py-4">
          <!-- Progress Bar -->
          <div class="mb-6">
            <div class="flex justify-between text-sm text-neutral-400 mb-2">
              <span>Progress</span>
              <span
                >{{ modals.study.currentCardIndex + 1 }} of
                {{ modals.study.currentDeck?.cards.length }}</span
              >
            </div>
            <div class="w-full bg-neutral-800 rounded-full h-2.5">
              <div
                class="bg-purple-600 h-2.5 rounded-full"
                :style="{
                  width: `${
                    ((modals.study.currentCardIndex + 1) /
                      modals.study.currentDeck?.cards.length) *
                    100
                  }%`,
                }"
              ></div>
            </div>
          </div>

          <!-- Flashcard with flip animation -->
          <div
            v-if="modals.study.currentDeck?.cards.length > 0"
            class="relative min-h-[300px] w-full perspective-1000 mb-6"
          >
            <div
              class="absolute w-full h-full transition-transform duration-700 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': modals.study.showAnswer }"
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
                      {{ getCurrentCard()?.front }}
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in getCurrentCard()?.tags"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>

                  <div class="mt-8 flex justify-center">
                    <Button
                      @click="modals.study.showAnswer = true"
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
                      {{ getCurrentCard()?.back }}
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in getCurrentCard()?.tags"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>

                  <div class="mt-8 flex justify-center">
                    <Button
                      @click="modals.study.showAnswer = false"
                      class="relative overflow-hidden group px-8"
                    >
                      <span
                        class="relative z-10 flex items-center pointer-events-none"
                      >
                        <FlipHorizontal class="mr-2 size-4" />
                        Back to Question
                      </span>
                      <span
                        class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      ></span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state when no cards -->
          <div v-else class="text-center py-8">
            <p class="text-neutral-400">This deck has no cards to study.</p>
          </div>

          <!-- Navigation controls -->
          <div class="flex justify-between mt-4">
            <Button
              variant="outline"
              @click="prevCard()"
              :disabled="modals.study.currentCardIndex <= 0"
              class="flex items-center group"
            >
              <ChevronLeft
                class="mr-2 h-4 w-4 group-hover:text-purple-400 transition-colors"
              />
              Previous
            </Button>

            <Button
              variant="outline"
              @click="nextCard()"
              :disabled="
                !modals.study.currentDeck ||
                modals.study.currentCardIndex >=
                  modals.study.currentDeck.cards.length - 1
              "
              class="flex items-center group"
            >
              Next
              <ChevronRight
                class="ml-2 h-4 w-4 group-hover:text-purple-400 transition-colors"
              />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.study.isOpen = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import {
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
} from "lucide-vue-next";
import decks from "@/data/decks.json";
import dayjs from "dayjs";

export default {
  components: {
    Plus,
    Trash,
    ChevronLeft,
    ChevronRight,
    FlipHorizontal,
  },
  data() {
    return {
      decks,
      modals: {
        createDeck: {
          isOpen: false,
          isGenerating: false,
          values: {
            name: "",
            description: "",
          },
          errors: {
            name: "",
            description: "",
          },
          aiResponse: null,
          generationStatus: "",
        },
        deleteDeck: {
          isOpen: false,
          deckIndex: null,
          deckName: "",
        },
        study: {
          isOpen: false,
          currentDeck: null,
          currentCardIndex: 0,
          showAnswer: false,
        },
      },
      suggestedTopics: [
        "Computer Science",
        "Mathematics",
        "Language Learning",
        "History",
        "Science",
      ],
    };
  },
  computed: {
    totalDueCards() {
      if (!this.decks || this.decks.length === 0) return 0;

      // Sum up all due cards across all decks
      return this.decks.reduce((total, deck) => {
        return total + this.countDueCards(deck);
      }, 0);
    },
  },
  methods: {
    resetCreateDeckForm() {
      this.modals.createDeck.values.name = "";
      this.modals.createDeck.values.description = "";
      this.modals.createDeck.errors.name = "";
      this.modals.createDeck.errors.description = "";
      this.modals.createDeck.aiResponse = null;
      this.modals.createDeck.generationStatus = "";
    },
    async generateDeckInModal() {
      this.modals.createDeck.isGenerating = true;
      this.modals.createDeck.generationStatus =
        "Thinking of a great deck idea...";

      try {
        // Add a small delay with status messages to improve UX
        setTimeout(() => {
          this.modals.createDeck.generationStatus =
            "Crafting the perfect title...";
        }, 800);

        setTimeout(() => {
          this.modals.createDeck.generationStatus =
            "Writing an engaging description...";
        }, 1600);

        const response = await $fetch(
          "https://api.crackaspire.com/api/public/generate-deck",
          {
            method: "POST",
            body: { topic: "" },
          }
        );

        // Set the values in the modal
        this.modals.createDeck.values.name = response.content.title;
        this.modals.createDeck.values.description =
          response.content.description;
        this.modals.createDeck.aiResponse = response.content;
      } catch (error) {
        console.error("Error generating deck:", error);
        this.modals.createDeck.generationStatus =
          "Error generating deck. Please try again.";
      } finally {
        this.modals.createDeck.isGenerating = false;
      }
    },
    createDeck() {
      let errors = 0;

      if (this.modals.createDeck.values.name === "") {
        this.modals.createDeck.errors.name = "Deck name is required";
        errors++;
      }

      if (this.modals.createDeck.values.description === "") {
        this.modals.createDeck.errors.description = "Description is required";
        errors++;
      }

      if (errors > 0) return;

      this.decks.push({
        id: this.decks.length + 1,
        name: this.modals.createDeck.values.name,
        description: this.modals.createDeck.values.description || "",
        cards: [],
      });

      this.resetCreateDeckForm();
      this.modals.createDeck.isOpen = false;
    },
    confirmDeleteDeck(deckIndex, deckName) {
      this.modals.deleteDeck.deckIndex = deckIndex;
      this.modals.deleteDeck.deckName = deckName;
      this.modals.deleteDeck.isOpen = true;
    },
    executeDeleteDeck() {
      if (this.modals.deleteDeck.deckIndex !== null) {
        this.decks.splice(this.modals.deleteDeck.deckIndex, 1);
        this.modals.deleteDeck.deckIndex = null;
        this.modals.deleteDeck.deckName = "";
        this.modals.deleteDeck.isOpen = false;
      }
    },
    openStudyModal(deck) {
      this.modals.study.currentDeck = deck;
      this.modals.study.currentCardIndex = 0;
      this.modals.study.showAnswer = false;
      this.modals.study.isOpen = true;
    },
    getCurrentCard() {
      if (
        !this.modals.study.currentDeck ||
        this.modals.study.currentDeck.cards.length === 0
      ) {
        return null;
      }
      return this.modals.study.currentDeck.cards[
        this.modals.study.currentCardIndex
      ];
    },
    nextCard() {
      if (
        this.modals.study.currentDeck &&
        this.modals.study.currentCardIndex <
          this.modals.study.currentDeck.cards.length - 1
      ) {
        this.modals.study.currentCardIndex++;
        this.modals.study.showAnswer = false;
      }
    },
    prevCard() {
      if (this.modals.study.currentCardIndex > 0) {
        this.modals.study.currentCardIndex--;
        this.modals.study.showAnswer = false;
      }
    },
    async generateDeckWithTopic(topic) {
      this.modals.createDeck.isGenerating = true;
      this.modals.createDeck.generationStatus = `Creating a deck about ${topic}...`;

      try {
        // Add a small delay with status messages to improve UX
        setTimeout(() => {
          this.modals.createDeck.generationStatus =
            "Researching the subject...";
        }, 800);

        setTimeout(() => {
          this.modals.createDeck.generationStatus =
            "Crafting specialized content...";
        }, 1600);

        // Send the topic to the API
        const response = await $fetch("/api/generate-deck", {
          method: "POST",
          body: { topic },
        });

        // Set the values in the modal
        this.modals.createDeck.values.name = response.content.title;
        this.modals.createDeck.values.description =
          response.content.description;
        this.modals.createDeck.aiResponse = response.content;
      } catch (error) {
        console.error("Error generating deck:", error);
        this.modals.createDeck.generationStatus =
          "Error generating deck. Please try again.";
      } finally {
        this.modals.createDeck.isGenerating = false;
      }
    },
    countDueCards(deck) {
      if (!deck || !deck.cards || deck.cards.length === 0) return 0;

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

.perspective-1000:hover .backface-hidden {
  box-shadow: 0 30px 60px -15px rgba(124, 58, 237, 0.3);
}

.card-text {
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bg-grid-pattern {
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
