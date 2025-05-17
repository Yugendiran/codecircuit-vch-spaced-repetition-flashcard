<template>
  <div v-if="deck" class="container mx-auto">
    <div class="flex justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ deck.name }}</h1>

        <p class="text-neutral-400 mt-3">
          {{ deck.description }}
        </p>

        <div class="text-neutral-400 flex items-center gap-2 mt-2 text-sm">
          {{ deck.cards.length }} Cards
          <div class="h-1 w-1 min-w-1 rounded-full bg-neutral-400"></div>
          - dues today
        </div>
      </div>

      <div class="flex gap-2">
        <Button @click="modals.createCard.isOpen = true">
          <Plus />
          Add Card
        </Button>

        <Button variant="secondary"> Review Deck <Badge>4</Badge> </Button>
      </div>
    </div>

    <div class="relative w-full max-w-sm items-center mt-5">
      <Input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="pl-10"
      />
      <span
        class="absolute start-0 inset-y-0 flex items-center justify-center px-3"
      >
        <Search class="size-4 text-muted-foreground" />
      </span>
    </div>

    <Tabs default-value="all" class="mt-5">
      <TabsList>
        <TabsTrigger value="all"> All </TabsTrigger>
        <TabsTrigger value="due">
          Due Today <Badge class="text-xs px-1 py-0 rounded-full">4</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <!-- Empty state when no cards exist -->
        <div v-if="deck.cards.length === 0" class="mt-8 text-center py-16">
          <div class="flex justify-center">
            <Inbox class="size-12 text-neutral-600 mb-3" />
          </div>
          <h3 class="text-lg font-medium text-white mb-2">
            No cards in this deck
          </h3>
          <p class="text-neutral-400 mb-6">
            Get started by adding your first flashcard
          </p>
          <Button @click="modals.createCard.isOpen = true">
            <Plus class="size-4 mr-2" />
            Create New Card
          </Button>
        </div>

        <!-- Empty state when no search results -->
        <div
          v-else-if="filteredCards.length === 0"
          class="mt-8 text-center py-16"
        >
          <div class="flex justify-center">
            <SearchX class="size-12 text-neutral-600 mb-3" />
          </div>
          <h3 class="text-lg font-medium text-white mb-2">No cards found</h3>
          <p class="text-neutral-400 mb-6">
            Try a different search term or clear your search
          </p>
          <Button variant="outline" @click="search = ''">
            <X class="size-4 mr-2" />
            Clear Search
          </Button>
        </div>

        <!-- Cards grid -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
        >
          <div
            v-for="(card, index) in filteredCards"
            :key="index"
            class="bg-neutral-900 rounded-xl p-6 border border-neutral-800"
          >
            <p class="text-white font-medium mb-4">{{ card.front }}</p>
            <div class="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2"
                @click="openViewCardDialog(getOriginalIndex(card))"
              >
                <Eye class="size-3" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2"
                @click="openEditCardDialog(getOriginalIndex(card))"
              >
                <Edit class="size-3" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                class="flex items-center gap-2"
                @click="openDeleteCardDialog(getOriginalIndex(card))"
              >
                <Trash class="size-3" />
                Delete
              </Button>
            </div>
            <div
              class="flex justify-between text-neutral-400 text-sm mt-4 gap-4"
            >
              <span>Next review: {{ card.nextReview }}</span>
              <span>Repetitions: {{ card.repetitions }}</span>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="due"> Change your password here. </TabsContent>
    </Tabs>

    <Dialog v-model:open="modals.createCard.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label>Front</Label>
            <Textarea
              v-model="modals.createCard.values.front"
              placeholder="Enter the question or prompt"
              :class="{ 'border-red-400': modals.createCard.errors.front }"
            />
            <p
              class="text-red-400 text-xs"
              v-if="modals.createCard.errors.front"
            >
              {{ modals.createCard.errors.front }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Back</Label>
            <Textarea
              v-model="modals.createCard.values.back"
              placeholder="Enter the answer or explanation"
              :class="{ 'border-red-400': modals.createCard.errors.back }"
            />
            <p
              class="text-red-400 text-xs"
              v-if="modals.createCard.errors.back"
            >
              {{ modals.createCard.errors.back }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagsInput
              v-model="modals.createCard.values.tags"
              class="bg-input/30"
              :class="{ 'border-red-400': modals.createCard.errors.tags }"
            >
              <TagsInputItem
                v-for="item in modals.createCard.values.tags"
                :key="item"
                :value="item"
              >
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>

              <TagsInputInput placeholder="Tags..." />
            </TagsInput>
            <p
              class="text-red-400 text-xs"
              v-if="modals.createCard.errors.tags"
            >
              {{ modals.createCard.errors.tags }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.createCard.isOpen = false">
            Cancel
          </Button>
          <Button @click="createCard()">
            <Plus />
            Add Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="modals.deleteCard.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Delete Card</DialogTitle>
        </DialogHeader>

        <div class="py-4">
          <p class="text-neutral-200">
            Are you sure you want to delete this card? This action cannot be
            undone.
          </p>

          <div
            class="mt-4 p-4 bg-neutral-900 rounded-md border border-neutral-800"
          >
            <p class="text-sm text-neutral-400">Card content:</p>
            <p class="mt-2 text-white">
              {{
                modals.deleteCard.cardIndex !== null
                  ? deck.cards[modals.deleteCard.cardIndex].front
                  : ""
              }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.deleteCard.isOpen = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="deleteCard()">
            <Trash class="size-4 mr-2" />
            Delete Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="modals.editCard.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label>Front</Label>
            <Textarea
              v-model="modals.editCard.values.front"
              placeholder="Enter the question or prompt"
              :class="{ 'border-red-400': modals.editCard.errors.front }"
            />
            <p class="text-red-400 text-xs" v-if="modals.editCard.errors.front">
              {{ modals.editCard.errors.front }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Back</Label>
            <Textarea
              v-model="modals.editCard.values.back"
              placeholder="Enter the answer or explanation"
              :class="{ 'border-red-400': modals.editCard.errors.back }"
            />
            <p class="text-red-400 text-xs" v-if="modals.editCard.errors.back">
              {{ modals.editCard.errors.back }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagsInput
              v-model="modals.editCard.values.tags"
              class="bg-input/30"
              :class="{ 'border-red-400': modals.editCard.errors.tags }"
            >
              <TagsInputItem
                v-for="item in modals.editCard.values.tags"
                :key="item"
                :value="item"
              >
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>

              <TagsInputInput placeholder="Tags..." />
            </TagsInput>
            <p class="text-red-400 text-xs" v-if="modals.editCard.errors.tags">
              {{ modals.editCard.errors.tags }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="modals.editCard.isOpen = false">
            Cancel
          </Button>
          <Button @click="editCard()">
            <Edit class="size-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="modals.viewCard.isOpen">
      <DialogContent>
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>View Card</DialogTitle>
        </DialogHeader>

        <div class="py-4">
          <div class="relative min-h-[300px] w-full perspective-1000">
            <div
              class="absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': modals.viewCard.showAnswer }"
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
                    {{
                      modals.viewCard.cardIndex !== null
                        ? deck.cards[modals.viewCard.cardIndex].front
                        : ""
                    }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in modals.viewCard.cardIndex !==
                      null
                        ? deck.cards[modals.viewCard.cardIndex].tags
                        : []"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="mt-6">
                    <Button @click="modals.viewCard.showAnswer = true">
                      See Answer
                    </Button>
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
                    {{
                      modals.viewCard.cardIndex !== null
                        ? deck.cards[modals.viewCard.cardIndex].back
                        : ""
                    }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in modals.viewCard.cardIndex !==
                      null
                        ? deck.cards[modals.viewCard.cardIndex].tags
                        : []"
                      :key="tagIndex"
                      class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="mt-6">
                    <Button @click="modals.viewCard.showAnswer = false">
                      See Question
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="closeViewCardDialog">
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
  Search,
  Edit,
  Trash,
  Eye,
  Inbox,
  SearchX,
  X,
} from "lucide-vue-next";
import decks from "@/data/decks.json";

export default {
  components: {
    Plus,
    Search,
    Edit,
    Eye,
    Trash,
    Inbox,
    SearchX,
    X,
  },
  data() {
    return {
      search: "",
      deck: null,
      modals: {
        createCard: {
          isOpen: false,
          values: {
            front: "",
            back: "",
            tags: [],
          },
          errors: {
            front: "",
            back: "",
            tags: "",
          },
        },
        editCard: {
          isOpen: false,
          values: {},
          errors: {},
          cardIndex: null,
        },
        deleteCard: {
          isOpen: false,
          cardIndex: null,
        },
        viewCard: {
          isOpen: false,
          cardIndex: null,
          showAnswer: false,
        },
      },
    };
  },
  computed: {
    filteredCards() {
      if (!this.deck) return [];
      if (!this.search || this.search.trim() === "") return this.deck.cards;

      const searchTerm = this.search.toLowerCase().trim();
      return this.deck.cards.filter((card) => {
        return (
          card.front.toLowerCase().includes(searchTerm) ||
          card.back.toLowerCase().includes(searchTerm) ||
          card.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      });
    },
  },
  mounted() {
    // get the deck from the data/decks.json file
    const deckId = parseInt(this.$route.params.id);
    const deck = decks.find((d) => d.id === deckId);

    this.deck = deck;
  },
  methods: {
    getOriginalIndex(card) {
      // Find the original index in the deck.cards array
      return this.deck.cards.findIndex(
        (c) => c.front === card.front && c.back === card.back
      );
    },
    createCard() {
      let errors = 0;

      if (this.modals.createCard.values.front === "") {
        this.modals.createCard.errors.front = "Front content is required";
        errors++;
      }

      if (this.modals.createCard.values.back === "") {
        this.modals.createCard.errors.back = "Back content is required";
        errors++;
      }

      if (this.modals.createCard.values.tags.length === 0) {
        this.modals.createCard.errors.tags = "At least one tag is required";
        errors++;
      }

      if (errors > 0) return;

      // Add the new card to the deck
      this.deck.cards.push({
        front: this.modals.createCard.values.front,
        back: this.modals.createCard.values.back,
        tags: this.modals.createCard.values.tags,
        nextReview: "",
        repetitions: 0,
      });

      // Reset form
      this.modals.createCard.values = {
        front: "",
        back: "",
        tags: [],
      };
      this.modals.createCard.errors = {
        front: "",
        back: "",
        tags: "",
      };

      this.modals.createCard.isOpen = false;
    },

    openDeleteCardDialog(index) {
      this.modals.deleteCard.cardIndex = index;
      this.modals.deleteCard.isOpen = true;
    },

    deleteCard() {
      if (this.modals.deleteCard.cardIndex !== null) {
        // Remove the card from the deck
        this.deck.cards.splice(this.modals.deleteCard.cardIndex, 1);

        // Reset and close the dialog
        this.modals.deleteCard.cardIndex = null;
        this.modals.deleteCard.isOpen = false;
      }
    },

    openEditCardDialog(index) {
      // Set the index of the card to edit
      this.modals.editCard.cardIndex = index;

      // Pre-populate the form with the card's data
      const card = this.deck.cards[index];
      this.modals.editCard.values = {
        front: card.front,
        back: card.back,
        tags: [...card.tags], // Create a new array to avoid reference issues
      };

      // Clear any previous errors
      this.modals.editCard.errors = {
        front: "",
        back: "",
        tags: "",
      };

      // Open the dialog
      this.modals.editCard.isOpen = true;
    },

    editCard() {
      let errors = 0;

      if (this.modals.editCard.values.front === "") {
        this.modals.editCard.errors.front = "Front content is required";
        errors++;
      }

      if (this.modals.editCard.values.back === "") {
        this.modals.editCard.errors.back = "Back content is required";
        errors++;
      }

      if (this.modals.editCard.values.tags.length === 0) {
        this.modals.editCard.errors.tags = "At least one tag is required";
        errors++;
      }

      if (errors > 0) return;

      // Update the card in the deck
      if (this.modals.editCard.cardIndex !== null) {
        this.deck.cards[this.modals.editCard.cardIndex] = {
          ...this.deck.cards[this.modals.editCard.cardIndex], // Keep other properties (like nextReview, repetitions)
          front: this.modals.editCard.values.front,
          back: this.modals.editCard.values.back,
          tags: this.modals.editCard.values.tags,
        };

        // Reset and close the dialog
        this.modals.editCard.cardIndex = null;
        this.modals.editCard.isOpen = false;
      }
    },

    openViewCardDialog(index) {
      this.modals.viewCard.cardIndex = index;
      this.modals.viewCard.showAnswer = false;
      this.modals.viewCard.isOpen = true;
    },

    closeViewCardDialog() {
      this.modals.viewCard.cardIndex = null;
      this.modals.viewCard.showAnswer = false;
      this.modals.viewCard.isOpen = false;
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
