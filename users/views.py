from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from . models import CustomUser
from .utils.discord_logger import log_user_registration, log_user_login, log_security_event
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json


def loginUser(request):
    if request.user.is_authenticated:
        if request.user.access == False:
            return redirect('waiting-page')
        else:
            return redirect('sections_list')

    if request.method == 'POST':
        username = request.POST['username'].lower()
        password = request.POST['password']

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            messages.error(request, 'Username does not exist')
            return render(request, 'users/login.html')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Log successful login
            log_user_login(request, user)
            if user.access == False:
                return redirect('waiting-page')
            else:
                return redirect('sections_list')
        else:
            messages.error(request, "Username or Password is incorrect")

    return render(request, 'users/login.html')


def registerUser(request):
    if request.user.is_authenticated:
        if request.user.access == False:
            return redirect('waiting-page')
        else:
            return redirect('sections_list')
    form = CustomUserCreationForm()
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            # Log successful registration
            log_user_registration(request, user)
            return redirect('login')
    context = {'form': form}

    return render(request, 'users/register.html', context)


def logoutUser(request):
    logout(request)
    return redirect('landing-page')


def landingPage(request):
    return render(request, 'landing-p.html')


def waitingPage(request):
    if request.user.is_authenticated:
        if request.user.access == True:
            return redirect('sections_list')

    return render(request, 'waiting-p.html')


@csrf_exempt
def log_security_event_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            event_type = data.get('type', 'unknown')
            description = data.get('description', 'No description provided')

            if request.user.is_authenticated:
                log_security_event(request, request.user,
                                   event_type, description)
                return JsonResponse({'status': 'success'})
            else:
                # For unauthenticated users, still log but with anonymous user info
                log_security_event(request, None, event_type,
                                   f"Anonymous user: {description}")
                return JsonResponse({'status': 'success'})

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
