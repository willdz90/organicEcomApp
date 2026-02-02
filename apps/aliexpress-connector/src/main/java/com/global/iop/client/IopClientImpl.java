package com.global.iop.client;

import java.util.HashMap;
import java.util.Map;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Minimal implementation of IopClient to support the Auth Flow.
 * Handles signing and HTTP POST requests.
 */
public class IopClientImpl implements IopClient {
    private String serverUrl;
    private String appKey;
    private String appSecret;

    public IopClientImpl(String serverUrl, String appKey, String appSecret) {
        this.serverUrl = serverUrl;
        this.appKey = appKey;
        this.appSecret = appSecret;
    }

    @Override
    public IopResponse execute(IopRequest request) throws Exception {
        // 1. Prepare Parameters
        Map<String, String> params = new TreeMap<>(); // TreeMap for sorting
        params.put("app_key", appKey);
        params.put("timestamp", String.valueOf(System.currentTimeMillis()));
        params.put("sign_method", "sha256");

        // Add request parameters
        if (request.getApiParams() != null) {
            params.putAll(request.getApiParams());
        }

        // 2. Generate Signature
        String sign = sign(params, request.getApiName());
        params.put("sign", sign);

        // 3. Make HTTP Request
        String fullUrl = serverUrl + request.getApiName();
        // Correcting URL structure for REST-like calls if needed,
        // but often IOP uses generic gateway.
        // For /auth/token/create, it usually is a direct POST.

        return doPost(fullUrl, params);
    }

    private String sign(Map<String, String> params, String apiName) throws Exception {
        // Mock Implementation of IOP Signing (HMAC-SHA256 usually)
        // Protocol: secret + apiName + sorted_params + secret
        StringBuilder sb = new StringBuilder();

        // Note: The specific signing logic for "Step 3" /auth/token/create might be
        // simpler (Client Credentials)
        // But following standard IOP pattern just in case.
        // Actually, for /auth/token/create, often the 'code' is enough if it's OAuth2
        // compliant.
        // However, we will include the standard signature.

        if (apiName.startsWith("/")) {
            sb.append(apiName);
        } else {
            sb.append("/" + apiName);
        }

        for (Map.Entry<String, String> entry : params.entrySet()) {
            sb.append(entry.getKey()).append(entry.getValue());
        }

        // HMAC-SHA256
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKey);
        byte[] bytes = hmacSha256.doFinal(sb.toString().getBytes(StandardCharsets.UTF_8));

        // Hex Encode
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            String h = Integer.toHexString(b & 0xFF);
            if (h.length() == 1)
                hex.append("0");
            hex.append(h);
        }
        return hex.toString().toUpperCase();
    }

    private IopResponse doPost(String urlStr, Map<String, String> params) {
        IopResponse response = new IopResponse();
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

            StringBuilder postData = new StringBuilder();
            for (Map.Entry<String, String> param : params.entrySet()) {
                if (postData.length() != 0)
                    postData.append('&');
                postData.append(URLEncoder.encode(param.getKey(), "UTF-8"));
                postData.append('=');
                postData.append(URLEncoder.encode(param.getValue(), "UTF-8"));
            }

            try (OutputStream os = conn.getOutputStream()) {
                os.write(postData.toString().getBytes("UTF-8"));
            }

            int code = conn.getResponseCode();
            BufferedReader in = new BufferedReader(new InputStreamReader(
                    code == 200 ? conn.getInputStream() : conn.getErrorStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();

            response.setGopResponseBody(content.toString());
            response.setSuccess(code == 200);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage(e.getMessage());
        }
        return response;
    }
}
