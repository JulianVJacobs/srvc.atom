<?php

/**
 * sfArticle module actions.
 *
 * This file is the baseline action class for the sfArticle module.
 * Each action stub is intentionally minimal: downstream lanes
 * ([1.1.0][02-php-template-bridge] and [1.1.0][03-persistence-migration])
 * own the rendering and persistence logic respectively.
 *
 * Owned surface: lane [1.1.0][01-native-shell-contract].
 * Do NOT patch AtoM core actions or templates from this file.
 *
 * @package    sfArticlePlugin
 * @subpackage sfArticle
 */
class sfArticleActions extends sfActions
{
    /**
     * Display a paginated list of article records.
     *
     * @param sfWebRequest $request
     */
    public function executeIndex(sfWebRequest $request)
    {
        $this->pageSize = sfConfig::get(
            'app_sfArticlePlugin_list_page_size',
            20
        );
        $this->page = max(1, (int) $request->getParameter('page', 1));

        // Persistence layer wired by lane [1.1.0][03-persistence-migration].
        $this->articles = array();
        $this->total    = 0;
    }

    /**
     * Render the article creation form (GET) or process a submission (POST).
     *
     * @param sfWebRequest $request
     */
    public function executeCreate(sfWebRequest $request)
    {
        // Form class wired by lane [1.1.0][02-php-template-bridge].
        if ($request->isMethod(sfRequest::POST)) {
            // Write path wired by lane [1.1.0][03-persistence-migration].
            $this->getUser()->setFlash(
                'notice',
                'Article creation is not yet wired (pending lane 03).'
            );
            $this->redirect('@sfArticleIndex');
        }
    }

    /**
     * Render the article edit form (GET) or process an update (POST).
     *
     * @param sfWebRequest $request
     */
    public function executeEdit(sfWebRequest $request)
    {
        $this->articleId = (int) $request->getParameter('id');

        if ($request->isMethod(sfRequest::POST)) {
            // Write path wired by lane [1.1.0][03-persistence-migration].
            $this->getUser()->setFlash(
                'notice',
                'Article update is not yet wired (pending lane 03).'
            );
            $this->redirect('@sfArticleShow?id=' . $this->articleId);
        }
    }

    /**
     * Display a single article record.
     *
     * @param sfWebRequest $request
     */
    public function executeShow(sfWebRequest $request)
    {
        $this->articleId = (int) $request->getParameter('id');

        // Persistence layer wired by lane [1.1.0][03-persistence-migration].
        // TODO(lane-03): replace null stub with a real repository lookup; a
        // missing record should call $this->forward404().
        $this->article = null;
    }
}
