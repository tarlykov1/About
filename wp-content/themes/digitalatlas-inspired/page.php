<?php get_header(); ?>
<section class="section">
    <div class="container page-layout">
        <article class="content">
            <?php
            while (have_posts()) :
                the_post();
                ?>
                <h1><?php the_title(); ?></h1>
                <div class="content-body"><?php the_content(); ?></div>
            <?php endwhile; ?>
        </article>

        <?php if (is_active_sidebar('primary-sidebar')) : ?>
            <aside class="sidebar"><?php dynamic_sidebar('primary-sidebar'); ?></aside>
        <?php endif; ?>
    </div>
</section>
<?php get_footer(); ?>
