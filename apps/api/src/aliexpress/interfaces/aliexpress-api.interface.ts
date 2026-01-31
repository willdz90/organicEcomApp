export interface AliexpressTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    user_id?: string;
    havana_id?: string;
}

export interface AliexpressProduct {
    product_id: string;
    product_title: string;
    product_main_image_url: string;
    target_sale_price: string;
    target_original_price: string;
    target_sale_price_currency?: string;
    evaluate_rate?: string;
    original_image_urls?: string[];
    lastest_volume?: number;
    product_detail_url?: string;
    category_id?: string;
    category_name?: string;
    shop_id?: string;
    shop_url?: string;
}

export interface AliexpressSearchResponse {
    aliexpress_ds_product_get_response?: {
        result?: {
            products?: {
                traffic_product_d_t_o?: AliexpressProduct[];
            };
            total_record_count?: number;
        };
    };
}

export interface AliexpressProductDetail {
    product_id: string;
    product_title: string;
    product_main_image_url: string;
    original_image_urls?: string[];
    product_description?: string;
    target_sale_price: string;
    target_original_price: string;
    target_sale_price_currency?: string;
    evaluate_rate?: string;
    lastest_volume?: number;
    category_id?: string;
    category_name?: string;
    shop_id?: string;
    shop_url?: string;
    shop_name?: string;
    package_type?: string;
    lot_num?: number;
    product_status_type?: string;
    product_detail_url?: string;
}

export interface AliexpressApiError {
    error_code: string;
    error_message: string;
}
