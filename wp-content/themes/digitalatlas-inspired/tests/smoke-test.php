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
