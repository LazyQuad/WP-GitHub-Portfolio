<?php
/*
Plugin Name: WP GitHub Portfolio
Plugin URI: https://github.com/lazyquad/wp-github-portfolio
Description: Display your public GitHub repositories on any page using a shortcode. Based on the work of 2kabhishek.
Version: 1.1.0
Author: Deryll Newman
Author URI: https://LazyQuad.com
*/

// Exit if accessed directly
defined('ABSPATH') || exit;

// Enqueue CSS and jQuery script
function wpghp_enqueue_scripts()
{
    wp_enqueue_style('wpghp-style', plugin_dir_url(__FILE__) . 'assets/style.css');
    wp_enqueue_script('jquery');
    wp_enqueue_script('wpghp-script', plugin_dir_url(__FILE__) . 'assets/script.js', array('jquery'), null, true);
}
add_action('wp_enqueue_scripts', 'wpghp_enqueue_scripts');

// Shortcode to display GitHub projects
function wpghp_display_projects($atts)
{
    $atts = shortcode_atts(array(
        'user' => '2kabhishek', // Default user
        'limit' => 10,
        'show_user_info' => 'yes' // Toggle user info
    ), $atts);

    $output = '<div id="github-projects" data-user="' . esc_attr($atts['user']) . '" data-limit="' . esc_attr($atts['limit']) . '" data-show-user-info="' . esc_attr($atts['show_user_info']) . '">
        <p>Loading GitHub projects...</p>
    </div>';
    return $output;
}
add_shortcode('github_projects', 'wpghp_display_projects');
