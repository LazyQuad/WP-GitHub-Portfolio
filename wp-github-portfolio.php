<?php
/*
Plugin Name: WP GitHub Portfolio
Plugin URI: https://github.com/LazyQuad/wp-github-portfolio
Description: Display your public GitHub repositories with layout, sorting, and pinned repo support.
Version: 1.5.5
Author: Deryll Newman
Author URI: https://github.com/LazyQuad
*/

defined('ABSPATH') || exit;

function wpghp_enqueue_scripts() {
    wp_enqueue_style('wpghp-style', plugin_dir_url(__FILE__) . 'assets/style.css');
    wp_enqueue_script('jquery');
    wp_enqueue_script('wpghp-script', plugin_dir_url(__FILE__) . 'assets/script.js', array('jquery'), null, true);
    wp_localize_script('wpghp-script', 'wpghp_vars', array('assets_url' => plugin_dir_url(__FILE__) . 'assets/'));
}
add_action('wp_enqueue_scripts', 'wpghp_enqueue_scripts');

function wpghp_display_projects($atts) {
    $atts = shortcode_atts(array(
        'user' => '2kabhishek',
        'limit' => 10,
        'mode' => 'vertical',
        'sort' => 'updated',
        'pinned' => ''
    ), $atts);

    return '<div id="github-projects"
        class="github-portfolio"
        data-user="' . esc_attr($atts['user']) . '"
        data-limit="' . esc_attr($atts['limit']) . '"
        data-mode="' . esc_attr($atts['mode']) . '"
        data-sort="' . esc_attr($atts['sort']) . '"
        data-pinned="' . esc_attr($atts['pinned']) . '">
    </div>';
}
add_shortcode('github_projects', 'wpghp_display_projects');