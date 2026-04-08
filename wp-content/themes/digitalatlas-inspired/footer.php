<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
</main>
<footer class="site-footer">
    <div class="container site-footer__inner">
        <div>
            <strong><?php bloginfo('name'); ?></strong>
            <p><?php esc_html_e('Geospatial intelligence for public and private teams.', 'digitalatlas-inspired'); ?></p>
        </div>
        <nav aria-label="Footer">
            <?php
            wp_nav_menu([
                'theme_location' => 'footer',
                'container' => false,
                'menu_class' => 'footer-nav',
                'fallback_cb' => false,
            ]);
            ?>
        </nav>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
