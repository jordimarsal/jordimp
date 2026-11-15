package net.jordimp.status.web;

import tools.jackson.databind.json.JsonMapper;
import net.jordimp.status.config.AppProperties;
import net.jordimp.status.core.StatusSnapshot;
import net.jordimp.status.core.StatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

/**
 * T7: SSE Controller for real-time status updates.
 */
@RestController
public class SseController {
    private static final Logger log = LoggerFactory.getLogger(SseController.class);

    private final StatusService statusService;
    private final AppProperties props;
    private final JsonMapper objectMapper;
    private final AtomicLong globalSeq = new AtomicLong(0);
    private final Map<SseEmitter, Thread> heartbeatThreads = new ConcurrentHashMap<>();

    public SseController(StatusService statusService, AppProperties props, JsonMapper objectMapper) {
        this.statusService = statusService;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @GetMapping(path = "/api/status/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestHeader(value = "Last-Event-ID", required = false) String lastEventId) {
        SseEmitter emitter = new SseEmitter(0L);
        
        if (lastEventId != null) {
            log.info("Client reconnecting with Last-Event-ID: {}", lastEventId);
        }

        Consumer<StatusSnapshot> listener = snapshot -> {
            try {
                sendEvent(emitter, snapshot);
            } catch (IOException e) {
                log.warn("Failed to send SSE event to client: {}", e.getMessage());
            }
        };

        statusService.subscribe(listener);

        try {
            sendEvent(emitter, statusService.currentSnapshot());
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        Thread heartbeatThread = Thread.ofVirtual().start(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Thread.sleep((long) props.sseHeartbeatSeconds() * 1000L);
                    emitter.send(SseEmitter.event().comment("heartbeat"));
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (IOException | IllegalStateException e) {
                // emitter completed/closed: stop heartbeating for this client
                log.debug("Heartbeat stopped for emitter: {}", e.getMessage());
                return;
            }
        });

        heartbeatThreads.put(emitter, heartbeatThread);

        Runnable cleanup = () -> {
            statusService.unsubscribe(listener);
            Thread bt = heartbeatThreads.remove(emitter);
            if (bt != null) bt.interrupt();
            log.info("SSE connection closed/cleaned up");
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError((e) -> cleanup.run());

        return emitter;
    }

    private void sendEvent(SseEmitter emitter, StatusSnapshot snapshot) throws IOException {
        long seq = globalSeq.incrementAndGet();
        // R13: Include 'ts' in the payload
        String data = objectMapper.writeValueAsString(Map.of(
            "llamacpp", snapshot.llamacpp(),
            "strata", snapshot.strata(),
            "ts", Instant.now().toString()
        ));
        
        emitter.send(SseEmitter.event()
            .id(String.valueOf(seq))
            .name("status")
            .data(data)
            .reconnectTime(5000)
        );
    }
}
