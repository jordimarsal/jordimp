package net.jordimp.status.web;

import tools.jackson.databind.json.JsonMapper;
import net.jordimp.status.config.AppProperties;
import net.jordimp.status.core.*;
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
import java.util.List;
import java.util.function.Consumer;

/**
 * T26.2: SSE Controller for /api/fleet combining engine status and scoreboard.
 */
@RestController
public class FleetSseController {
    private static final Logger log = LoggerFactory.getLogger(FleetSseController.class);

    private final StatusService statusService;
    private final FleetService fleetService;
    private final AppProperties props;
    private final JsonMapper objectMapper;
    private final AtomicLong seq = new AtomicLong(0);
    private final Map<SseEmitter, Thread> heartbeatThreads = new ConcurrentHashMap<>();

    public FleetSseController(StatusService statusService, FleetService fleetService, AppProperties props, JsonMapper objectMapper) {
        this.statusService = statusService;
        this.fleetService = fleetService;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @GetMapping(path = "/api/fleet", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestHeader(value = "Last-Event-ID", required = false) String lastEventId) {
        SseEmitter emitter = new SseEmitter(0L);
        
        Consumer<StatusSnapshot> statusListener = snapshot -> push(emitter);
        Consumer<List<FleetRow>> fleetListener = rows -> push(emitter);

        statusService.subscribe(statusListener);
        fleetService.subscribe(fleetListener);

        // Initial push
        push(emitter);

        Thread heartbeatThread = Thread.ofVirtual().start(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Thread.sleep((long) props.sseHeartbeatSeconds() * 1000L);
                    emitter.send(SseEmitter.event().comment("heartbeat"));
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (IOException | IllegalStateException e) {
                return;
            }
        });

        heartbeatThreads.put(emitter, heartbeatThread);

        Runnable cleanup = () -> {
            statusService.unsubscribe(statusListener);
            fleetService.unsubscribe(fleetListener);
            Thread bt = heartbeatThreads.remove(emitter);
            if (bt != null) bt.interrupt();
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError((e) -> cleanup.run());

        return emitter;
    }

    private synchronized void push(SseEmitter emitter) {
        try {
            StatusSnapshot status = statusService.currentSnapshot();
            List<FleetRow> scoreboard = fleetService.getScoreboard();
            
            String data = objectMapper.writeValueAsString(Map.of(
                "seq", seq.incrementAndGet(),
                "ts", Instant.now().toString(),
                "engines", Map.of(
                    "llamacpp", status.llamacpp(),
                    "strata", status.strata()
                ),
                "scoreboard", scoreboard
            ));

            emitter.send(SseEmitter.event()
                .id(String.valueOf(seq.get()))
                .name("fleet")
                .data(data)
                .reconnectTime(5000)
            );
        } catch (Exception e) {
            log.warn("Failed to push SSE event: {}", e.getMessage());
        }
    }
}
