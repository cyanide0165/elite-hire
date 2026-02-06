import axios from 'axios';
import axiosRetry from 'axios-retry';
import { LinkedInAuth } from './linkedinAuth';

export const linkedinClient = axios.create({
    baseURL: process.env.LINKEDIN_RSC_BASE_URL || 'https://api.linkedin.com/v2',
    headers: {
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
    },
});

// Retry Logic: Exponential Backoff
axiosRetry(linkedinClient, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`[LinkedInClient] Retry attempt #${retryCount}`);
        return axiosRetry.exponentialDelay(retryCount);
    },
    retryCondition: (error) => {
        // Retry on network errors or 429 Too Many Requests or 5xx
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.response?.status === 429 ||
            (error.response?.status !== undefined && error.response.status >= 500)
        );
    },
});

// Request Interceptor: Auth Injection & Rate Limiting Shim
linkedinClient.interceptors.request.use(async (config) => {
    const token = await LinkedInAuth.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Rate Limiter Delay Simulation (2-5s) to avoid hitting hard limits immediately
    // Ideally handled by Queue, but good to have a safety here or just logging
    console.log(`[LinkedInClient] Requesting: ${config.method?.toUpperCase()} ${config.url}`);

    return config;
});

// Response Interceptor: Logging
linkedinClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`[LinkedInClient] Error: ${error.message}`, error.response?.data);
        return Promise.reject(error);
    }
);
