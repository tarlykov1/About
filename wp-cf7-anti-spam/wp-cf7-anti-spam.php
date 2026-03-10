<?php
/**
 * Plugin Name: CF7 Fortress Anti-Spam
 * Description: Multi-layer anti-spam protection for Contact Form 7: honeypot, time trap, rate limit, URL/keyword/disposable-email checks.
 * Version: 1.0.0
 * Author: Site Security Team
 */

if (!defined('ABSPATH')) {
    exit;
}

final class CF7_Fortress_Anti_Spam {
    private const HONEYPOT_FIELD = '_cf7_hp_company';
    private const TIMESTAMP_FIELD = '_cf7_fts';

    private const MIN_FILL_SECONDS = 4;
    private const MAX_URLS_IN_MESSAGE = 2;
    private const RATE_LIMIT_WINDOW = 10; // minutes
    private const RATE_LIMIT_ATTEMPTS = 5;

    /**
     * Список временных/одноразовых доменов почты.
     */
    private const DISPOSABLE_DOMAINS = [
        'mailinator.com',
        '10minutemail.com',
        'guerrillamail.com',
        'tempmail.com',
        'trashmail.com',
        'yopmail.com',
    ];

    /**
     * Маркеры частого спама (можно расширять).
     */
    private const SPAM_KEYWORDS = [
        'crypto',
        'casino',
        'loan',
        'forex',
        'backlink',
        'seo service',
        'viagra',
        'porn',
    ];

    public static function init(): void {
        if (!class_exists('WPCF7_Submission')) {
            return;
        }

        add_filter('wpcf7_form_hidden_fields', [self::class, 'add_hidden_fields']);
        add_filter('wpcf7_form_elements', [self::class, 'inject_honeypot_field'], 20, 1);
        add_filter('wpcf7_spam', [self::class, 'is_spam'], 20, 1);
        add_action('wp_enqueue_scripts', [self::class, 'enqueue_assets']);
    }

    public static function add_hidden_fields(array $fields): array {
        $fields[self::TIMESTAMP_FIELD] = '0';
        return $fields;
    }

    public static function inject_honeypot_field(string $content): string {
        $honeypot = sprintf(
            '<span class="cf7-fortress-hp" aria-hidden="true"><label>Company <input type="text" name="%s" tabindex="-1" autocomplete="off"></label></span>',
            esc_attr(self::HONEYPOT_FIELD)
        );

        return $content . $honeypot;
    }

    public static function enqueue_assets(): void {
        if (!function_exists('wpcf7_enqueue_scripts')) {
            return;
        }

        wp_enqueue_script(
            'cf7-fortress-anti-spam',
            plugin_dir_url(__FILE__) . 'assets/cf7-fortress.js',
            [],
            '1.0.0',
            true
        );

        if (wp_style_is('contact-form-7', 'enqueued') || wp_style_is('contact-form-7', 'registered')) {
            wp_add_inline_style(
                'contact-form-7',
                '.cf7-fortress-hp{position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;}'
            );
        }
    }

    public static function is_spam(bool $spam): bool {
        if ($spam) {
            return true;
        }

        $submission = WPCF7_Submission::get_instance();
        if (!$submission) {
            return false;
        }

        $posted = $submission->get_posted_data();
        if (!is_array($posted)) {
            return true;
        }

        if (self::failed_honeypot($posted)) {
            self::debug_log('Blocked by honeypot');
            return true;
        }

        if (self::failed_time_trap($posted)) {
            self::debug_log('Blocked by time trap');
            return true;
        }

        if (self::failed_rate_limit()) {
            self::debug_log('Blocked by rate limit');
            return true;
        }

        if (self::contains_too_many_urls($posted)) {
            self::debug_log('Blocked by URL density');
            return true;
        }

        if (self::contains_spam_keywords($posted)) {
            self::debug_log('Blocked by keyword filter');
            return true;
        }

        if (self::is_disposable_email($posted)) {
            self::debug_log('Blocked by disposable email');
            return true;
        }

        return false;
    }

    private static function failed_honeypot(array $posted): bool {
        return isset($posted[self::HONEYPOT_FIELD]) && !empty($posted[self::HONEYPOT_FIELD]);
    }

    private static function failed_time_trap(array $posted): bool {
        $ts = isset($posted[self::TIMESTAMP_FIELD]) ? (int) $posted[self::TIMESTAMP_FIELD] : 0;

        // Если timestamp отсутствует (JS-конфликт/кеш/минификация), не блокируем заявку,
        // чтобы не ломать отправку легитимных пользователей.
        if ($ts <= 0) {
            return false;
        }

        $elapsed = time() - $ts;
        return $elapsed < self::MIN_FILL_SECONDS;
    }

    private static function failed_rate_limit(): bool {
        $ip = self::get_client_ip();
        if (!$ip) {
            return false;
        }

        $key = 'cf7_fortress_' . md5($ip);
        $attempts = (int) get_transient($key);

        if ($attempts >= self::RATE_LIMIT_ATTEMPTS) {
            return true;
        }

        set_transient($key, $attempts + 1, self::RATE_LIMIT_WINDOW * MINUTE_IN_SECONDS);
        return false;
    }

    private static function contains_too_many_urls(array $posted): bool {
        $text = self::collect_text($posted);
        if ($text === '') {
            return false;
        }

        preg_match_all('~https?://|www\.~iu', $text, $matches);
        return count($matches[0]) > self::MAX_URLS_IN_MESSAGE;
    }

    private static function contains_spam_keywords(array $posted): bool {
        $text = self::to_lower(self::collect_text($posted));
        if ($text === '') {
            return false;
        }

        foreach (self::SPAM_KEYWORDS as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private static function is_disposable_email(array $posted): bool {
        $email = '';
        foreach ($posted as $value) {
            if (is_string($value) && is_email($value)) {
                $email = $value;
                break;
            }
        }

        if ($email === '') {
            return false;
        }

        $domain = strtolower(substr(strrchr($email, '@') ?: '', 1));
        if ($domain === '') {
            return false;
        }

        return in_array($domain, self::DISPOSABLE_DOMAINS, true);
    }

    private static function collect_text(array $posted): string {
        $chunks = [];
        foreach ($posted as $value) {
            if (is_string($value)) {
                $chunks[] = $value;
                continue;
            }

            if (is_array($value)) {
                $flat = array_filter($value, 'is_string');
                if (!empty($flat)) {
                    $chunks[] = implode(' ', $flat);
                }
            }
        }

        return trim(implode(' ', $chunks));
    }

    private static function to_lower(string $value): string {
        if ($value === '') {
            return '';
        }

        if (function_exists('mb_strtolower')) {
            return mb_strtolower($value);
        }

        return strtolower($value);
    }


    private static function debug_log(string $message): void {
        if (!defined('WP_DEBUG_LOG') || !WP_DEBUG_LOG) {
            return;
        }

        error_log('[CF7 Fortress] ' . $message);
    }

    private static function get_client_ip(): string {
        $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];

        foreach ($keys as $key) {
            if (empty($_SERVER[$key])) {
                continue;
            }

            $raw = wp_unslash($_SERVER[$key]);
            $candidate = trim(explode(',', $raw)[0]);

            if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }

        return '';
    }
}

CF7_Fortress_Anti_Spam::init();
