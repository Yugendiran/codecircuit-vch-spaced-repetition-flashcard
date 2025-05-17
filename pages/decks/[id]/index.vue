<template>
  <div v-if="deck" class="container mx-auto">
    <!-- Confetti overlay -->
    <div
      v-if="confetti.active"
      class="fixed inset-0 pointer-events-none overflow-hidden"
      style="z-index: 100"
    >
      <div
        v-for="(particle, index) in confetti.particles"
        :key="index"
        class="absolute rounded-md confetti"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          transform: `rotate(${particle.rotation}deg)`,
          animationDuration: `${3000 / particle.speed}ms`,
        }"
      ></div>
    </div>

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

        <Button
          variant="outline"
          @click="generateCards"
          :disabled="isGenerating"
          class="relative overflow-hidden group"
        >
          <span
            v-if="!isGenerating"
            class="text-purple-400 mr-2 group-hover:animate-pulse"
            >✨</span
          >
          <span
            v-else
            class="absolute inset-0 bg-purple-500/10 animate-pulse"
          ></span>
          <Loader2 v-if="isGenerating" class="animate-spin mr-2 size-4" />
          <span class="relative z-10">{{
            isGenerating ? "Generating..." : "Generate"
          }}</span>
          <span
            class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></span>
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

          <br />
          <br />

          <Button
            variant="outline"
            @click="generateCards"
            :disabled="isGenerating"
            class="relative overflow-hidden group"
          >
            <span
              v-if="!isGenerating"
              class="text-purple-400 mr-2 group-hover:animate-pulse"
              >✨</span
            >
            <span
              v-else
              class="absolute inset-0 bg-purple-500/10 animate-pulse"
            ></span>
            <Loader2 v-if="isGenerating" class="animate-spin mr-2 size-4" />
            <span class="relative z-10">{{
              isGenerating ? "Generating..." : "Generate with AI"
            }}</span>
            <span
              class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></span>
          </Button>

          <!-- <Button variant="outline"> </Button> -->
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
            class="bg-neutral-900 rounded-xl p-6 border border-neutral-800 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 group"
            :class="{ 'card-highlight': card.isNew }"
          >
            <div class="flex justify-between items-start mb-3">
              <div
                class="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-md px-2 py-1 text-xs text-neutral-400"
              >
                Card #{{ index + 1 }}
              </div>
              <div class="flex items-center space-x-1">
                <span class="text-xs text-neutral-500"
                  >Rep: {{ card.repetitions || 0 }}</span
                >
                <div
                  class="h-4 w-4 rounded-full"
                  :class="getCardStatusClass(card)"
                ></div>
              </div>
            </div>

            <p class="text-white font-medium mb-4 card-content break-words">
              {{ card.front }}
            </p>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="(tag, tagIndex) in card.tags"
                :key="tagIndex"
                class="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-md transition-colors hover:bg-purple-900/30 hover:text-purple-300"
              >
                {{ tag }}
              </span>
            </div>

            <div class="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2 group-hover:border-purple-500/30 transition-colors duration-300"
                @click="openViewCardDialog(getOriginalIndex(card))"
              >
                <Eye
                  class="size-3 group-hover:text-purple-400 transition-colors duration-300"
                />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2 group-hover:border-blue-500/30 transition-colors duration-300"
                @click="openEditCardDialog(getOriginalIndex(card))"
              >
                <Edit
                  class="size-3 group-hover:text-blue-400 transition-colors duration-300"
                />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="flex items-center gap-2 group-hover:border-red-500/30 transition-colors duration-300"
                @click="openDeleteCardDialog(getOriginalIndex(card))"
              >
                <Trash
                  class="size-3 group-hover:text-red-400 transition-colors duration-300"
                />
                Delete
              </Button>
            </div>
            <div
              class="flex justify-between text-neutral-400 text-sm mt-4 gap-4"
            >
              <span
                >Next:
                <span class="text-purple-300">{{
                  formatNextReview(card.nextReview)
                }}</span></span
              >
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
      <DialogContent class="max-w-xl">
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle class="flex items-center">
            <span
              class="text-gradient bg-gradient-to-r from-purple-400 to-indigo-400"
            >
              Flashcard
            </span>
            <Badge class="ml-3 bg-neutral-800 text-neutral-300">
              {{
                modals.viewCard.cardIndex !== null &&
                deck.cards[modals.viewCard.cardIndex].tags[0]
              }}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div class="py-8">
          <div class="relative min-h-[300px] w-full perspective-1000">
            <div
              class="absolute w-full h-full transition-transform duration-700 transform-style-preserve-3d"
              :class="{ 'rotate-y-180': modals.viewCard.showAnswer }"
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
                      {{
                        modals.viewCard.cardIndex !== null
                          ? deck.cards[modals.viewCard.cardIndex].front
                          : ""
                      }}
                    </p>
                  </div>

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

                  <div class="mt-8 flex justify-center">
                    <Button
                      @click="modals.viewCard.showAnswer = true"
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
                      {{
                        modals.viewCard.cardIndex !== null
                          ? deck.cards[modals.viewCard.cardIndex].back
                          : ""
                      }}
                    </p>
                  </div>

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

                  <div class="mt-8 flex justify-center">
                    <Button
                      @click="modals.viewCard.showAnswer = false"
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
        </div>

        <DialogFooter>
          <div class="flex w-full justify-between items-center">
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                @click="goToPreviousCard"
                :disabled="!hasPreviousCard"
              >
                <ChevronLeft class="size-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                @click="goToNextCard"
                :disabled="!hasNextCard"
              >
                Next
                <ChevronRight class="size-4 ml-1" />
              </Button>
            </div>

            <Button variant="secondary" @click="closeViewCardDialog">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="modals.aiGeneration.isOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader class="border-b border-neutral-800 pb-4">
          <DialogTitle>{{ getAIGenerationTitle }}</DialogTitle>
        </DialogHeader>

        <div class="py-4">
          <div v-if="modals.aiGeneration.status === 'generating'">
            <p class="text-neutral-200 flex items-center gap-2 mb-4">
              <span class="relative inline-flex">
                <Loader2 class="animate-spin size-5 text-purple-400" />
                <span
                  class="absolute inset-0 animate-ping opacity-75 rounded-full bg-purple-400 blur-sm"
                ></span>
              </span>
              <span class="text-lg"
                >AI is crafting flashcards for your deck</span
              >
              <span class="loading-dots ml-1">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </span>
            </p>

            <div class="mt-8 space-y-6">
              <ProgressBar :value="modals.aiGeneration.progress" />

              <div class="text-center space-y-2">
                <p class="text-neutral-300 text-sm">
                  {{ getLoadingMessage }}
                </p>
                <div class="grid grid-cols-3 gap-3 mt-6">
                  <div v-for="i in 3" :key="i" class="pulse-card">
                    <div
                      class="bg-neutral-800/50 animate-pulse h-20 rounded-lg"
                    ></div>
                    <div
                      class="mt-2 bg-neutral-800/50 animate-pulse h-3 rounded-full w-3/4"
                    ></div>
                    <div
                      class="mt-2 bg-neutral-800/50 animate-pulse h-3 rounded-full w-1/2"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="modals.aiGeneration.status === 'complete'">
            <p class="text-green-400 flex items-center gap-2 mb-4">
              <span class="relative inline-flex">
                <CheckCircle class="size-5" />
                <span class="absolute inset-0 animate-success-ring"></span>
              </span>
              <span class="text-lg"
                >Successfully generated
                {{ modals.aiGeneration.cards.length }} cards!</span
              >
            </p>

            <div class="max-h-[400px] overflow-y-auto pr-2">
              <TransitionGroup name="card" tag="div" class="grid gap-4">
                <div
                  v-for="(card, index) in modals.aiGeneration.cards"
                  :key="index"
                  class="bg-neutral-900 rounded-xl p-4 border border-purple-800/30 shadow-sm shadow-purple-500/10 card-appear"
                  :style="{ '--delay': `${index * 150}ms` }"
                >
                  <div class="flex justify-between">
                    <h3 class="font-medium text-white">Card {{ index + 1 }}</h3>
                    <Badge class="bg-purple-500/20 text-purple-300"
                      >AI Generated</Badge
                    >
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-4">
                    <div class="bg-neutral-800/50 p-3 rounded-md">
                      <p class="text-neutral-400 text-xs mb-1">Front</p>
                      <p class="text-white">{{ card.front }}</p>
                    </div>
                    <div class="bg-neutral-800/50 p-3 rounded-md">
                      <p class="text-neutral-400 text-xs mb-1">Back</p>
                      <p class="text-white">{{ card.back }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      v-for="(tag, tagIndex) in card.tags"
                      :key="tagIndex"
                      class="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-md"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <div v-else-if="modals.aiGeneration.status === 'error'">
            <p class="text-red-400 flex items-center gap-2 mb-4">
              <span class="relative inline-flex">
                <AlertCircle class="size-5" />
                <span class="absolute inset-0 animate-error-pulse"></span>
              </span>
              <span class="text-lg">There was an error generating cards</span>
            </p>

            <div
              class="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mt-4"
            >
              <p class="text-neutral-200 mb-3">
                The AI service couldn't generate cards. This could be due to:
              </p>
              <ul class="text-neutral-300 list-disc pl-5 space-y-1 text-sm">
                <li>Network connectivity issues</li>
                <li>The AI service being temporarily unavailable</li>
                <li>Insufficient information in your deck description</li>
              </ul>
            </div>

            <div class="mt-6 flex justify-center">
              <Button
                class="error-shake"
                variant="outline"
                @click="generateCards"
              >
                <RefreshCw class="size-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            @click="modals.aiGeneration.isOpen = false"
          >
            Cancel
          </Button>
          <Button
            @click="confirmGeneratedCards()"
            :disabled="modals.aiGeneration.status !== 'complete'"
            class="relative overflow-hidden"
          >
            <span
              v-if="modals.aiGeneration.status === 'complete'"
              class="z-10 relative"
            >
              <CheckCircle class="size-4 mr-2 inline-block" />
              Add to Deck
            </span>
            <span v-else>Confirm</span>
            <span
              class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 hover:opacity-20"
            ></span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Transition name="toast">
      <div
        v-if="showGenerationSuccess"
        class="fixed bottom-4 right-4 bg-neutral-800 border border-green-500/50 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
      >
        <CheckCircle class="text-green-400 size-5" />
        <div>
          <p class="font-medium">Success!</p>
          <p class="text-sm text-neutral-300">
            Cards have been added to your deck.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="showGenerationSuccess = false"
          class="ml-2"
        >
          <X class="size-4" />
        </Button>
      </div>
    </Transition>
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
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FlipHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import decks from "@/data/decks.json";

// Helper function for generating random colors
function getRandomColor() {
  const colors = [
    "#8b5cf6", // Purple
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#a855f7", // Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
    Loader2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    FlipHorizontal,
    ChevronLeft,
    ChevronRight,
  },
  data() {
    return {
      search: "",
      deck: null,
      isGenerating: false,
      showGenerationSuccess: false,
      generatedCards: [],
      confetti: {
        active: false,
        particles: Array(50)
          .fill()
          .map(() => ({
            x: Math.random() * 100,
            y: -20 - Math.random() * 100,
            size: 5 + Math.random() * 10,
            color: getRandomColor(),
            rotation: Math.random() * 360,
            speed: 1 + Math.random() * 5,
          })),
      },
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
        aiGeneration: {
          isOpen: false,
          progress: 0,
          cards: [],
          status: "idle", // idle, generating, complete, error
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

    getAIGenerationTitle() {
      switch (this.modals.aiGeneration.status) {
        case "generating":
          return "Generating Cards with AI";
        case "complete":
          return "Generated Cards";
        case "error":
          return "Generation Error";
        default:
          return "Generate Cards";
      }
    },

    getLoadingMessage() {
      const messages = [
        "Analyzing your deck content...",
        "Creating knowledge connections...",
        "Generating balanced questions...",
        "Crafting clear answers...",
        "Refining flashcard quality...",
        "Applying spaced repetition principles...",
        "Almost done creating your cards...",
      ];

      // Return message based on progress
      const index = Math.min(
        Math.floor(this.modals.aiGeneration.progress / 15),
        messages.length - 1
      );
      return messages[index];
    },

    hasPreviousCard() {
      return (
        this.modals.viewCard.cardIndex !== null &&
        this.modals.viewCard.cardIndex > 0
      );
    },

    hasNextCard() {
      return (
        this.modals.viewCard.cardIndex !== null &&
        this.modals.viewCard.cardIndex < this.deck.cards.length - 1
      );
    },
  },
  async mounted() {
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
    async generateCards() {
      if (!this.deck) return;

      this.isGenerating = true;
      this.modals.aiGeneration.isOpen = true;
      this.modals.aiGeneration.status = "generating";
      this.modals.aiGeneration.progress = 0;
      this.modals.aiGeneration.cards = [];

      // Animation progress simulation
      const progressInterval = setInterval(() => {
        if (this.modals.aiGeneration.progress < 90) {
          this.modals.aiGeneration.progress += Math.random() * 10;
        }
      }, 300);

      try {
        const response = await $fetch("/api/generate-cards", {
          method: "POST",
          body: {
            deckName: this.deck.name,
            deckDescription: this.deck.description,
          },
        });

        // Stop the progress interval immediately
        clearInterval(progressInterval);

        // Process the response
        if (response && response.content && response.content.length > 0) {
          const cards = response.content.map((card) => ({
            ...card,
            id: this.deck.cards.length + 1,
            isNew: true, // Mark as new for animation
          }));

          this.modals.aiGeneration.cards = cards;

          // Complete the progress bar animation quickly
          const completeProgress = () => {
            if (this.modals.aiGeneration.progress < 100) {
              this.modals.aiGeneration.progress +=
                (100 - this.modals.aiGeneration.progress) / 2;
              if (this.modals.aiGeneration.progress > 99.5) {
                this.modals.aiGeneration.progress = 100;
                // Update the status immediately after progress reaches 100%
                this.modals.aiGeneration.status = "complete";
                return;
              }
              requestAnimationFrame(completeProgress);
            }
          };

          completeProgress();
        } else {
          // Handle empty response
          this.modals.aiGeneration.status = "error";
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error("Error generating cards:", error);
        this.modals.aiGeneration.status = "error";
      } finally {
        this.isGenerating = false;
      }
    },

    confirmGeneratedCards() {
      if (this.modals.aiGeneration.cards.length > 0) {
        // Add the generated cards to the deck
        this.deck.cards = [
          ...this.deck.cards,
          ...this.modals.aiGeneration.cards,
        ];

        // Show success message and confetti
        this.showGenerationSuccess = true;
        this.triggerConfetti();

        setTimeout(() => {
          this.showGenerationSuccess = false;
        }, 3000);

        // Remove the isNew flag after animation completes
        setTimeout(() => {
          this.deck.cards.forEach((card) => {
            if (card.isNew) card.isNew = false;
          });
        }, 5000);

        // Close the dialog
        this.modals.aiGeneration.isOpen = false;
        this.modals.aiGeneration.status = "idle";
      }
    },

    triggerConfetti() {
      this.confetti.active = true;

      // Reset particles to start position
      this.confetti.particles = Array(50)
        .fill()
        .map(() => ({
          x: Math.random() * 100,
          y: -20 - Math.random() * 100,
          size: 5 + Math.random() * 10,
          color: getRandomColor(),
          rotation: Math.random() * 360,
          speed: 1 + Math.random() * 5,
        }));

      // Disable after animation completes
      setTimeout(() => {
        this.confetti.active = false;
      }, 3000);
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

    getCardStatusClass(card) {
      if (!card.nextReview) return "bg-neutral-600"; // No review scheduled

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reviewDate = new Date(card.nextReview);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate < today) {
        return "bg-red-500"; // Overdue
      } else if (reviewDate.getTime() === today.getTime()) {
        return "bg-green-500"; // Due today
      } else {
        return "bg-blue-500"; // Upcoming
      }
    },

    formatNextReview(dateString) {
      if (!dateString) return "Not scheduled";

      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reviewDate = new Date(date);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate.getTime() === today.getTime()) {
        return "Today";
      } else if (reviewDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else {
        return date.toLocaleDateString();
      }
    },

    goToNextCard() {
      if (this.hasNextCard) {
        this.modals.viewCard.cardIndex++;
        this.modals.viewCard.showAnswer = false;
      }
    },

    goToPreviousCard() {
      if (this.hasPreviousCard) {
        this.modals.viewCard.cardIndex--;
        this.modals.viewCard.showAnswer = false;
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.perspective-1000:hover .backface-hidden {
  box-shadow: 0 30px 60px -15px rgba(124, 58, 237, 0.3);
}

.card-content {
  max-height: 100px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-text {
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.break-words {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Confetti animation */
.confetti {
  animation: fall-rotate linear forwards;
}

@keyframes fall-rotate {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* AI Generation animations */
.card-enter-active,
.card-leave-active {
  transition: all 0.5s cubic-bezier(0.05, 0.7, 0.1, 1);
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  filter: blur(5px);
}

.card-appear {
  animation: card-appear 0.8s forwards;
  animation-delay: var(--delay, 0ms);
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    box-shadow: 0 0 0 rgba(124, 58, 237, 0);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 25px -5px rgba(124, 58, 237, 0.3);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.2);
  }
}

/* Fix for Vue transition group */
.card-move {
  transition: transform 0.5s ease-in-out;
}

.card-highlight {
  animation: card-highlight 3s ease;
  border-color: rgba(124, 58, 237, 0.5);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.25);
}

@keyframes card-highlight {
  0% {
    transform: scale(1);
    border-color: rgba(124, 58, 237, 0.5);
  }
  10% {
    transform: scale(1.03);
    border-color: rgba(124, 58, 237, 0.8);
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  }
  20% {
    transform: scale(1);
  }
  100% {
    border-color: rgba(124, 58, 237, 0.1);
    box-shadow: 0 0 15px rgba(124, 58, 237, 0);
  }
}

.generation-success {
  animation: pulse-success 2s ease-in-out;
}

@keyframes pulse-success {
  0%,
  100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(124, 58, 237, 0.1);
  }
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Loading animation */
.loading-dots {
  display: inline-flex;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  margin: 0 2px;
  background-color: currentColor;
  animation: dot-flashing 1s infinite alternate;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-flashing {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}

.pulse-card {
  animation: pulse-shadow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: calc(var(--i, 0) * 0.5s);
}

.pulse-card:nth-child(1) {
  --i: 0;
}

.pulse-card:nth-child(2) {
  --i: 1;
}

.pulse-card:nth-child(3) {
  --i: 2;
}

@keyframes pulse-shadow {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.02);
    filter: brightness(1.15);
  }
}

@keyframes success-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
    transform: scale(0.95);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
    transform: scale(0.95);
  }
}

.animate-success-ring {
  animation: success-ring 2s infinite cubic-bezier(0.66, 0, 0.34, 1);
}

@keyframes error-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.7);
    transform: scale(0.95);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(248, 113, 113, 0);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(248, 113, 113, 0);
    transform: scale(0.95);
  }
}

.animate-error-pulse {
  animation: error-pulse 2s infinite cubic-bezier(0.66, 0, 0.34, 1);
}

.error-shake {
  animation: error-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-3px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(3px);
  }
}

.error-shake:hover {
  animation: none;
}
</style>
