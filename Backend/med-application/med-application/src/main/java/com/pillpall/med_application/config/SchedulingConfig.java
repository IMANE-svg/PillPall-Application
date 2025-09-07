package com.pillpall.med_application.config;

import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.context.annotation.Configuration; import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration @EnableScheduling @EnableSchedulerLock(defaultLockAtMostFor = "PT30S")
public class SchedulingConfig { }
