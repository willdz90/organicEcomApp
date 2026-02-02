package com.global.iop.client;

public interface IopClient {
    IopResponse execute(IopRequest request) throws Exception;
}
