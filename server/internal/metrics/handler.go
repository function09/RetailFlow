package metrics

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func GetAllMetricsHandler(store MetricsStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		metrics, err := store.GetAllMetrics(r.Context())

		if err != nil {
			slog.Error("error getting metrics", "err", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(metrics)
	}
}
