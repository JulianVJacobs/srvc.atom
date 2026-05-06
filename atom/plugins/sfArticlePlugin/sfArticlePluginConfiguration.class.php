<?php

/**
 * sfArticlePlugin – AtoM-native article workflow plugin.
 *
 * This plugin provides a native PHP/Symfony 1.x AtoM plugin shell for
 * article capture.  It is additive and reversible: disabling the plugin
 * restores the pre-plugin AtoM state without data loss.
 *
 * Owned surface (lane [1.1.0][01-native-shell-contract]):
 *   - Plugin configuration and route registration baseline.
 *   - Module scaffold (actions + templates) for downstream lanes to extend.
 *   - Persistence/linking contract reference (see docs/persistence-linking-contract-1.1.0.md).
 *
 * @package sfArticlePlugin
 */
class sfArticlePluginConfiguration extends sfPluginConfiguration
{
    const VERSION = '1.1.0';

    /**
     * Initialise the plugin.
     *
     * Called by Symfony's plugin system at application boot time.
     * Registers event listeners required by the plugin shell.
     */
    public function initialize()
    {
        // Register the article module so AtoM can resolve its routes.
        $this->enableModule('sfArticle');
    }

    /**
     * Return the plugin version string.
     *
     * @return string
     */
    public static function getVersion()
    {
        return self::VERSION;
    }
}
