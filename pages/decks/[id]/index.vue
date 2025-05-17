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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div
            v-for="(card, index) in deck.cards"
            :key="index"
            class="bg-neutral-900 rounded-xl p-6 border border-neutral-800"
          >
            <p class="text-white font-medium mb-4">{{ card.front }}</p>
            <div class="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2"
              >
                <Eye class="size-3" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2"
                @click="openEditCardDialog(index)"
              >
                <Edit class="size-3" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                class="flex items-center gap-2"
                @click="openDeleteCardDialog(index)"
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
  </div>
</template>

<script>
import { Plus, Search, Edit, Trash, Eye } from "lucide-vue-next";
import decks from "@/data/decks.json";

export default {
  components: {
    Plus,
    Search,
    Edit,
    Eye,
    Trash,
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
      },
    };
  },
  mounted() {
    // get the deck from the data/decks.json file
    const deckId = parseInt(this.$route.params.id);
    const deck = decks.find((d) => d.id === deckId);

    this.deck = deck;
  },
  methods: {
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
  },
};
</script>
