package com.realestate.due_diligence_agent.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Profile photos (Requested Change 4) are stored as plain files on local
 * disk -- no external storage service, matching the rest of this project's
 * footprint. This just exposes that directory at /uploads/** so a saved
 * file is reachable by URL immediately after upload.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.profile-images-dir}")
    private String profileImagesDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = new File(profileImagesDir).getAbsolutePath();
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations("file:" + absolutePath + File.separator);
    }
}
