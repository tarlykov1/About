<?php
/* Template Name: Contact */
get_header();
?>
<section class="section">
    <div class="container">
        <p class="eyebrow">Contact</p>
        <h1>Связаться с командой</h1>
        <form class="contact-form" method="post" action="#">
            <label>Имя<input type="text" name="name" required></label>
            <label>Email<input type="email" name="email" required></label>
            <label>Компания<input type="text" name="company"></label>
            <label>Сообщение<textarea name="message" rows="5" required></textarea></label>
            <button class="btn btn--primary" type="submit">Отправить</button>
        </form>
    </div>
</section>
<?php get_footer(); ?>
