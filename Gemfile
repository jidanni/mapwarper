source 'https://rubygems.org'


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.2'
# Use sqlite3 as the database for Active Record
#gem 'sqlite3'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.5'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'
# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer',  platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
gem 'jquery-ui-rails', '3.0.1'  #loads jquery ui v 1.9.2
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
# gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0',          group: :doc

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use unicorn as the app server
# gem 'unicorn'

# Use debugger
# gem 'debugger', group: [:development, :test]

gem 'devise', '~> 3'
gem 'devise-encryptable'

gem 'omniauth', '~> 1.8'
gem 'omniauth-oauth2'#, "~> 1.2.0" #prev 1.2.0
gem 'omniauth-twitter'
gem 'omniauth-osm'
gem 'omniauth-github'
gem "omniauth-mediawiki", git: 'https://github.com/timwaters/omniauth-mediawiki', branch: 'raw_info_before'

gem 'pg', '~>0.21'
gem 'activerecord-postgis-adapter'

gem 'acts-as-taggable-on', '~> 3.3.0'
gem 'paperclip', '~> 4.2.4'
gem 'acts_as_commentable'
gem 'will_paginate', '~> 3.0'
gem 'spawnling', '~>2.1'

#Rails 4 support for the audited (acts_as_audited gem) is not quite rails4 worthy - see #https://github.com/collectiveidea/audited/pull/166
gem 'audited-activerecord', git: 'https://github.com/timwaters/audited', branch: 'rails4'  

gem 'georuby'
gem 'geoplanet'
gem 'yql', '0.0.2'

gem 'redcarpet'

gem 'rails-api'
#gem 'active_model_serializers' rubygem is v0.9.0
#use 10.0 from github until release as it has json-api support
gem 'active_model_serializers', git: 'https://github.com/rails-api/active_model_serializers', tag: 'v0.10.0.rc5'

gem 'simple_token_authentication', '~> 1.0'
gem 'rack-cors', :require => 'rack/cors'

gem 'actionpack-action_caching', git: 'https://github.com/timwaters/actionpack-action_caching', branch: 'feature/take_format_from_request'
gem 'redis-rails', '~> 4'

group :development do
   gem 'spring'
   gem 'thin'
   gem 'capistrano-rails',    :require => false
   gem 'capistrano-bundler',  :require => false
   gem 'rvm1-capistrano3',    :require => false
end

group :test do
  gem 'mocha'
  gem 'factory_girl_rails'
  gem 'webmock'
end
