<?php

/**
 * sfHmtArticlePlugin
 *
 * AtoM-native article workflow plugin for the Homicide Media Tracker.
 * Provides article create/edit surfaces as native AtoM screens.
 *
 * Scaffold baseline for lane [1.0.0][01-native-shell-contract].
 * Add-menu wiring is owned by lane [1.0.0][02-add-menu-route].
 * Form surface implementation is owned by lane [1.0.0][03-native-form-surface].
 */
class sfHmtArticlePlugin extends sfPlugin
{
    /**
     * Called by Symfony when the plugin is initialized.
     *
     * Registers any event listeners that must be wired at bootstrap time.
     * Downstream lanes add menu-entry and form listeners here.
     */
    public static function registerListeners()
    {
        // Baseline: no listeners required at scaffold stage.
        // Lane 02 will add the Add-menu listener.
        // Lane 03 will add any form-lifecycle listeners.
    }
}
