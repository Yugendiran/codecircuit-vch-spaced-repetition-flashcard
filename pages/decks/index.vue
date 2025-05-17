<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold text-white mb-6">Your Decks</h1>

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
            <p class="text-white font-bold text-xl">-</p>
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
        class="rounded-lg p-6 border border-neutral-800 flex items-center justify-center flex-col h-full min-h-[250px] cursor-pointer"
      >
        <div
          class="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center mb-4"
        >
          <span class="text-neutral-400 text-xl">+</span>
        </div>
        <p class="text-neutral-400">Create New Deck</p>
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
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.createDeck.isOpen = false">
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
              class="absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': modals.study.showAnswer }"
            >
              <!-- Front of card -->
              <div
                class="absolute w-full h-full backface-hidden rounded-lg p-6 border border-neutral-800 bg-neutral-900"
              >
                <div class="flex flex-col h-full">
                  <h3 class="text-lg font-medium text-neutral-400 mb-4">
                    Question
                  </h3>
                  <p class="text-white text-xl flex-grow">
                    {{ getCurrentCard()?.front }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in getCurrentCard()?.tags"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="mt-6">
                    <Button @click="modals.study.showAnswer = true"
                      >Show Answer</Button
                    >
                  </div>
                </div>
              </div>

              <!-- Back of card -->
              <div
                class="absolute w-full h-full backface-hidden rotate-y-180 rounded-lg p-6 border border-neutral-800 bg-neutral-950"
              >
                <div class="flex flex-col h-full">
                  <h3 class="text-lg font-medium text-neutral-400 mb-4">
                    Answer
                  </h3>
                  <p class="text-white text-xl flex-grow">
                    {{ getCurrentCard()?.back }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in getCurrentCard()?.tags"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="mt-6">
                    <Button @click="modals.study.showAnswer = false"
                      >Show Question</Button
                    >
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
            >
              <ChevronLeft class="mr-2 h-4 w-4" /> Previous
            </Button>

            <Button
              variant="outline"
              @click="nextCard()"
              :disabled="
                !modals.study.currentDeck ||
                modals.study.currentCardIndex >=
                  modals.study.currentDeck.cards.length - 1
              "
            >
              Next <ChevronRight class="ml-2 h-4 w-4" />
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
import { Plus, Trash, ChevronLeft, ChevronRight } from "lucide-vue-next";
import decks from "@/data/decks.json";

export default {
  components: {
    Plus,
    Trash,
    ChevronLeft,
    ChevronRight,
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
    };
  },
  async mounted() {
    // const response = await $fetch("/api/generate-deck", {
    //   method: "POST",
    // });
    // console.log(response);
  },
  methods: {
    async generateDeckInModal() {
      this.modals.createDeck.isGenerating = true;

      try {
        const response = await $fetch("/api/generate-deck", {
          method: "POST",
        });

        // Set the values in the modal
        this.modals.createDeck.values.name = response.content.title;
        this.modals.createDeck.values.description =
          response.content.description;
      } catch (error) {
        console.error("Error generating deck:", error);
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

      this.modals.createDeck.values.name = "";
      this.modals.createDeck.values.description = "";
      this.modals.createDeck.errors.name = "";
      this.modals.createDeck.errors.description = "";
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
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
