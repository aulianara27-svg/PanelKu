/**
 * Nginx Configuration Generator for COLES CONTROL
 * Handles path-based hosting for students (e.g., coles.id/student/{username})
 */

interface StudentSiteConfig {
  username: string;
  documentRoot: string;
  phpVersion: string;
  path: string;
}

interface NginxConfigOptions {
  domain: string;
  studentSites: StudentSiteConfig[];
  sslEnabled?: boolean;
  mainSiteRoot?: string;
}

/**
 * Generates Nginx configuration with student path aliases
 * 
 * Example output:
 * server {
 *   listen 80;
 *   server_name coles.id;
 *   
 *   # Main site
 *   root /var/www/coles.id/public;
 *   
 *   # Student: budi123 -> coles.id/student/budi123
 *   location /student/budi123 {
 *     alias /var/www/student/budi123/public;
 *     try_files $uri $uri/ /student/budi123/index.php?$query_string;
 *   }
 *   
 *   location ~ ^/student/budi123/(.*)\.php$ {
 *     alias /var/www/student/budi123/public/$1.php;
 *     fastcgi_pass unix:/run/php/php8.2-fpm.sock;
 *     ...
 *   }
 * }
 */
export function generateNginxConfig(options: NginxConfigOptions): string {
  const { domain, studentSites, sslEnabled = false, mainSiteRoot = '/var/www/coles.id/public' } = options;

  let config = `# COLES CONTROL - Auto-generated Nginx Configuration
# Domain: ${domain}
# Generated: ${new Date().toISOString()}
# Student Sites: ${studentSites.length}

server {
    listen ${sslEnabled ? 443 : 80}${sslEnabled ? ' ssl http2' : ''};
    server_name ${domain};
    
    ${sslEnabled ? `
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ` : ''}

    # Main site root
    root ${mainSiteRoot};
    index index.php index.html index.htm;

    # Logging
    access_log /var/log/nginx/${domain}.access.log;
    error_log /var/log/nginx/${domain}.error.log;

    # Main site location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Static file caching
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

`;

  // Add student site locations
  studentSites.forEach((site) => {
    config += generateStudentLocationBlock(domain, site);
  });

  config += `
    # PHP-FPM for main site
    location ~ \\.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    # Deny access to hidden files
    location ~ /\\. {
        deny all;
    }
}
`;

  // Add HTTP to HTTPS redirect if SSL is enabled
  if (sslEnabled) {
    config += `
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${domain};
    return 301 https://$server_name$request_uri;
}
`;
  }

  return config;
}

/**
 * Generates a location block for a student site
 */
function generateStudentLocationBlock(domain: string, site: StudentSiteConfig): string {
  const { username, documentRoot, phpVersion, path } = site;
  const studentPath = path.startsWith('/') ? path : `/${path}`;
  
  return `
    # ========================================
    # Student: ${username}
    # Path: ${studentPath}
    # ========================================

    # Student static files
    location ~ ^${studentPath}/(.*\\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot))$ {
        alias ${documentRoot}/$1;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Student PHP files
    location ~ ^${studentPath}/(.*)\\.php$ {
        alias ${documentRoot}/$1.php;
        
        # Check if file exists
        if (!-f $request_filename) {
            return 404;
        }

        fastcgi_pass unix:/run/php/php${phpVersion}-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        
        # Set correct SCRIPT_FILENAME for alias
        fastcgi_param SCRIPT_FILENAME ${documentRoot}/$1.php;
        
        # Set custom PATH_INFO for student apps
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param PATH_TRANSLATED ${documentRoot}/$1.php;
        
        # Pass student path to PHP
        fastcgi_param STUDENT_PATH ${studentPath};
        fastcgi_param STUDENT_USERNAME ${username};
    }

    # Student main location (catch-all for Laravel/Symfony)
    location ${studentPath} {
        alias ${documentRoot};
        
        # Try static files first, then pass to index.php
        try_files $uri $uri/ ${studentPath}/index.php?$query_string;
        
        # Disable caching for dynamic content
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

`;
}

/**
 * Generates regex pattern for student path matching
 */
export function generateStudentPathRegex(studentPaths: string[]): string {
  if (studentPaths.length === 0) return '';
  return `^(${studentPaths.map(p => p.replace(/^\//, '')).join('|')})(/.*)?$`;
}

/**
 * Example: Generate config for a single student
 */
export function generateSingleStudentConfig(
  domain: string,
  username: string,
  documentRoot: string,
  phpVersion: string = '8.2'
): string {
  const config = generateNginxConfig({
    domain,
    studentSites: [{ username, documentRoot, phpVersion, path: `/student/${username}` }],
    sslEnabled: true
  });
  
  return config;
}

/**
 * Generate APP_URL for student's .env file
 */
export function generateStudentAppUrl(domain: string, username: string): string {
  return `https://${domain}/student/${username}`;
}

/**
 * Generate sample .env patch command
 */
export function generateEnvPatchCommand(username: string, domain: string): string {
  const appUrl = generateStudentAppUrl(domain, username);
  return `# Update student's .env file
sed -i "s|APP_URL=.*|APP_URL=${appUrl}|g" /var/www/student/${username}/.env
sed -i "s|ASSET_URL=.*|ASSET_URL=${appUrl}|g" /var/www/student/${username}/.env

# Fix Laravel's url() helper for subdirectory
echo "ASSET_URL=${appUrl}" >> /var/www/student/${username}/.env`;
}

export default {
  generateNginxConfig,
  generateSingleStudentConfig,
  generateStudentPathRegex,
  generateStudentAppUrl,
  generateEnvPatchCommand
};
