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
          <Button variant="ghost" size="icon" @click="deleteDeck(deckIndex)">
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

          <NuxtLink :to="`/decks/${deck.id}/study`">
            <Button variant="secondary"> Study Now </Button>
          </NuxtLink>
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
  </div>
</template>

<script>
import { Plus, Trash } from "lucide-vue-next";
import decks from "@/data/decks.json";

export default {
  components: {
    Plus,
    Trash,
  },
  data() {
    return {
      decks,
      modals: {
        createDeck: {
          isOpen: false,
          values: {
            name: "",
            description: "",
          },
          errors: {
            name: "",
            description: "",
          },
        },
      },
    };
  },
  methods: {
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
    deleteDeck(deckIndex) {
      this.decks.splice(deckIndex, 1);
    },
  },
};
</script>
