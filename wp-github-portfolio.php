<?php
/*
Plugin Name: WP GitHub Portfolio
Plugin URI: https://github.com/LazyQuad/wp-github-portfolio
Description: Display your public GitHub repositories on any page using a shortcode. Based on the work of 2kabhishek.
Version: 1.2.1
Author: Deryll Newman
Author URI: https://github.com/LazyQuad
*/

// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

// Enqueue CSS and jQuery script
function wpghp_enqueue_scripts() {
    wp_enqueue_style( 'wpghp-style', plugin_dir_url( __FILE__ ) . 'assets/style.css' );
    wp_enqueue_script( 'jquery' );
    wp_enqueue_script( 'wpghp-script', plugin_dir_url( __FILE__ ) . 'assets/script.js', array( 'jquery' ), null, true );
}
add_action( 'wp_enqueue_scripts', 'wpghp_enqueue_scripts' );

// Fetch cached GitHub data using WordPress transients
function wpghp_get_github_data( $endpoint, $username ) {
    $transient_key = 'wpghp_' . md5( $endpoint . '_' . $username );
    $cached = get_transient( $transient_key );

    if ( false === $cached ) {
        $response = wp_remote_get( "https://api.github.com/users/{$username}/{$endpoint}" );

        if ( is_wp_error( $response ) ) {
            return [];
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( is_array( $data ) ) {
            set_transient( $transient_key, $data, HOUR_IN_SECONDS );
        }

        return $data;
    }

    return $cached;
}

// Shortcode to display GitHub projects
function wpghp_display_projects( $atts ) {
    $atts = shortcode_atts( array(
        'user' => '2kabhishek', // Default user
        'limit' => 10,
        'show_user_info' => 'yes' // Toggle user info
    ), $atts );

    // Inject cached data as JSON in the DOM
    $repos = wpghp_get_github_data( 'repos', $atts['user'] );
    $profile = wpghp_get_github_data( '', $atts['user'] );

    $output = '<div id="github-projects" 
        data-user="' . esc_attr( $atts['user'] ) . '" 
        data-limit="' . esc_attr( $atts['limit'] ) . '" 
        data-show-user-info="' . esc_attr( $atts['show_user_info'] ) . '" 
        data-profile='' . json_encode( $profile ) . '' 
        data-repos='' . json_encode( $repos ) . ''>
        <p>Loading GitHub projects...</p>
    </div>';

    return $output;
}
add_shortcode( 'github_projects', 'wpghp_display_projects' );
