<?php

/**
 * Article module actions.
 *
 * Handles create, edit, save (on POST), update (on POST), and delete for
 * plugin-owned article records stored in hmt_article.
 *
 * Routing contract (config/routing.yml):
 *  GET  /hmt/article/new      → executeCreate   (renders create form)
 *  POST /hmt/article/new      → executeCreate   (processes create submission)
 *  GET  /hmt/article/:id      → executeEdit     (renders edit form)
 *  POST /hmt/article/:id      → executeEdit     (processes edit submission)
 *  POST /hmt/article/:id/delete → executeDelete (hard-deletes the record)
 *
 * Flash behavior (AtoM convention):
 *  Success: $this->getUser()->setFlash('notice', '...')  → green banner
 *  Failure: $this->getUser()->setFlash('error',  '...')  → red banner
 *  Validation errors are rendered inline; no flash for field-level errors.
 *
 * Fallback coexistence: hosted fallback routes are not touched here;
 * this module is additive and purely plugin-owned.
 */
class articleActions extends sfActions
{
    const FORM_RETRY_FLASH_KEY = 'hmt_article_form_values';

    /**
     * Pre-filter: ensure the hmt_article table exists before any action runs.
     */
    public function preExecute()
    {
        QubitHmtArticle::ensureTable();
    }

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    /**
     * Display a blank article creation form (GET), or process its submission (POST).
     */
    public function executeCreate(sfWebRequest $request)
    {
        $this->form    = new ArticleEditForm();
        $this->article = new QubitHmtArticle();
        $this->title   = 'Add article';

        if ($request->isMethod('post')) {
            $values = $request->getParameter('article', []);
            $this->form->bind($values);

            if ($this->form->isValid()) {
                $this->form->applyToArticle($this->article);

                try {
                    $this->article->insert();
                    $this->getUser()->setFlash('notice', 'Article created successfully.');

                    return $this->redirect($this->generateUrl('hmt_article', ['id' => $this->article->id]));
                } catch (QubitHmtArticleLinkageException $e) {
                    sfContext::getInstance()->getLogger()->err(
                        sprintf('[sfHomicideMediaTrackerPlugin] article create linkage validation failed: %s', json_encode($e->getDiagnostics()))
                    );
                    $this->getUser()->setFlash('error', $e->getMessage());
                } catch (Exception $e) {
                    sfContext::getInstance()->getLogger()->err(
                        sprintf('[sfHomicideMediaTrackerPlugin] article create failed: %s', $e->getMessage())
                    );
                    $this->storeFormRetryValues($values);
                    $this->getUser()->setFlash('error', 'Could not save the article. Please try again.');

                    return $this->redirect($this->generateUrl('hmt_article_new'));
                }
            } else {
                $this->getUser()->setFlash('error', 'Please review the highlighted fields and try again.');
            }
        }

        // PRG recovery: when persistence fails we redirect back to GET/new and
        // rehydrate user-entered defaults from flash for deterministic retry.
        $this->restoreFormRetryValues($this->form);
        $this->setTemplate('create');
    }

    // -------------------------------------------------------------------------
    // EDIT
    // -------------------------------------------------------------------------

    /**
     * Display an article edit form pre-filled with existing data (GET),
     * or process its submission (POST).
     */
    public function executeEdit(sfWebRequest $request)
    {
        $id = $request->getParameter('id');

        $this->article = QubitHmtArticle::getById($id);

        if (null === $this->article) {
            $this->getUser()->setFlash('error', 'Article not found.');

            return $this->redirect('@hmt_article_new');
        }

        $this->form  = new ArticleEditForm();
        $this->title = 'Edit article';

        if ($request->isMethod('post')) {
            $values = $request->getParameter('article', []);
            $this->form->bind($values);

            if ($this->form->isValid()) {
                $this->form->applyToArticle($this->article);

                try {
                    $this->article->update();
                    $this->getUser()->setFlash('notice', 'Article updated successfully.');

                    return $this->redirect($this->generateUrl('hmt_article', ['id' => $this->article->id]));
                } catch (QubitHmtArticleLinkageException $e) {
                    sfContext::getInstance()->getLogger()->err(
                        sprintf(
                            '[sfHomicideMediaTrackerPlugin] article update linkage validation failed (id=%s): %s',
                            $this->article->id,
                            json_encode($e->getDiagnostics())
                        )
                    );
                    $this->getUser()->setFlash('error', $e->getMessage());
                } catch (Exception $e) {
                    sfContext::getInstance()->getLogger()->err(
                        sprintf('[sfHomicideMediaTrackerPlugin] article update failed (id=%s): %s', $this->article->id, $e->getMessage())
                    );
                    $this->storeFormRetryValues($values);
                    $this->getUser()->setFlash('error', 'Could not update the article. Please try again.');

                    return $this->redirect($this->generateUrl('hmt_article', ['id' => $this->article->id]));
                }
            } else {
                $this->getUser()->setFlash('error', 'Please review the highlighted fields and try again.');
            }
        } else {
            // GET: populate form defaults from the existing record
            $this->form->populateFromArticle($this->article);
        }

        // PRG recovery: when persistence fails we redirect back to GET/edit and
        // rehydrate user-entered defaults from flash for deterministic retry.
        $this->restoreFormRetryValues($this->form);
        $this->setTemplate('edit');
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    /**
     * Hard-delete an article record (POST only; CSRF token checked by caller).
     */
    public function executeDelete(sfWebRequest $request)
    {
        $this->forward404Unless($request->isMethod('post'), 'Delete requires POST.');

        $id      = $request->getParameter('id');
        $article = QubitHmtArticle::getById($id);

        if (null === $article) {
            $this->getUser()->setFlash('error', 'Article not found.');
        } else {
            try {
                QubitHmtArticle::deleteById($id);
                $this->getUser()->setFlash('notice', 'Article deleted.');
            } catch (Exception $e) {
                sfContext::getInstance()->getLogger()->err(
                    sprintf('[sfHomicideMediaTrackerPlugin] article delete failed (id=%s): %s', $id, $e->getMessage())
                );
                $this->getUser()->setFlash('error', 'Could not delete the article. Please try again.');
            }
        }

        return $this->redirect('@hmt_article_new');
    }

    private function storeFormRetryValues(array $values)
    {
        $allowedKeys = array_keys((new ArticleEditForm())->getWidgetSchema()->getFields());
        $stored      = [];

        foreach ($allowedKeys as $key) {
            if (!array_key_exists($key, $values)) {
                continue;
            }

            if (null === $values[$key] || is_scalar($values[$key])) {
                $stored[$key] = $values[$key];
            }
        }

        $this->getUser()->setFlash(self::FORM_RETRY_FLASH_KEY, $stored);
    }

    private function restoreFormRetryValues(ArticleEditForm $form)
    {
        if ($form->isBound()) {
            return;
        }

        if (!$this->getUser()->hasFlash(self::FORM_RETRY_FLASH_KEY)) {
            return;
        }

        $values = $this->getUser()->getFlash(self::FORM_RETRY_FLASH_KEY);
        if (!is_array($values)) {
            return;
        }

        $form->setDefaults($values);
    }
}
