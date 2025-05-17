<template>
  <div
    class="container mx-auto py-6 stats-dashboard"
    :class="{ 'show-stats': showStats }"
  >
    <div class="animated-bg"></div>

    <div class="flex justify-between items-center mb-6 header-section">
      <h1 class="text-2xl font-bold text-white">Stats Dashboard</h1>
      <NuxtLink to="/decks">
        <Button variant="outline">Back to Decks</Button>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 summary-section">
      <!-- Streak and Summary Cards -->
      <div class="grid grid-cols-2 gap-4 metrics-grid">
        <!-- Streak Counter -->
        <div
          class="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-neutral-800 rounded-lg p-4 flex flex-col items-center justify-center metric-card streak-card"
        >
          <div class="text-neutral-400 text-sm mb-1">Current Streak</div>
          <div class="text-3xl font-bold text-white value-highlight">
            {{ currentStreak }}
          </div>
          <div class="text-neutral-500 text-xs mt-1">days</div>
        </div>

        <!-- Cards Due vs Mastered -->
        <div
          class="bg-gradient-to-br from-neutral-900/60 to-black/60 border border-neutral-800 rounded-lg p-4 metric-card due-mastered-card"
        >
          <div class="text-neutral-400 text-sm mb-2">Cards Status</div>
          <div class="flex items-center justify-between">
            <div class="flex flex-col items-center">
              <div class="text-2xl font-bold text-white value-highlight">
                {{ dueTodayCount }}
              </div>
              <div class="text-neutral-500 text-xs">Due Today</div>
            </div>
            <div class="text-neutral-600 font-bold">vs</div>
            <div class="flex flex-col items-center">
              <div class="text-2xl font-bold text-green-400 value-highlight">
                {{ masteredCount }}
              </div>
              <div class="text-neutral-500 text-xs">Mastered</div>
            </div>
          </div>
        </div>

        <!-- Total Reviewed -->
        <div
          class="bg-gradient-to-br from-neutral-900/60 to-black/60 border border-neutral-800 rounded-lg p-4 metric-card reviews-card"
        >
          <div class="text-neutral-400 text-sm mb-2">Total Reviews</div>
          <div class="text-3xl font-bold text-white value-highlight">
            {{ totalReviews }}
          </div>
          <div class="text-neutral-500 text-xs mt-1">all time</div>
        </div>

        <!-- Average Rating -->
        <div
          class="bg-gradient-to-br from-neutral-900/60 to-black/60 border border-neutral-800 rounded-lg p-4 metric-card rating-card"
        >
          <div class="text-neutral-400 text-sm mb-2">Average Rating</div>
          <div class="text-3xl font-bold text-white value-highlight">
            {{ averageRating.toFixed(1) }}
          </div>
          <div class="text-neutral-500 text-xs mt-1">out of 5</div>
        </div>
      </div>

      <!-- Recent Performance -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 class="text-lg font-medium text-white mb-4">Recent Performance</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-neutral-800 p-3 rounded-lg text-center">
            <div class="text-sm text-neutral-400 mb-1">Again</div>
            <div class="text-xl font-bold text-red-400">
              {{ againPercentage }}%
            </div>
          </div>
          <div class="bg-neutral-800 p-3 rounded-lg text-center">
            <div class="text-sm text-neutral-400 mb-1">Good</div>
            <div class="text-xl font-bold text-green-400">
              {{ goodPercentage }}%
            </div>
          </div>
          <div class="bg-neutral-800 p-3 rounded-lg text-center">
            <div class="text-sm text-neutral-400 mb-1">Easy</div>
            <div class="text-xl font-bold text-blue-400">
              {{ easyPercentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards Reviewed Per Day Chart -->
    <div
      class="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6 chart-container"
    >
      <h2 class="text-lg font-medium text-white mb-4">
        Cards Reviewed Per Day
      </h2>
      <client-only>
        <template #fallback>
          <div class="chart-loading">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </template>
        <apexchart
          type="line"
          height="280"
          :options="cardsReviewedOptions"
          :series="cardsReviewedSeries"
          class="chart-element"
        ></apexchart>
      </client-only>
    </div>

    <!-- Retention Rate Per Deck Chart -->
    <div
      class="bg-neutral-900 border border-neutral-800 rounded-lg p-6 chart-container"
    >
      <h2 class="text-lg font-medium text-white mb-4">
        Retention Rate Per Deck
      </h2>
      <client-only>
        <template #fallback>
          <div class="chart-loading">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f46e5"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </template>
        <apexchart
          type="bar"
          height="280"
          :options="retentionRateOptions"
          :series="retentionRateSeries"
          class="chart-element"
        ></apexchart>
      </client-only>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import decks from "@/data/decks.json";

export default {
  data() {
    return {
      decks,
      // Use deep copy of decks with normalized dates for our calculations
      normalizedDecks: [],
      showStats: false,
      cardsReviewedOptions: {
        chart: {
          id: "cards-reviewed",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 1000,
            animateGradually: {
              enabled: true,
              delay: 150,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 450,
            },
          },
          background: "transparent",
        },
        colors: ["#8b5cf6"],
        stroke: {
          curve: "smooth",
          width: 3,
        },
        grid: {
          borderColor: "#333",
          row: {
            colors: ["transparent", "transparent"],
            opacity: 0.1,
          },
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              colors: "#888",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#888",
            },
          },
        },
        tooltip: {
          theme: "dark",
          marker: {
            show: true,
          },
          x: {
            show: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.3,
            gradientToColors: ["#4f46e5"],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100],
          },
        },
        markers: {
          size: 5,
          colors: ["#8b5cf6"],
          strokeWidth: 0,
          hover: {
            size: 8,
            sizeOffset: 3,
          },
        },
      },
      cardsReviewedSeries: [
        {
          name: "Cards Reviewed",
          data: [],
        },
      ],
      retentionRateOptions: {
        chart: {
          id: "retention-rate",
          toolbar: {
            show: false,
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 1200,
            animateGradually: {
              enabled: true,
              delay: 200,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 550,
            },
          },
          background: "transparent",
        },
        colors: ["#4f46e5"],
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: "70%",
            dataLabels: {
              position: "top",
            },
            distributed: true,
            endingShape: "rounded",
          },
        },
        grid: {
          borderColor: "#333",
          row: {
            colors: ["transparent", "transparent"],
            opacity: 0.1,
          },
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              colors: "#888",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          max: 100,
          labels: {
            style: {
              colors: "#888",
            },
            formatter: function (val) {
              return val + "%";
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val + "%";
          },
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#fff"],
          },
          animation: {
            enabled: true,
            speed: 1500,
            animateGradually: {
              delay: 300,
              enabled: true,
            },
          },
        },
        tooltip: {
          theme: "dark",
          y: {
            formatter: function (val) {
              return val + "%";
            },
          },
          marker: {
            show: true,
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.4,
            gradientToColors: ["#8b5cf6"],
            inverseColors: false,
            opacityFrom: 0.85,
            opacityTo: 1,
            stops: [0, 100],
          },
        },
      },
      retentionRateSeries: [
        {
          name: "Retention Rate",
          data: [],
        },
      ],
    };
  },
  computed: {
    // Streak counter
    currentStreak() {
      return this.calculateStreak();
    },
    // Cards mastered (cards with interval > 30 days)
    masteredCount() {
      let count = 0;
      this.normalizedDecks.forEach((deck) => {
        count += deck.cards.filter((card) => (card.interval || 0) > 30).length;
      });
      return count;
    },
    // Cards due today
    dueTodayCount() {
      const today = dayjs().format("YYYY-MM-DD");
      let count = 0;
      this.normalizedDecks.forEach((deck) => {
        count += deck.cards.filter((card) => {
          if (card.isNew === true) return true;
          if (card.nextReview && card.nextReview !== "") {
            const nextReview = dayjs(card.nextReview).format("YYYY-MM-DD");
            return nextReview <= today;
          }
          return false;
        }).length;
      });
      return count;
    },
    // Total review count
    totalReviews() {
      let count = 0;
      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          count += card.reviewHistory ? card.reviewHistory.length : 0;
        });
      });
      return count;
    },
    // Average rating
    averageRating() {
      let totalRating = 0;
      let totalCount = 0;

      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            card.reviewHistory.forEach((review) => {
              totalRating += review.quality;
              totalCount++;
            });
          }
        });
      });

      return totalCount > 0 ? totalRating / totalCount : 0;
    },
    // Recent performance percentages (last 30 days)
    recentReviews() {
      const thirtyDaysAgo = dayjs().subtract(30, "day").format("YYYY-MM-DD");
      let reviews = [];

      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            const recentReviews = card.reviewHistory.filter(
              (review) => review.date >= thirtyDaysAgo
            );
            reviews = [...reviews, ...recentReviews];
          }
        });
      });

      return reviews;
    },
    againPercentage() {
      if (this.recentReviews.length === 0) return 0;
      const againCount = this.recentReviews.filter(
        (review) => review.quality === 1 || review.quality === 2
      ).length;
      return Math.round((againCount / this.recentReviews.length) * 100);
    },
    goodPercentage() {
      if (this.recentReviews.length === 0) return 0;
      const goodCount = this.recentReviews.filter(
        (review) => review.quality === 3 || review.quality === 4
      ).length;
      return Math.round((goodCount / this.recentReviews.length) * 100);
    },
    easyPercentage() {
      if (this.recentReviews.length === 0) return 0;
      const easyCount = this.recentReviews.filter(
        (review) => review.quality === 5
      ).length;
      return Math.round((easyCount / this.recentReviews.length) * 100);
    },
  },
  mounted() {
    // Add a slight delay to trigger animations
    setTimeout(() => {
      this.showStats = true;
    }, 100);

    // Normalize historical dates to be relative to today
    this.normalizeReviewDates();
    this.calculateCardsReviewedPerDay();
    this.calculateRetentionRate();
  },
  methods: {
    normalizeReviewDates() {
      // Make a deep copy of decks
      this.normalizedDecks = JSON.parse(JSON.stringify(this.decks));

      const today = dayjs();

      // Find the most recent review date in the data
      let latestDate = null;
      this.decks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            card.reviewHistory.forEach((review) => {
              const reviewDate = dayjs(review.date);
              if (!latestDate || reviewDate.isAfter(latestDate)) {
                latestDate = reviewDate;
              }
            });
          }
        });
      });

      if (!latestDate) return;

      // Calculate the difference between the latest review date and today
      const daysDifference = today.diff(latestDate, "day");

      // Update all dates to be relative to today
      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.nextReview) {
            card.nextReview = dayjs(card.nextReview)
              .add(daysDifference, "day")
              .format("YYYY-MM-DD");
          }

          if (card.reviewHistory && card.reviewHistory.length > 0) {
            card.reviewHistory.forEach((review) => {
              review.date = dayjs(review.date)
                .add(daysDifference, "day")
                .format("YYYY-MM-DD");
            });
          }
        });
      });
    },

    calculateCardsReviewedPerDay() {
      // Get all review dates from the last 14 days
      const reviewDates = [];
      const reviewCounts = [];

      // Generate the last 14 days including today
      const today = dayjs().format("YYYY-MM-DD");

      // Add today's date explicitly to ensure it's included
      reviewDates.push(dayjs().format("MMM DD"));

      // Count reviews for today
      let todayCount = 0;
      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            todayCount += card.reviewHistory.filter(
              (review) => review.date === today
            ).length;
          }
        });
      });
      reviewCounts.push(todayCount);

      // Now add the past 13 days
      for (let i = 1; i <= 13; i++) {
        const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
        reviewDates.unshift(dayjs().subtract(i, "day").format("MMM DD"));

        // Count reviews on this date
        let count = 0;
        this.normalizedDecks.forEach((deck) => {
          deck.cards.forEach((card) => {
            if (card.reviewHistory && card.reviewHistory.length > 0) {
              count += card.reviewHistory.filter(
                (review) => review.date === date
              ).length;
            }
          });
        });

        reviewCounts.unshift(count);
      }

      this.cardsReviewedOptions.xaxis.categories = reviewDates;
      this.cardsReviewedSeries[0].data = reviewCounts;
    },

    calculateRetentionRate() {
      const deckNames = [];
      const retentionRates = [];

      this.normalizedDecks.forEach((deck) => {
        deckNames.push(deck.name);

        // Calculate retention rate (percentage of reviews with quality >= 3)
        let successCount = 0;
        let totalCount = 0;

        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            totalCount += card.reviewHistory.length;
            successCount += card.reviewHistory.filter(
              (review) => review.quality >= 3
            ).length;
          }
        });

        const retentionRate =
          totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
        retentionRates.push(retentionRate);
      });

      this.retentionRateOptions.xaxis.categories = deckNames;
      this.retentionRateSeries[0].data = retentionRates;
    },

    calculateStreak() {
      // Get unique days with reviews, sorted in descending order
      const reviewDays = new Set();

      this.normalizedDecks.forEach((deck) => {
        deck.cards.forEach((card) => {
          if (card.reviewHistory && card.reviewHistory.length > 0) {
            card.reviewHistory.forEach((review) => {
              reviewDays.add(review.date);
            });
          }
        });
      });

      const sortedDays = Array.from(reviewDays).sort().reverse();

      // Handle edge case of no reviews
      if (sortedDays.length === 0) return 0;

      // Check if today has reviews
      const today = dayjs().format("YYYY-MM-DD");
      const hasReviewToday = sortedDays.includes(today);

      // Calculate streak
      let streak = hasReviewToday ? 1 : 0;

      if (streak > 0 && sortedDays.length > 1) {
        let currentDate = today;

        for (let i = hasReviewToday ? 1 : 0; i < sortedDays.length; i++) {
          const expectedPrevDay = dayjs(currentDate)
            .subtract(1, "day")
            .format("YYYY-MM-DD");

          if (sortedDays[i] === expectedPrevDay) {
            streak++;
            currentDate = expectedPrevDay;
          } else {
            break;
          }
        }
      }

      return streak;
    },
  },
};
</script>

