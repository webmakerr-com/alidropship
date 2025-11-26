<?php
/**
 * Compatibility shims for running the theme without the AliDropship plugin.
 *
 * The original theme expects a number of constants, helper functions, classes,
 * shortcodes and AJAX callbacks provided by the plugin. When the plugin is not
 * installed we mirror just enough behaviour for the templates to operate
 * without fatal errors and to render sensible default output.
 */

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
if ( ! defined( 'ADS_URL' ) ) {
    define( 'ADS_URL', get_template_directory_uri() . '/assets/vendor/alids' );
}

if ( ! defined( 'ADS_PATH' ) ) {
    define( 'ADS_PATH', trailingslashit( get_template_directory() ) . 'assets/vendor/alids/' );
}

if ( ! defined( 'ADS_CUR' ) ) {
    define( 'ADS_CUR', 'USD' );
}

if ( ! defined( 'ADS_MAIN_CUR' ) ) {
    define( 'ADS_MAIN_CUR', ADS_CUR );
}

if ( ! defined( 'ADS_ERROR' ) ) {
    define( 'ADS_ERROR', false );
}

// -----------------------------------------------------------------------------
// Helper functions used throughout the theme
// -----------------------------------------------------------------------------
if ( ! function_exists( 'ads_is_url' ) ) {
    function ads_is_url( $url ) {
        return (bool) filter_var( $url, FILTER_VALIDATE_URL );
    }
}

if ( ! function_exists( 'ads_get_image_by_id' ) ) {
    function ads_get_image_by_id( $id, $size = 'full' ) {
        $image = wp_get_attachment_image_src( $id, $size );

        return $image ? $image[0] : '';
    }
}

if ( ! function_exists( 'ads_get_size_img' ) ) {
    function ads_get_size_img( $url, $size = 'full' ) {
        // When we only have a URL we simply return it; attachment IDs are not
        // available without the plugin database structure.
        return $url;
    }
}

if ( ! function_exists( 'ads_price_convert' ) ) {
    function ads_price_convert( $value, $currency = 'USD' ) {
        return floatval( $value );
    }
}

if ( ! function_exists( 'ads_price_out_current_front' ) ) {
    function ads_price_out_current_front( $value ) {
        $currencies = ads_get_list_currency();
        $symbol     = isset( $currencies[ ADS_CUR ]['symbol'] ) ? $currencies[ ADS_CUR ]['symbol'] : '$';

        return sprintf( '%s%s', $symbol, number_format_i18n( floatval( $value ), 2 ) );
    }
}

if ( ! function_exists( 'ads_get_list_currency' ) ) {
    function ads_get_list_currency() {
        return [
            'USD' => [
                'title'  => 'US Dollar',
                'symbol' => '$',
                'flag'   => 'usa.png',
            ],
            'EUR' => [
                'title'  => 'Euro',
                'symbol' => '€',
                'flag'   => 'eu.png',
            ],
            'GBP' => [
                'title'  => 'British Pound',
                'symbol' => '£',
                'flag'   => 'uk.png',
            ],
        ];
    }
}

if ( ! function_exists( 'ads_set_custom_title' ) ) {
    function ads_set_custom_title( $before = '', $after = '' ) {
        return $before . get_the_title() . $after;
    }
}

if ( ! function_exists( 'ads_list_currency' ) ) {
    function ads_list_currency() {
        return array_keys( ads_get_list_currency() );
    }
}

if ( ! function_exists( 'pachFlag' ) ) {
    function pachFlag( $flag ) {
        // Transparent 1x1 gif placeholder keeps markup intact without requiring
        // the plugin flag assets.
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    }
}

if ( ! function_exists( 'ads_get_list_contries' ) ) {
    function ads_get_list_contries( $selected = '' ) {
        $countries = [
            'US' => __( 'United States', 'elgreco' ),
            'GB' => __( 'United Kingdom', 'elgreco' ),
            'CA' => __( 'Canada', 'elgreco' ),
            'AU' => __( 'Australia', 'elgreco' ),
        ];

        foreach ( $countries as $code => $label ) {
            printf(
                '<option value="%1$s" %2$s>%3$s</option>',
                esc_attr( $code ),
                selected( $selected, $code, false ),
                esc_html( $label )
            );
        }
    }
}

