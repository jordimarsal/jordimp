package net.jordimp.status.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import net.jordimp.status.core.StatusSnapshot;
import net.jordimp.status.core.StatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/status")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public Map<String, Object> getStatus() {
        StatusSnapshot snapshot = statusService.currentSnapshot();
        // R9: Return filtered JSON shape per engine
        return Map.of(
            "llamacpp", snapshot.llamacpp(),
            "strata", snapshot.strata()
        );
    }

    @GetMapping("/health")
    public Map<String, String> getHealth() {
        return Map.of("status", "ok");
    }
}
