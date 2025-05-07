from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponseForbidden
from functools import wraps

def superuser_required(view_func):
    return user_passes_test(lambda u: u.is_superuser)(view_func)



def access_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = request.user
        if user.is_authenticated and user.access:
            return view_func(request, *args, **kwargs)
        return HttpResponseForbidden("You do not have access to this resource.")
    
    return _wrapped_view
