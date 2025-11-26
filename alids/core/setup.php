<?php

/**
 * Setup the plugin
 */
function ads_install() {

	require( ADS_PATH . 'core/sql.php' );

	require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

	foreach( ads_sql_list() as $key ) {
		dbDelta($key);
    }

	ads_maybe_add_columns();

	ads_alter_transact();
    ads_delete_product_is_empty_post();

    update_option( 'comments_notify', '' );
    update_option( 'moderation_notify', '' );
	update_option( 'ads-version', ADS_VERSION  );

    adsSetFrontPage();

	add_rewrite_rule( '^oauth1/extension/?$','index.php?rest_oauth1=extension','top' );

	flush_rewrite_rules();
}

function ads_get_post_by_name($post_name, $output = OBJECT) {
    global $wpdb;
    $post = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_name = %s AND post_type='post'", $post_name ));
    if ( $post )
        return get_post($post, $output);

    return null;
}

function adsSetFrontPage() {

    update_option( 'show_on_front', 'page' );

    $home = get_page_by_path('home');

    if ( $home ) {
        $id = $home->ID;
    } else {
        $home_post = ads_get_post_by_name( 'home' );
        if($home_post){
            $id = $home_post->ID;
        }else{
            $id = wp_insert_post( [
                'post_type'    => 'page',
                'post_title'   => __( 'Home', 'ads' ),
                'post_name'    => 'home',
                'post_content' => '',
                'post_status'  => 'publish',
                'post_author'  => 1,
            ] );
        }
    }

    update_option( 'page_on_front', $id );

    $blog = get_page_by_path( 'blog' );

    if ( $blog ) {
        $id = $blog->ID;
    } else {
        $id = wp_insert_post( [
            'post_type'    => 'page',
            'post_title'   => __( 'Blog', 'ads' ),
            'post_name'    => 'blog',
            'post_content' => '',
            'post_status'  => 'publish',
            'post_author'  => 1,
        ] );
    }

    update_option( 'page_for_posts', $id );
}

function ads_maybe_add_columns() {

	global $wpdb;

	$args = [
		'ads_products_meta' => [
			'video' => "ALTER TABLE `{$wpdb->prefix}ads_products_meta` ADD `video` TEXT DEFAULT NULL;",
			'variation_default' => "ALTER TABLE `{$wpdb->prefix}ads_products_meta` ADD `variation_default` VARCHAR(255) DEFAULT 'lowest_price';",
        ],

        'payment_transaction' => [
            'amount_purchase'     => "ALTER TABLE `{$wpdb->prefix}payment_transaction` ADD amount_purchase DECIMAL(12,2) DEFAULT '0'",
            'amount_purchase_ali' => "ALTER TABLE `{$wpdb->prefix}payment_transaction` ADD `amount_purchase_ali` DECIMAL(12,2) DEFAULT '0';",
            'cpf'                 => "ALTER TABLE `{$wpdb->prefix}payment_transaction` ADD `cpf` VARCHAR(255) DEFAULT NULL;",
            'cpf2'                 => "ALTER TABLE `{$wpdb->prefix}payment_transaction` ADD `cpf2` VARCHAR(255) DEFAULT NULL;",
            'adminDescription'    => "ALTER TABLE `{$wpdb->prefix}payment_transaction` ADD `adminDescription` TEXT DEFAULT NULL;", //add 15.01.2021
            'fulfillment'         => "ALTER TABLE `{$wpdb->prefix}payment_transaction`  ADD `fulfillment` VARCHAR(255) DEFAULT 'not_processed';"
        ],
        'ads_orders_item' => [
            'amount_purchase_ali' => "ALTER TABLE `{$wpdb->prefix}ads_orders_item` ADD `amount_purchase_ali` DECIMAL(12,2) DEFAULT '0';",
        ],
        'ads_shipping' => [
            'min_cost_enabled'     => "ALTER TABLE `{$wpdb->prefix}ads_shipping` ADD min_cost_enabled DECIMAL(12,2) DEFAULT '0'",
        ],
        'payment_discount' => [
            'enabled_apply_email'     => "ALTER TABLE `{$wpdb->prefix}payment_discount` ADD enabled_apply_email INT(1) DEFAULT '0'",
            'apply_to_email'      => "ALTER TABLE `{$wpdb->prefix}payment_discount` ADD apply_to_email LONGTEXT DEFAULT NULL",
        ],
        'ads_categories' => [
            'category_image'     => "ALTER TABLE `{$wpdb->prefix}ads_categories` ADD category_image BIGINT(20) DEFAULT '0'",
            'category_menu_image'     => "ALTER TABLE `{$wpdb->prefix}ads_categories` ADD category_menu_image BIGINT(20) DEFAULT '0'",
        ]
	];

	foreach( $args as $key => $val ) {

		$result = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT *
			 	 FROM `information_schema`.`COLUMNS`
			 	 WHERE `TABLE_SCHEMA` = '%s' AND `TABLE_NAME` = '{$wpdb->prefix}{$key}'",
				DB_NAME
			)
		);

		$col = [];
		if( count($result) > 0 ) foreach( $result as $column ) {
			$col[] = $column->COLUMN_NAME;
		}

		if( count($col) > 0 ) foreach( $val as $k => $v ) {
			if( ! in_array( $k, $col ) )
				$wpdb->query( $v );
		}
	}
}

function ads_alter_transact() {

	global $wpdb;

	$result = $wpdb->prepare(
		"SELECT *
		 FROM `information_schema`.`COLUMNS`
	     WHERE `TABLE_SCHEMA` = '%s' AND
            `TABLE_NAME` = '{$wpdb->prefix}ads_ali_meta' AND
            `COLUMN_NAME` = 'product_id'",
		DB_NAME
	);

	$row = $wpdb->get_row( $result );

	if( $row && $row->IS_NULLABLE == 'NO' ) {

		$wpdb->query(
			"ALTER TABLE `{$wpdb->prefix}ads_ali_meta`
			 CHANGE `product_id` `product_id` VARCHAR(20)
			 CHARACTER SET $wpdb->charset COLLATE $wpdb->collate NULL DEFAULT NULL;"
		);
	}
}

function ads_delete_product_is_empty_post() {

    global $wpdb;

    $wpdb->query("DELETE al.* FROM {$wpdb->prefix}ads_ali_meta al LEFT JOIN {$wpdb->prefix}posts p  ON al.post_id = p.ID WHERE p.ID is NUll;");
    $wpdb->query("DELETE al.* FROM {$wpdb->prefix}ads_products al LEFT JOIN {$wpdb->prefix}posts p  ON al.post_id = p.ID WHERE p.ID is NUll;");
    $wpdb->query("DELETE al.* FROM {$wpdb->prefix}ads_products_meta al LEFT JOIN {$wpdb->prefix}posts p  ON al.post_id = p.ID WHERE p.ID is NUll;");
    $wpdb->query("DELETE al.* FROM {$wpdb->prefix}ads_attributes al LEFT JOIN {$wpdb->prefix}posts p  ON al.post_id = p.ID WHERE p.ID is NUll;");
}

/**
 * Check installed plugin
 */
function ads_installed() {

	if( ! current_user_can('install_plugins') )
        return;

	if ( get_option( 'ads-version', 0 ) < ADS_VERSION ) {
		ads_install();
    }
}
add_action( 'init', 'ads_installed', 0 );

/**
 * When activate plugin
 */
function ads_activate() {

	ads_installed();

	do_action('ads_activate');
}

/**
 * When deactivate plugin
 */
function ads_deactivate() {

	do_action('ads_deactivate');
}
