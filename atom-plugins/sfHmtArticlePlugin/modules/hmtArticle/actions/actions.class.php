<?php

/**
 * hmtArticle module actions.
 *
 * Scaffold stubs for lane [1.0.0][01-native-shell-contract].
 * Full form implementation is owned by lane [1.0.0][03-native-form-surface].
 */
class hmtArticleActions extends sfActions
{
    /**
     * Article list / landing page.
     *
     * Requires an authenticated AtoM session; unauthenticated requests are
     * redirected to the login page by the AtoM security filter.
     */
    public function executeIndex(sfWebRequest $request)
    {
        $this->forward404Unless($this->context->getUser()->isAuthenticated());

        // Scaffold placeholder — lane 03 replaces this with real query logic.
        $this->articles = [];
    }

    /**
     * Article create screen stub.
     *
     * Lane 03 replaces this body with the full form class, validation, and
     * submit handling.  Route and action name are stable from this lane onward.
     */
    public function executeCreate(sfWebRequest $request)
    {
        $this->forward404Unless($this->context->getUser()->isAuthenticated());

        // Scaffold placeholder.
    }

    /**
     * Article edit screen stub.
     *
     * Lane 03 replaces this body with the full form class, record lookup,
     * validation, and submit handling.
     */
    public function executeEdit(sfWebRequest $request)
    {
        $this->forward404Unless($this->context->getUser()->isAuthenticated());

        $this->id = $request->getParameter('id');
        // Scaffold placeholder.
    }
}
