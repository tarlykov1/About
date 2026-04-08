<?php get_header(); ?>
<section class="section">
    <div class="container">
        <h1><?php esc_html_e('News & updates', 'digitalatlas-inspired'); ?></h1>
        <?php if (have_posts()) : ?>
            <div class="grid grid--2">
                <?php while (have_posts()) : the_post(); ?>
                    <article class="card">
                        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <p><?php echo esc_html(get_the_excerpt()); ?></p>
                    </article>
                <?php endwhile; ?>
            </div>
            <?php the_posts_pagination(); ?>
        <?php else : ?>
            <p><?php esc_html_e('No posts found.', 'digitalatlas-inspired'); ?></p>
        <?php endif; ?>
    </div>
</section>
<?php get_footer(); ?>