if ( ! function_exists( 'ads_shuffle_assoc' ) ) {
    function ads_shuffle_assoc( $list ) {
        if ( is_array( $list ) ) {
            shuffle( $list );
        }

        return $list;
    }
}

if ( ! function_exists( 'ads_recently_viewed_ids' ) ) {
    function ads_recently_viewed_ids() {
        return [];
    }
}

if ( ! function_exists( 'ads_check_status_access' ) ) {
    function ads_check_status_access( $status ) {
        return true;
    }
}

if ( ! function_exists( 'ads_name_status_access' ) ) {
    function ads_name_status_access( $status ) {
        return is_string( $status ) ? $status : '';
    }
}

if ( ! function_exists( 'ads_get_orderby_param' ) ) {
    function ads_get_orderby_param() {
        return isset( $_GET['orderby'] ) ? sanitize_text_field( wp_unslash( $_GET['orderby'] ) ) : '';
    }
}

if ( ! function_exists( 'ads_get_order_param' ) ) {
    function ads_get_order_param() {
        return isset( $_GET['order'] ) ? sanitize_text_field( wp_unslash( $_GET['order'] ) ) : '';
    }
}

if ( ! function_exists( 'ads_sortby_list' ) ) {
    function ads_sortby_list() {
        return [
            'date'  => __( 'Date', 'elgreco' ),
            'price' => __( 'Price', 'elgreco' ),
            'rate'  => __( 'Rating', 'elgreco' ),
        ];
    }
}

if ( ! function_exists( 'ads_get_shipping_titles' ) ) {
    function ads_get_shipping_titles() {
        return [];
    }
}

// -----------------------------------------------------------------------------
// Shortcodes and AJAX handlers used by bundled templates
// -----------------------------------------------------------------------------
if ( ! shortcode_exists( 'ads_account' ) ) {
    add_shortcode( 'ads_account', function () {
        return '<div class="ads-placeholder">' . esc_html__( 'Account features require the AliDropship plugin.', 'elgreco' ) . '</div>';
    } );
}

if ( ! shortcode_exists( 'ads_orders' ) ) {
    add_shortcode( 'ads_orders', function () {
        return '<div class="ads-placeholder">' . esc_html__( 'Order history is unavailable without the AliDropship plugin.', 'elgreco' ) . '</div>';
    } );
}

// Keep AJAX endpoints from breaking when the plugin is not present.
add_action( 'wp_ajax_nopriv_ads_actions', '__return_null' );
add_action( 'wp_ajax_ads_actions', '__return_null' );

// -----------------------------------------------------------------------------
// Minimal namespace stub for product handling
// -----------------------------------------------------------------------------
if ( ! class_exists( 'adsProductStub' ) ) {
    class adsProductStub {
        public $post_id;

        public function __construct( $id = '', $args = [] ) {
            $this->post_id = $id instanceof WP_Post ? $id->ID : ( is_numeric( $id ) ? (int) $id : 0 );
        }

        public function setData( $post ) {
            $this->post_id = $post instanceof WP_Post ? $post->ID : 0;
        }

        public function getCurrency() {
            return ADS_CUR;
        }

        public function getPrice() {
            return 0;
        }

        public function getSalePrice() {
            return 0;
        }

        public function getRate() {
            return 0;
        }

        public function getPromotionVolume() {
            return 0;
        }

        public function getPack() {
            return '';
        }

        public function getAttributes() {
            return [];
        }

        public function getGallery() {
            return [];
        }

        public function getVideo() {
            return [];
        }

        public function getSku() {
            return [];
        }

        public function getSkuAttr() {
            return [];
        }

        public function getSizeAttr() {
            return [];
        }

        public function getVariationDefault() {
            return 'lowest_price';
        }

        public function getQuantity() {
            return 0;
        }

        public function getShipping() {
            return [];
        }

        public function renderShipping( $shipping ) {
            return '';
        }

        public function getImageUrl( $size = 'full' ) {
            if ( $this->post_id ) {
                return get_the_post_thumbnail_url( $this->post_id, $size );
            }

            return '';
        }
    }
}

if ( ! class_exists( '\\ads\\adsProduct' ) ) {
    // phpcs:ignore PSR1.Classes.ClassDeclaration.MissingNamespace
    class_alias( 'adsProductStub', '\\ads\\adsProduct' );
}

