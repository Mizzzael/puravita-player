const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtract = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    mode: 'development',
    entry: {
        'puravita-player': path.join(__dirname, '/src/app', 'puravita-player'),
        app: path.join(__dirname, 'src', 'index.ts'),
        'puravita-player-css': path.join(__dirname, '/src/assets/style/puravita-css', 'index.styl'),
    },
    watch: true,
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].min.js',
        chunkFilename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, '/src/templates/views/home.html'),
        }),
        new MiniCssExtract({ filename: '[name].min.css', chunkFilename: '[id].css' }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/assets/images/',
                    to: 'assets/images/',
                },
                {
                    from: './src/assets/video/',
                    to: 'assets/video/',
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /.js?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['@babel/preset-env'] },
                },
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                },
            },
            {
                test: /\.(styl)$/,
                use: [
                    {
                        loader: MiniCssExtract.loader,
                        options: {
                            publicPath: './',
                        },
                    },
                    'css-loader',
                    'stylus-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtract.loader,
                        options: {
                            publicPath: './',
                        },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        },
                    },
                ],
            },
            {
                test: /\.(jpg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'source-map',
};

if (config.mode === 'development') {
    config.devServer = {
        contentBase: path.join(__dirname, '/dist/'),
        inline: true,
        host: 'localhost',
        port: 8080,
    };
}

module.exports = config;
