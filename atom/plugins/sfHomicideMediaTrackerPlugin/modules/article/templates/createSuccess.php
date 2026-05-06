<?php
/**
 * Create article — success template.
 *
 * Wraps the shared _form.php partial inside the standard AtoM page layout.
 * The action (articleActions::executeCreate) sets:
 *   $form    (ArticleEditForm)   — unbound form instance
 *   $article (QubitHmtArticle)  — empty article for the partial
 *   $title   (string)           — 'Add article'
 */
?>
<?php slot('title') ?>
  <h1 id="site-heading">
    <span><?php echo __('Add article') ?></span>
  </h1>
<?php end_slot() ?>

<?php slot('content') ?>

  <div id="content">

    <nav id="object-nav">
      <ul>
        <li class="active">
          <a href="<?php echo url_for('@hmt_article_new') ?>">
            <?php echo __('Article') ?>
          </a>
        </li>
      </ul>
    </nav>

    <div id="main-column">
      <?php include_partial('article/form', [
        'form'    => $form,
        'article' => $article,
        'title'   => $title,
      ]) ?>
    </div>

  </div>

<?php end_slot() ?>
