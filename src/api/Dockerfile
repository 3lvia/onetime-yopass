FROM library/golang:buster as app
RUN mkdir -p /yopass
WORKDIR /yopass
COPY . .
RUN go build ./cmd/yopass && \
    go build ./cmd/yopass-server


FROM gcr.io/distroless/base
COPY --from=app --chown=nonroot:nonroot /yopass/yopass /yopass/yopass-server /
USER nonroot
ENTRYPOINT ["/yopass-server"]
