package net.jordimp.status.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Pure service managing engine statuses and change detection.
 */
public class StatusService {
    private static final Logger log = LoggerFactory.getLogger(StatusService.class);
    
    private final ProbeAdapter llamaAdapter;
    private final ProbeAdapter strataAdapter;
    private final List<Consumer<StatusSnapshot>> subscribers = new ArrayList<>();
    
    private StatusSnapshot currentSnapshot;

    public StatusService(ProbeAdapter llamaAdapter, ProbeAdapter strataAdapter) {
        this.llamaAdapter = llamaAdapter;
        this.strataAdapter = strataAdapter;
        // Initialize with "all down" state to ensure first refresh always triggers if engines are up
        this.currentSnapshot = new StatusSnapshot(EngineStatus.down(), EngineStatus.down());
    }

    public synchronized Result<StatusSnapshot, ProbeError> refresh() {
        var llamaRes = llamaAdapter.probe();
        var strataRes = strataAdapter.probe();

        EngineStatus llamaStatus = llamaRes.isOk() ? llamaRes.getValue() : EngineStatus.down();
        EngineStatus strataStatus = strataRes.isOk() ? strataRes.getValue() : EngineStatus.down();

        StatusSnapshot newSnapshot = new StatusSnapshot(llamaStatus, strataStatus);

        if (!newSnapshot.equals(currentSnapshot)) {
            log.info("Status change detected: {} -> {}", currentSnapshot, newSnapshot);
            currentSnapshot = newSnapshot;
            notifySubscribers(newSnapshot);
        }

        // If both failed, we return an Err for the whole operation? 
        // Requirement R7/R9 says engine down is a STATE. 
        // We only return Err if the service itself cannot function or if we want to signal total failure.
        // Given T4 description: "Err on ONE engine -> down() for that engine".
        // We'll return Ok with the snapshot containing down() statuses.
        return Result.ok(newSnapshot);
    }

    public synchronized StatusSnapshot currentSnapshot() {
        return currentSnapshot;
    }

    public synchronized void subscribe(Consumer<StatusSnapshot> listener) {
        subscribers.add(listener);
    }

    /** Removes a listener registered with {@link #subscribe(Consumer)}. */
    public synchronized void unsubscribe(Consumer<StatusSnapshot> listener) {
        subscribers.remove(listener);
    }

    private void notifySubscribers(StatusSnapshot snapshot) {
        for (var subscriber : subscribers) {
            try {
                subscriber.accept(snapshot);
            } catch (Exception e) {
                log.error("Error notifying subscriber", e);
            }
        }
    }
}
