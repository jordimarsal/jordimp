package net.jordimp.status.config;

import net.jordimp.status.core.FleetService;
import net.jordimp.status.core.StatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Polls the engines on a fixed delay (R6). Virtual threads come from
 *  spring.threads.virtual.enabled=true (ADR-1). */
@Component
public class StatusRefresher {
    private static final Logger log = LoggerFactory.getLogger(StatusRefresher.class);

    private final StatusService service;
    private final FleetService fleetService;

    public StatusRefresher(StatusService service, FleetService fleetService) {
        this.service = service;
        this.fleetService = fleetService;
    }

    @Scheduled(fixedDelayString = "${app.refresh-interval-ms:30000}")
    public void refresh() {
        service.refresh();
        log.debug("engine status refreshed");
        fleetService.refreshIfChanged();
        log.debug("fleet status refreshed");
    }
}
