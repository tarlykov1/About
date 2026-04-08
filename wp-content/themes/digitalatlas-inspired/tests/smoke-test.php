<?php

declare(strict_types=1);

error_reporting(E_ALL);

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

function __(string $text, string $domain = ''): string { return $text; }
function esc_html__(string $text, string $domain = ''): string { return $text; }
function esc_html_e(string $text, string $domain = ''): void { echo $text; }
function esc_url(string $url): string { return $url; }
function home_url(string $path = ''): string { return 'https://example.test' . $path; }
function get_template_directory_uri(): string { return 'https://example.test/wp-content/themes/digitalatlas-inspired'; }
function get_template_directory(): string { return realpath(__DIR__ . '/..') ?: __DIR__; }
function wp_get_theme(): object { return new class { public function get(string $key): string { return '1.0.0'; } }; }
function add_theme_support(string $feature): void {}
function register_nav_menus(array $menus): void {}
function add_action(string $hook, string $callback): void {}
function register_sidebar(array $args): void {}
function wp_enqueue_style(string $handle, string $src, array $deps = [], string $ver = ''): void {}
function wp_enqueue_script(string $handle, string $src, array $deps = [], string $ver = '', bool $in_footer = false): void {}
function language_attributes(): void { echo 'lang="ru"'; }
function bloginfo(string $show): void { echo $show === 'name' ? 'Digital Atlas Inspired' : 'UTF-8'; }
function wp_head(): void {}
function body_class(): void { echo 'class="test-body"'; }
function wp_body_open(): void {}
function wp_nav_menu(array $args = []): void { if (isset($args['fallback_cb']) && is_callable($args['fallback_cb'])) { call_user_func($args['fallback_cb']); } }
function get_header(): void { include __DIR__ . '/../header.php'; }
function get_footer(): void { include __DIR__ . '/../footer.php'; }
function is_active_sidebar(string $id): bool { return false; }
function dynamic_sidebar(string $id): void {}
function have_posts(): bool { static $count = 0; return $count++ === 0; }
function the_post(): void {}
function the_title(): void { echo 'Тестовый заголовок'; }
function the_content(): void { echo '<p>Тестовый контент страницы.</p>'; }
function the_permalink(): void { echo 'https://example.test/post'; }
function get_the_excerpt(): string { return 'Тестовый анонс поста.'; }
function the_posts_pagination(): void {}
function wp_footer(): void {}
function current_user_can(string $capability): bool { return true; }
function check_admin_referer(string $action): bool { return true; }
function add_query_arg(array $params, string $url): string { return $url . '?' . http_build_query($params); }
function admin_url(string $path = ''): string { return 'https://example.test/wp-admin/' . ltrim($path, '/'); }
function wp_safe_redirect(string $url): void {}
function absint($value): int { return abs((int) $value); }
function wp_nonce_field(string $action): void { echo '<input type=\"hidden\" value=\"nonce\">'; }
function add_theme_page(string $pageTitle, string $menuTitle, string $capability, string $menuSlug, string $callback): void {}
function get_page_by_path(string $slug) { return null; }
function wp_update_post(array $postData, bool $wpError = false) { return 0; }
function wp_insert_post(array $postData, bool $wpError = false) { static $id = 100; return $id++; }
function is_wp_error($thing): bool { return false; }
function update_post_meta(int $postId, string $metaKey, string $metaValue): void {}
function wp_get_nav_menu_object(string $name) { return null; }
function wp_create_nav_menu(string $name) { return 10; }
function wp_get_associated_nav_menu_items(int $objectId, string $type): array { return []; }
function wp_update_nav_menu_item(int $menuId, int $menuItemDbId, array $args): void {}
function get_the_title(int $postId): string { return 'Demo'; }
function get_theme_mod(string $name, $default = []) { return $default; }
function set_theme_mod(string $name, $value): void {}
function update_option(string $name, $value): void {}

$themeRoot = realpath(__DIR__ . '/..');
$files = [
    'functions.php',
    'header.php',
    'footer.php',
    'front-page.php',
    'index.php',
    'page.php',
    'page-platform.php',
    'page-solutions.php',
    'page-about.php',
    'page-contact.php',
];

foreach ($files as $file) {
    ob_start();
    include $themeRoot . '/' . $file;
    ob_end_clean();
    echo "[OK] {$file}\n";
}
