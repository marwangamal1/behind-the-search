import json
import time
import socket
import requests
from datetime import datetime
from django.utils import timezone
from django.conf import settings


def get_client_ip(request):
    """Get the client's real IP address, handling proxy servers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_location_info(ip):
    """Get location info using socket and DNS lookup (free method)"""
    default_info = {
        'country': 'Unknown',
        'city': 'Unknown',
        'region': 'Unknown',
        'hostname': 'Unknown'
    }

    try:
        if ip in ['127.0.0.1', 'localhost', '::1']:
            return {
                'country': 'Local',
                'city': 'Development',
                'region': 'Local',
                'hostname': 'localhost'
            }

        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except (socket.herror, socket.gaierror):
            return default_info

        # Try to get country code from hostname TLD
        country = 'Unknown'
        if '.' in hostname:
            tld = hostname.split('.')[-1]
            if len(tld) == 2:  # Likely a country code
                country = tld.upper()

        return {
            'country': country,
            'city': 'Unknown',
            'region': hostname,
            'hostname': hostname
        }
    except Exception as e:
        print(f"Error getting location info: {e}")
        return default_info


def format_timestamp():
    """Format current time in UTC"""
    try:
        return timezone.now().isoformat()
    except Exception as e:
        print(f"Error formatting timestamp: {e}")
        return datetime.utcnow().isoformat()


def create_base_embed(title, color):
    """Create a base embed with consistent styling"""
    return {
        'title': title,
        'color': color,
        'fields': [],
        'timestamp': format_timestamp(),
        'footer': {
            'text': 'Made by Front2back',
            'icon_url': 'https://i.postimg.cc/1XvRJc27/front2back.png'
        },
        'author': {
            'name': 'Front2back',
            'icon_url': 'https://i.postimg.cc/1XvRJc27/front2back.png'
        }
    }


def send_discord_log(webhook_type, embed_data):
    """Send log to specific Discord webhook based on type"""
    try:
        webhook_url = settings.DISCORD_WEBHOOKS.get(webhook_type)
        if not webhook_url:
            print(f"No webhook URL configured for type: {webhook_type}")
            return

        response = requests.post(webhook_url, json={'embeds': [embed_data]})
        if response.status_code != 204:
            print(f"Failed to send Discord webhook: {response.status_code}")
    except Exception as e:
        print(f"Error sending Discord webhook: {e}")


def create_basic_embed_data(request, user, title, color):
    """Create basic embed data structure with common fields"""
    try:
        ip = get_client_ip(request)
        location = get_location_info(ip)

        embed = create_base_embed(title, color)

        # Handle user info based on authentication status
        if user and user.is_authenticated:
            user_info = (
                f"**Username:** {str(user.username)}\n"
                f"───────────\n"
                f"**Full Name:** {str(user.full_name)}\n"
                f"───────────\n"
                f"**Email:** {str(user.email)}\n"
                f"───────────\n"
                f"**Phone:** {str(user.phone_number)}"
            )
        else:
            user_info = "**User:** Anonymous"

        embed['fields'] = [
            {
                'name': '👤 User Info',
                'value': user_info,
                'inline': True
            },
            {
                'name': '\u200b',  # Invisible character for spacing
                'value': '\u200b',
                'inline': True
            },
            {
                'name': '🌐 Network Info',
                'value': f"**IP:** {str(ip)}\n───────────\n**Location:** {str(location.get('country', 'Unknown'))}\n───────────\n**Host:** {str(location.get('hostname', 'Unknown'))}",
                'inline': True
            }
        ]

        return embed
    except Exception as e:
        print(f"Error creating basic embed data: {e}")
        # Create a minimal embed with the error info
        embed = create_base_embed(title, color)
        embed['fields'] = [
            {
                'name': '⚠️ Error Info',
                'value': f"Could not create full embed: {str(e)}",
                'inline': False
            },
            {
                'name': '🌐 Basic Info',
                'value': f"IP: {get_client_ip(request)}\nUser: {'Authenticated' if user and user.is_authenticated else 'Anonymous'}",
                'inline': False
            }
        ]
        return embed


def log_user_registration(request, user):
    try:
        embed = create_basic_embed_data(
            request, user, '✨ New User Registration', 0x2ecc71)  # Green
        send_discord_log('registration', embed)
    except Exception as e:
        print(f"Error in log_user_registration: {e}")


def log_user_login(request, user):
    try:
        embed = create_basic_embed_data(
            request, user, '🔓 User Login', 0x3498db)  # Blue
        send_discord_log('login', embed)
    except Exception as e:
        print(f"Error in log_user_login: {e}")


def log_video_watch(request, user, video):
    try:
        embed = create_basic_embed_data(
            request, user, '📺 Video Watched', 0x9b59b6)  # Purple
        embed['fields'].extend([
            {
                'name': '\u200b',
                'value': '\u200b',
                'inline': False
            },
            {
                'name': '🎥 Content Info',
                'value': f"**Video:** {str(video.title)}\n───────────\n**Section:** {str(video.section.title) if video.section else 'N/A'}",
                'inline': False
            }
        ])
        send_discord_log('video_watch', embed)
    except Exception as e:
        print(f"Error in log_video_watch: {e}")


def log_page_visit(request, user, page_name, duration):
    try:
        embed = create_basic_embed_data(
            request, user, '🔍 Page Visit', 0xf1c40f)  # Yellow
        embed['fields'].extend([
            {
                'name': '\u200b',
                'value': '\u200b',
                'inline': False
            },
            {
                'name': '📄 Page Details',
                'value': f"**Page:** {str(page_name)}\n───────────\n**Duration:** {duration:.2f} seconds",
                'inline': False
            }
        ])
        send_discord_log('page_visit', embed)
    except Exception as e:
        print(f"Error in log_page_visit: {e}")


def log_security_event(request, user, event_type, description):
    try:
        embed = create_basic_embed_data(
            request, user, '⚠️ Security Event', 0xe74c3c)  # Red
        embed['fields'].extend([
            {
                'name': '\u200b',
                'value': '\u200b',
                'inline': False
            },
            {
                'name': '🛡️ Event Details',
                'value': f"**Type:** {str(event_type)}\n───────────\n**Description:** {str(description)}",
                'inline': False
            },
            {
                'name': '🌐 Browser Info',
                'value': f"**User Agent:** {str(request.META.get('HTTP_USER_AGENT', 'Unknown'))}",
                'inline': False
            }
        ])
        send_discord_log('security', embed)
    except Exception as e:
        print(f"Error in log_security_event: {e}")
