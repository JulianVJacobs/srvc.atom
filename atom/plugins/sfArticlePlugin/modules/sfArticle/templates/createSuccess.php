<?php

/**
 * sfArticle module – article create template (createSuccess).
 *
 * Baseline scaffold template.  Full AtoM-conformant form rendering is owned
 * by lane [1.1.0][02-php-template-bridge].
 *
 * Lane: [1.1.0][01-native-shell-contract]
 */

?>
<?php slot('title') ?>
  <?php echo __('Add article') ?>
<?php end_slot() ?>

<h1><?php echo __('Add article') ?></h1>

<div class="section">
  <p class="alert alert-info">
    <?php echo __('Article form is pending lane [1.1.0][02-php-template-bridge].') ?>
  </p>

  <p>
    <?php echo link_to(__('Back to articles'), '@sfArticleIndex') ?>
  </p>
</div>
