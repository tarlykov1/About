<?php

if (!defined('ABSPATH')) {
    exit;
}

function dai_demo_pages_map(): array
{
    return [
        'home' => [
            'title' => 'GeoVision Atlas',
            'slug' => 'geovision-atlas',
            'template' => 'default',
            'content' => "<!-- wp:paragraph -->\n<p>Демо-главная для геопортала: измененный контент, уникальный для вашего проекта.</p>\n<!-- /wp:paragraph -->",
        ],
        'platform' => [
            'title' => 'Atlas Platform',
            'slug' => 'platform',
            'template' => 'page-platform.php',
            'content' => "<!-- wp:paragraph -->\n<p>Демо-раздел платформы с уникальными текстами и структурой под отраслевой geospatial SaaS.</p>\n<!-- /wp:paragraph -->",
        ],
        'solutions' => [
            'title' => 'Industry Solutions',
            'slug' => 'solutions',
            'template' => 'page-solutions.php',
            'content' => "<!-- wp:list -->\n<ul><li>Госуправление</li><li>Логистика</li><li>Экология</li><li>Недвижимость</li></ul>\n<!-- /wp:list -->",
        ],
        'about' => [
            'title' => 'About Atlas Team',
            'slug' => 'about',
            'template' => 'page-about.php',
            'content' => "<!-- wp:paragraph -->\n<p>Уникальный демо-контент о команде и миссии проекта.</p>\n<!-- /wp:paragraph -->",
        ],
        'contact' => [
            'title' => 'Contact Demo',
            'slug' => 'contact',
            'template' => 'page-contact.php',
            'content' => "<!-- wp:paragraph -->\n<p>Демо-контакты: hello@example.test</p>\n<!-- /wp:paragraph -->",
        ],
    ];
}

function dai_upsert_page(array $pageConfig): int
{
    $existing = get_page_by_path($pageConfig['slug']);

    $postData = [
        'post_title' => $pageConfig['title'],
        'post_name' => $pageConfig['slug'],
        'post_content' => $pageConfig['content'],
        'post_status' => 'publish',
        'post_type' => 'page',
    ];

    if ($existing && isset($existing->ID)) {
        $postData['ID'] = $existing->ID;
        $pageId = wp_update_post($postData, true);
    } else {
        $pageId = wp_insert_post($postData, true);
    }

    if (is_wp_error($pageId)) {
        return 0;
    }

    if ($pageConfig['template'] !== 'default') {
        update_post_meta($pageId, '_wp_page_template', $pageConfig['template']);
    }

    return (int) $pageId;
}

function dai_create_demo_menu(array $pageIds): void
{
    $menuName = 'Primary Demo Menu';
    $menu = wp_get_nav_menu_object($menuName);

    if (!$menu) {
        $menuId = wp_create_nav_menu($menuName);
    } else {
        $menuId = $menu->term_id;
    }

    if (!$menuId || is_wp_error($menuId)) {
        return;
    }

    foreach ($pageIds as $pageId) {
        if (!$pageId) {
            continue;
        }

        if (function_exists('wp_get_associated_nav_menu_items')) {
            $alreadyInMenu = wp_get_associated_nav_menu_items($pageId, 'post_type');
            if (!empty($alreadyInMenu)) {
                continue;
            }
        }

        wp_update_nav_menu_item(
            $menuId,
            0,
            [
                'menu-item-title' => get_the_title($pageId),
                'menu-item-object' => 'page',
                'menu-item-object-id' => $pageId,
                'menu-item-type' => 'post_type',
                'menu-item-status' => 'publish',
            ]
        );
    }

    $locations = get_theme_mod('nav_menu_locations', []);
    $locations['primary'] = (int) $menuId;
    $locations['footer'] = (int) $menuId;
    set_theme_mod('nav_menu_locations', $locations);
}

function dai_install_demo_content(): array
{
    $pages = dai_demo_pages_map();
    $pageIds = [];

    foreach ($pages as $key => $config) {
        $pageIds[$key] = dai_upsert_page($config);
    }

    if (!empty($pageIds['home'])) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $pageIds['home']);
    }

    dai_create_demo_menu($pageIds);

    return $pageIds;
}

function dai_demo_installer_handle(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    check_admin_referer('dai_install_demo_data');

    $pageIds = dai_install_demo_content();
    $created = count(array_filter($pageIds));

    $redirectUrl = add_query_arg(
        [
            'page' => 'dai-demo-installer',
            'dai_demo_installed' => $created,
        ],
        admin_url('themes.php')
    );

    wp_safe_redirect($redirectUrl);
    exit;
}
add_action('admin_post_dai_install_demo', 'dai_demo_installer_handle');

function dai_demo_installer_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $created = isset($_GET['dai_demo_installed']) ? absint($_GET['dai_demo_installed']) : 0;
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Digital Atlas Demo Installer', 'digitalatlas-inspired'); ?></h1>
        <p><?php esc_html_e('Установщик создаёт демо-страницы, меню и назначает главную страницу. Контент стилистически похож на geospatial-портал, но тексты и названия изменены.', 'digitalatlas-inspired'); ?></p>

        <?php if ($created > 0) : ?>
            <div class="notice notice-success"><p><?php echo esc_html(sprintf(__('Demo data installed/updated: %d pages.', 'digitalatlas-inspired'), $created)); ?></p></div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('dai_install_demo_data'); ?>
            <input type="hidden" name="action" value="dai_install_demo">
            <p>
                <button class="button button-primary" type="submit"><?php esc_html_e('Install demo data', 'digitalatlas-inspired'); ?></button>
            </p>
        </form>
    </div>
    <?php
}

function dai_register_demo_installer_menu(): void
{
    add_theme_page(
        __('Demo Installer', 'digitalatlas-inspired'),
        __('Demo Installer', 'digitalatlas-inspired'),
        'manage_options',
        'dai-demo-installer',
        'dai_demo_installer_page'
    );
}
add_action('admin_menu', 'dai_register_demo_installer_menu');
