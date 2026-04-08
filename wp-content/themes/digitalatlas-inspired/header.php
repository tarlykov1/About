<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
    <div class="container site-header__inner">
        <a class="brand" href="<?php echo esc_url(home_url('/')); ?>">
            <span class="brand__dot"></span>
            <span class="brand__name"><?php bloginfo('name'); ?></span>
        </a>

        <button class="menu-toggle" aria-expanded="false" aria-controls="primary-menu">
            <?php esc_html_e('Menu', 'digitalatlas-inspired'); ?>
        </button>

        <nav class="main-nav" id="primary-menu" aria-label="Primary">
            <?php
            wp_nav_menu([
                'theme_location' => 'primary',
                'container' => false,
                'menu_class' => 'main-nav__list',
                'fallback_cb' => 'dai_fallback_menu',
            ]);
            ?>
        </nav>
    </div>
</header>
<main class="site-main">