<style scoped>
/* Add animated background */
.stats-dashboard {
  opacity: 0;
  position: relative;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      circle at 15% 50%,
      rgba(76, 29, 149, 0.03) 0%,
      rgba(30, 58, 138, 0) 45%
    ),
    radial-gradient(
      circle at 85% 30%,
      rgba(124, 58, 237, 0.03) 0%,
      rgba(30, 58, 138, 0) 55%
    );
  z-index: -1;
  opacity: 0;
  transition: opacity 1.2s ease-out;
}

.stats-dashboard.show-stats .animated-bg {
  opacity: 1;
}

/* Apply animations to chart containers */
.bg-neutral-900 {
  position: relative;
  overflow: hidden;
}

.bg-neutral-900:nth-of-type(1) {
  animation: slideInUp 0.8s ease-out forwards;
  animation-delay: 0.3s;
}

.bg-neutral-900:nth-of-type(2) {
  animation: slideInUp 0.8s ease-out forwards;
  animation-delay: 0.5s;
}

.bg-neutral-900::before {
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
  z-index: 2;
}

.chart-container {
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.15);
}

/* Gradient animation for the background */
@keyframes move-gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

/* Overall dashboard animation */
.stats-dashboard.show-stats {
  opacity: 1;
  transition: opacity 0.5s ease-out;
}

