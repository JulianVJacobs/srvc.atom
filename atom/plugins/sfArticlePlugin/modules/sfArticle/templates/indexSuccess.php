<?php

/**
 * sfArticle module – article list template (indexSuccess).
 *
 * Baseline scaffold template.  Full AtoM-conformant rendering is owned by
 * lane [1.1.0][02-php-template-bridge].
 *
 * Lane: [1.1.0][01-native-shell-contract]
 */

?>
<?php slot('title') ?>
  <?php echo __('Articles') ?>
<?php end_slot() ?>

<h1><?php echo __('Articles') ?></h1>

<?php if ($sf_user->hasFlash('notice')): ?>
  <div class="messages status">
    <?php echo $sf_user->getFlash('notice') ?>
  </div>
<?php endif; ?>

<div class="section">
  <p>
    <?php echo link_to(__('Add article'), '@sfArticleCreate', array('class' => 'button')) ?>
  </p>

  <?php if (0 === $total): ?>
    <p><?php echo __('No articles found.') ?></p>
  <?php else: ?>
    <table>
      <thead>
        <tr>
          <th><?php echo __('Title') ?></th>
          <th><?php echo __('Actions') ?></th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($articles as $article): ?>
          <tr>
            <td><?php echo isset($article['title']) ? esc_specialchars($article['title']) : '' ?></td>
            <td>
              <?php echo link_to(__('Edit'), '@sfArticleEdit?id=' . $article['id']) ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  <?php endif; ?>
</div>
