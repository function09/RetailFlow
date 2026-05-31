FROM golang:1.26 AS builder
WORKDIR /usr/local/app

COPY go.mod ./ 
COPY go.sum ./
RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 go build -o server ./cmd/main.go

RUN CGO_ENABLED=0 go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM alpine:latest
WORKDIR /usr/local/app

COPY --from=builder /usr/local/app/server ./
COPY --from=builder /go/bin/migrate ./
COPY db/migrations ./db/migrations/

CMD ["./server"]

