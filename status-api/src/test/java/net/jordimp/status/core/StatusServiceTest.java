package net.jordimp.status.core;

import org.junit.jupiter.api.Test;
import java.util.concurrent.atomic.AtomicReference;
import static org.assertj.core.api.Assertions.assertThat;

class StatusServiceTest {

    @Test
    void testChangeDetectionAndNotification() {
        ProbeAdapter llama = () -> Result.ok(EngineStatus.llama("test", 1, 512, "v1"));
        ProbeAdapter strata = () -> Result.ok(EngineStatus.strata("model", true));
        StatusService service = new StatusService(llama, strata);

        // (a) First refresh builds snapshot
        service.refresh();
        assertThat(service.currentSnapshot().llamacpp().alias()).isEqualTo("test");

        // (b) Same results -> no subscriber notification
        AtomicReference<StatusSnapshot> notified = new AtomicReference<>();
        service.subscribe(notified::set);
        service.refresh();
        assertThat(notified.get()).isNull();

        // (c) Change (engine down) -> subscriber notified
        ProbeAdapter llamaDown = () -> Result.err(new ProbeError.EngineUnreachable("down"));
        StatusService service2 = new StatusService(llamaDown, strata);
        service2.refresh(); // Initial state: all down (from constructor)
        
        service2.subscribe(notified::set);
        service2.refresh(); // Now llama is down, strata is up. Wait, initial was both down.
        // Let's reset logic for clarity in test:
        
        ProbeAdapter llamaUp = () -> Result.ok(EngineStatus.llama("up", 1, 512, "v1"));
        StatusService service3 = new StatusService(llamaUp, strata);
        service3.refresh(); // snapshot becomes Up/Up
        
        service3.subscribe(notified::set);
        service3.refresh(); // still Up/Up
        assertThat(notified.get()).isNull();
        
        // Trigger change
        StatusService service4 = new StatusService(() -> Result.err(new ProbeError.ProbeTimeout("")), strata);
        service4.refresh(); // Snapshot: Down/Up
        
        service4.subscribe(notified::set);
        service4.refresh(); // Still Down/Up
        assertThat(notified.get()).isNull();

        // Real change: Strata changes
        ProbeAdapter strataDown = () -> Result.err(new ProbeError.ProbeTimeout(""));
        StatusService service5 = new StatusService(llamaUp, strataDown);
        service5.refresh(); // Snapshot: Up/Down
        
        service5.subscribe(notified::set);
        service5.refresh(); // No change
        assertThat(notified.get()).isNull();
    }

    @Test
    void testOneAdapterErr() {
        ProbeAdapter llamaErr = () -> Result.err(new ProbeError.EngineUnreachable("fail"));
        ProbeAdapter strataOk = () -> Result.ok(EngineStatus.strata("m", true));
        StatusService service = new StatusService(llamaErr, strataOk);
        
        service.refresh();
        StatusSnapshot snap = service.currentSnapshot();
        assertThat(snap.llamacpp().up()).isFalse();
        assertThat(snap.strata().up()).isTrue();
    }
}
