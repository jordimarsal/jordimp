package net.jordimp.status;

import net.jordimp.status.adapters.LlamaProbeAdapter;
import net.jordimp.status.adapters.StrataProbeAdapter;
import net.jordimp.status.config.AppProperties;
import net.jordimp.status.core.StatusService;
import net.jordimp.status.web.CorsConfig;
import net.jordimp.status.web.RateLimitFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(AppProperties.class)
public class StatusApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(StatusApiApplication.class, args);
    }

    @Bean
    public StatusService statusService(AppProperties props, LlamaProbeAdapter llama, StrataProbeAdapter strata) {
        return new StatusService(llama, strata);
    }

    @Bean
    public LlamaProbeAdapter llamaProbeAdapter(@Value("${llama.base-url}") String url,
                                               @Value("${app.probe-timeout-ms}") int timeout) {
        return new LlamaProbeAdapter(url, timeout);
    }

    @Bean
    public StrataProbeAdapter strataProbeAdapter(@Value("${strata.base-url}") String url,
                                                 @Value("${app.probe-timeout-ms}") int timeout) {
        return new StrataProbeAdapter(url, timeout);
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(AppProperties props) {
        FilterRegistrationBean<RateLimitFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(new RateLimitFilter(props));
        reg.addUrlPatterns("/api/status", "/api/status/stream", "/api/health");
        reg.setOrder(1);
        return reg;
    }

    @Bean
    public FilterRegistrationBean<CorsConfig> corsFilterRegistration(AppProperties props) {
        FilterRegistrationBean<CorsConfig> reg = new FilterRegistrationBean<>();
        reg.setFilter(new CorsConfig(props));
        reg.addUrlPatterns("/api/*");
        reg.setOrder(0); // CORS should run before Rate Limiting to allow preflights
        return reg;
    }

}
