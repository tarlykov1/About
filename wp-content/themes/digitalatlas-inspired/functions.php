<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/inc/demo-installer.php';

function dai_setup_theme(): void
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');

    register_nav_menus([
        'primary' => __('Primary Menu', 'digitalatlas-inspired'),
        'footer' => __('Footer Menu', 'digitalatlas-inspired'),
    ]);
}
add_action('after_setup_theme', 'dai_setup_theme');

function dai_enqueue_assets(): void
{
    $theme = wp_get_theme();
    $version = $theme->get('Version') ?: '1.0.0';

    wp_enqueue_style(
        'dai-main',
        get_template_directory_uri() . '/assets/css/main.css',
        [],
        $version
    );

    wp_enqueue_script(
        'dai-main',
        get_template_directory_uri() . '/assets/js/main.js',
        [],
        $version,
        true
    );
}
add_action('wp_enqueue_scripts', 'dai_enqueue_assets');

function dai_register_sidebar(): void
{
    register_sidebar([
        'name' => __('Primary Sidebar', 'digitalatlas-inspired'),
        'id' => 'primary-sidebar',
        'description' => __('Sidebar on standard pages.', 'digitalatlas-inspired'),
        'before_widget' => '<section class="widget">',
        'after_widget' => '</section>',
        'before_title' => '<h3 class="widget__title">',
        'after_title' => '</h3>',
    ]);
}
add_action('widgets_init', 'dai_register_sidebar');

function dai_fallback_menu(): void
{
    echo '<ul class="main-nav__list">';
    echo '<li><a href="' . esc_url(home_url('/')) . '">' . esc_html__('Home', 'digitalatlas-inspired') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/platform')) . '">' . esc_html__('Platform', 'digitalatlas-inspired') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/solutions')) . '">' . esc_html__('Solutions', 'digitalatlas-inspired') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/about')) . '">' . esc_html__('About', 'digitalatlas-inspired') . '</a></li>';
    echo '<li><a href="' . esc_url(home_url('/contact')) . '">' . esc_html__('Contact', 'digitalatlas-inspired') . '</a></li>';
    echo '</ul>';
}
