<?php
/**
 * Article form partial — used by both createSuccess.php and editSuccess.php.
 *
 * Variables available:
 *  $form    (ArticleEditForm)    — bound or unbound form instance
 *  $article (QubitHmtArticle)   — the article being created or edited
 *  $title   (string)            — page sub-heading ('Add article' | 'Edit article')
 *
 * AtoM template conventions followed:
 *  - <section> blocks mirror AtoM's collapsible fieldset sections
 *  - <dl>/<dt>/<dd> for label/control rows
 *  - Inline error rendering via renderError()
 *  - Help text in <div class="description"> adjacent to each field
 */
?>

<?php if ($sf_user->hasFlash('notice')): ?>
  <div class="messages status">
    <?php echo $sf_user->getFlash('notice') ?>
  </div>
<?php endif ?>

<?php if ($sf_user->hasFlash('error')): ?>
  <div class="messages error">
    <?php echo $sf_user->getFlash('error') ?>
  </div>
<?php endif ?>

<?php echo $form->renderGlobalErrors() ?>

<?php $isEdit = isset($article->id) && $article->id !== null ?>
<form
  action="<?php echo $isEdit ? url_for('@hmt_article?id=' . $article->id) : url_for('@hmt_article_new') ?>"
  method="post"
>

  <?php echo $form->renderHiddenFields() ?>

  <!-- ===================================================================== -->
  <!-- Section: Identification                                                -->
  <!-- ===================================================================== -->
  <section id="articleIdentification">
    <h3 data-toggle="collapse">
      <?php echo __('Identification') ?>
    </h3>

    <div class="accordion-inner collapse in" id="collapseIdentification">
      <dl>
        <dt>
          <?php echo $form['title']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['title']->renderError() ?>
          <?php echo $form['title']->render() ?>
          <div class="description">
            <?php echo __('Headline or title of the news article.') ?>
          </div>
        </dd>

        <dt>
          <?php echo $form['source']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['source']->renderError() ?>
          <?php echo $form['source']->render() ?>
          <div class="description">
            <?php echo __('Name of the publication or news outlet (e.g. Daily Maverick).') ?>
          </div>
        </dd>

        <dt>
          <?php echo $form['publication_date']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['publication_date']->renderError() ?>
          <?php echo $form['publication_date']->render() ?>
          <div class="description">
            <?php echo __('Date the article was first published. Use YYYY-MM-DD format.') ?>
          </div>
        </dd>
      </dl>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- Section: Access points                                                 -->
  <!-- ===================================================================== -->
  <section id="articleAccessPoints">
    <h3 data-toggle="collapse">
      <?php echo __('Access points') ?>
    </h3>

    <div class="accordion-inner collapse in" id="collapseAccessPoints">
      <dl>
        <dt>
          <?php echo $form['url']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['url']->renderError() ?>
          <?php echo $form['url']->render() ?>
          <div class="description">
            <?php echo __('Full URL of the original online article, if available.') ?>
          </div>
        </dd>
      </dl>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- Section: Description                                                   -->
  <!-- ===================================================================== -->
  <section id="articleDescription">
    <h3 data-toggle="collapse">
      <?php echo __('Description') ?>
    </h3>

    <div class="accordion-inner collapse in" id="collapseDescription">
      <dl>
        <dt>
          <?php echo $form['summary']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['summary']->renderError() ?>
          <?php echo $form['summary']->render() ?>
          <div class="description">
            <?php echo __('Brief summary of the article content.') ?>
          </div>
        </dd>
      </dl>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- Section: Administration                                                -->
  <!-- ===================================================================== -->
  <section id="articleAdministration">
    <h3 data-toggle="collapse">
      <?php echo __('Administration') ?>
    </h3>

    <div class="accordion-inner collapse in" id="collapseAdministration">
      <dl>
        <dt>
          <?php echo $form['status']->renderLabel() ?>
        </dt>
        <dd>
          <?php echo $form['status']->renderError() ?>
          <?php echo $form['status']->render() ?>
          <div class="description">
            <?php echo __('Publication readiness of this article record.') ?>
          </div>
        </dd>
      </dl>
    </div>
  </section>

  <!-- ===================================================================== -->
  <!-- Submit bar                                                             -->
  <!-- ===================================================================== -->
  <div class="form-actions">
    <button class="c-btn c-btn-submit" type="submit" name="save">
      <?php echo __('Save') ?>
    </button>

    <?php if ($isEdit): ?>
      <span class="form-actions-separator">&#124;</span>
      <a
        class="c-btn c-btn-delete delete-article"
        href="<?php echo url_for('@hmt_article_delete?id=' . $article->id) ?>"
        data-confirm="<?php echo __('Are you sure you want to delete this article?') ?>"
      >
        <?php echo __('Delete') ?>
      </a>
    <?php endif ?>

    <span class="form-actions-separator">&#124;</span>
    <a class="c-btn" href="<?php echo url_for('@hmt_article_new') ?>">
      <?php echo __('Cancel') ?>
    </a>
  </div>

</form>

<script>
  // Submit delete via POST with CSRF-safe hidden form (AtoM pattern)
  document.addEventListener('DOMContentLoaded', function () {
    var deleteLinks = document.querySelectorAll('.delete-article');

    deleteLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        if (!window.confirm(link.getAttribute('data-confirm'))) {
          return;
        }

        var form = document.createElement('form');
        form.method = 'post';
        form.action = link.href;

        // CSRF token (AtoM pattern: hidden field matching the main form token)
        var csrf = document.querySelector('input[name="_csrf_token"]');
        if (csrf) {
          var token = document.createElement('input');
          token.type = 'hidden';
          token.name = '_csrf_token';
          token.value = csrf.value;
          form.appendChild(token);
        }

        document.body.appendChild(form);
        form.submit();
      });
    });
  });
</script>
