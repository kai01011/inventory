<?php

return [
    'show_warnings' => false,
    'public_path' => null,
    'convert_entities' => true,
    'options' => [
        'font_dir' => storage_path('fonts'),
        'font_cache' => storage_path('fonts'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),
        'allowed_protocols' => [
            'data://' => ['rules' => []],
            'file://' => ['rules' => []],
            'http://' => ['rules' => []],
            'https://' => ['rules' => []],
        ],
        'artifactPathValidation' => null,
        'log_output_file' => null,
        'enable_font_subsetting' => true,
        'pdf_backend' => 'auto',
        'default_media_type' => 'print',
        'default_paper_size' => 'letter',
        'default_paper_orientation' => 'portrait',
        'default_font' => 'serif',
        'dpi' => 150,
        'enable_php' => false,
        'enable_javascript' => true,
        'enable_remote' => false,
        'allowed_remote_hosts' => null,
        'font_height_ratio' => 1.1,
        'enable_html5_parser' => true,
    ],
];