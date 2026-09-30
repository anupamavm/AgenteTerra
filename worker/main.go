package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

type enrichmentJob struct {
	ListingID int64   `json:"listing_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres@localhost:5432/realestate?sslmode=disable"
	}
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	database, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return err
	}
	defer database.Close()
	if err := database.PingContext(ctx); err != nil {
		return err
	}

	redisOptions, err := redis.ParseURL(redisURL)
	if err != nil {
		return err
	}
	client := redis.NewClient(redisOptions)
	defer client.Close()

	var jobs sync.WaitGroup
	for ctx.Err() == nil {
		result, err := client.BLPop(ctx, 2*time.Second, "enrichment_queue").Result()
		if errors.Is(err, redis.Nil) {
			continue
		}
		if err != nil {
			if ctx.Err() != nil {
				break
			}
			log.Printf("queue read failed: %v", err)
			time.Sleep(500 * time.Millisecond)
			continue
		}
		if len(result) != 2 {
			log.Printf("unexpected queue response: %v", result)
			continue
		}

		var job enrichmentJob
		if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
			log.Printf("invalid enrichment job: %v", err)
			continue
		}

		jobs.Add(1)
		go func() {
			defer jobs.Done()
			if err := enrichListing(database, job); err != nil {
				log.Printf("failed to enrich listing %d: %v", job.ListingID, err)
			}
		}()
	}

	jobs.Wait()
	return nil
}

func enrichListing(database *sql.DB, job enrichmentJob) error {
	log.Printf("processing listing %d at (%f, %f)", job.ListingID, job.Latitude, job.Longitude)
	time.Sleep(1500 * time.Millisecond)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := database.ExecContext(
		ctx,
		"UPDATE property_listings SET is_enriched = true WHERE id = $1",
		job.ListingID,
	)
	return err
}
