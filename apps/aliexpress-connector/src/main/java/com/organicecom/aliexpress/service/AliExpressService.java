package com.organicecom.aliexpress.service;

import com.global.iop.client.IopClient;
import com.global.iop.client.IopClientImpl;
import com.global.iop.client.IopRequest;
import com.global.iop.client.IopResponse;
import com.alibaba.fastjson.JSON;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AliExpressService {

    @Value("${aliexpress.app-key}")
    private String appKey;

    @Value("${aliexpress.app-secret}")
    private String appSecret;

    @Value("${aliexpress.api-url}")
    private String apiUrl;

    @Value("${aliexpress.callback-url}")
    private String callbackUrl;

    /**
     * Step 1 & 2: Generate Authorization URL
     */
    public String getAuthUrl() {
        return apiUrl + "/oauth/authorize?response_type=code" +
                "&force_auth=true" +
                "&redirect_uri=" + callbackUrl +
                "&client_id=" + appKey;
    }

    /**
     * Step 3: Exchange Code for Token
     */
    public Object exchangeToken(String code) throws Exception {
        String action = "/auth/token/create";

        // Using the structure from the screenshot
        IopClient client = new IopClientImpl(apiUrl, appKey, appSecret);
        IopRequest request = new IopRequest();
        request.setApiName(action);
        request.addApiParameter("code", code);

        IopResponse response = client.execute(request);

        // Parse the response body (GOP format) or return the whole object
        System.out.println("Response: " + JSON.toJSONString(response));

        if (response.isSuccess()) {
            return JSON.parse(response.getGopResponseBody());
        } else {
            throw new RuntimeException("AliExpress Error: " + response.getMessage());
        }
    }

    /**
     * Step 4: Refresh Access Token
     */
    public Object refreshToken(String refreshToken) throws Exception {
        String action = "/auth/token/refresh";

        IopClient client = new IopClientImpl(apiUrl, appKey, appSecret);
        IopRequest request = new IopRequest();
        request.setApiName(action);
        request.addApiParameter("refresh_token", refreshToken);

        IopResponse response = client.execute(request);

        System.out.println("Refresh Response: " + JSON.toJSONString(response));

        if (response.isSuccess()) {
            return JSON.parse(response.getGopResponseBody());
        } else {
            throw new RuntimeException("AliExpress Refresh Error: " + response.getMessage());
        }
    }
}
