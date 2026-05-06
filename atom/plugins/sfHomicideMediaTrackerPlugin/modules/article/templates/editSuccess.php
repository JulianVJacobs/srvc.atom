<?php
/**
 * Edit article — success template.
 *
 * Wraps the shared _form.php partial inside the standard AtoM page layout.
 * The action (articleActions::executeEdit) sets:
 *   $form    (ArticleEditForm)   — form pre-populated with existing article data
 *   $article (QubitHmtArticle)  — loaded article record
 *   $title   (string)           — 'Edit article'
 */
?>
<?php slot('title') ?>
  <h1 id="site-heading">
    <span><?php echo __('Edit article') ?></span>
    <?php if (!empty($article->title)): ?>
      <span class="site-heading-label">
        <?php echo esc_specialchars($article->title) ?>
      </span>
    <?php endif ?>
  </h1>
<?php end_slot() ?>

<?php slot('content') ?>

  <div id="content">

    <nav id="object-nav">
      <ul>
        <li class="active">
          <a href="<?php echo url_for('@hmt_article?id=' . $article->id) ?>">
            <?php echo __('Article') ?>
          </a>
        </li>
        <li>
          <a href="<?php echo url_for('@hmt_article_new') ?>">
            <?php echo __('Add article') ?>
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
