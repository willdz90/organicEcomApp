package com.global.iop.client;

import java.util.HashMap;
import java.util.Map;

public class IopRequest {
    private String apiName;
    private Map<String, String> apiParams = new HashMap<>();

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public void addApiParameter(String key, String value) {
        apiParams.put(key, value);
    }

    public Map<String, String> getApiParams() {
        return apiParams;
    }
}
