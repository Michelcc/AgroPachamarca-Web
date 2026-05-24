FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) curl gd \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY public_html/ /var/www/html/

RUN mkdir -p assets/uploads \
    && chown -R www-data:www-data assets/uploads \
    && sed -i '/AllowOverride None/c/AllowOverride All' /etc/apache2/apache2.conf

EXPOSE 80
