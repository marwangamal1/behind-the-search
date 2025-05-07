import time
from .utils.discord_logger import log_page_visit

class PageDurationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only track for authenticated users
        if request.user.is_authenticated:
            current_path = request.path
            current_time = time.time()
            
            # Get the previous page info from session
            prev_path = request.session.get('current_page')
            start_time = request.session.get('page_start_time')
            
            # If there was a previous page, log its duration
            if prev_path and start_time and prev_path != current_path:
                duration = current_time - float(start_time)
                # Only log if duration is significant (more than 1 second)
                if duration > 1 and any(prev_path.startswith(prefix) for prefix in ['/content/', '/sections/']):
                    log_page_visit(request, request.user, prev_path.strip('/'), duration)
            
            # Store current page info
            request.session['current_page'] = current_path
            request.session['page_start_time'] = current_time
        
        response = self.get_response(request)
        return response
