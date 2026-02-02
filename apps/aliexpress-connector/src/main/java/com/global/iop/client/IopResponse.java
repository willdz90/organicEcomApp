package com.global.iop.client;

public class IopResponse {
    private boolean success;
    private String message;
    private String gopResponseBody;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getGopResponseBody() {
        return gopResponseBody;
    }

    public void setGopResponseBody(String gopResponseBody) {
        this.gopResponseBody = gopResponseBody;
    }
}