.header-section {
  opacity: 0;
  transform: translateY(-10px);
}

.stats-dashboard.show-stats .header-section {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.6s ease-out;
}

/* Number value highlight animation */
@keyframes highlight {
  0% {
    text-shadow: 0 0 0 rgba(168, 85, 247, 0);
  }
  50% {
    text-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
  }
  100% {
    text-shadow: 0 0 0 rgba(168, 85, 247, 0);
  }
}

.value-highlight {
  animation: highlight 2s ease-in-out 1;
  animation-delay: 1s;
}

/* Staggered metric cards animation */
.metric-card {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.stats-dashboard.show-stats .streak-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.5s ease-out;
  transition-delay: 0.2s;
}

.stats-dashboard.show-stats .due-mastered-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.5s ease-out;
  transition-delay: 0.3s;
}

.stats-dashboard.show-stats .reviews-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.5s ease-out;
  transition-delay: 0.4s;
}

.stats-dashboard.show-stats .rating-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 0.5s ease-out;
  transition-delay: 0.5s;
}

/* Animation for the stats cards */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.grid > div:nth-child(1) {
  --index: 1;
}
.grid > div:nth-child(2) {
  --index: 2;
}
.grid > div:nth-child(3) {
  --index: 3;
}
.grid > div:nth-child(4) {
  --index: 4;
}

/* Chart container animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
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

/* Animation for loading state */
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Loading indicator for charts */
.chart-loading {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1f1f1f, #2d2d2d);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.chart-loading svg {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
