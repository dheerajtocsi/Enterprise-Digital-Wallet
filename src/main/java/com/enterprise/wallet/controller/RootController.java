package com.enterprise.wallet.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class RootController {

    @GetMapping("/")
    @ResponseBody
    public Map<String, String> heartBeat() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "Enterprise Digital Wallet API — High-throughput Production Instance");
        status.put("version", "1.0.0");
        status.put("docs", "/swagger-ui/index.html");
        return status;
    }
}
